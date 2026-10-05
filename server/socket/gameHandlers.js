import { rooms, broadcastRooms } from './roomHandlers.js'
import { applyResult, resolveWinners, buildRanking, nextInRound, firstInRound, canPlay } from '../lib/gameLogic.js'
import { computeBadges, BADGES } from '../lib/achievements.js'
import { getExercise } from '../services/aiExercises.js'
import { recordGame } from '../services/profiles.js'
import { makeForecast, drawFromForecast, penaltyFor } from '../lib/cards.js'

// ─────────────────────────────────────────────────────────────
// REGLAS
// - Cartas de 2 a 9 (sin 10) + As dorado muy raro. La dificultad sube con el valor.
// - Al empezar tu turno ves un PRONÓSTICO (probabilidad de cada carta) y decides.
// - En tu turno: PEDIR CARTA (respondes un ejercicio) o PLANTARTE (pasas este turno).
// - Aciertas → sumas el valor. Fallas → restas un tercio (redondeado, mínimo 1).
// - As: si lo aciertas eliges si vale 1 u 11.
// - Plantarse NO te saca de la partida: en la siguiente vuelta vuelves a jugar.
// - Si pasas de 21 quedas eliminado. Si llegas a 21 exacto ya no juegas más turnos.
// - La partida termina AL CERRAR UNA VUELTA si:
//     a) uno o varios jugadores tienen 21  → ganan todos esos
//     b) nadie pidió carta en toda la vuelta (todos se plantaron)
//        → gana el de mayor puntaje sin pasarse
//     c) ya no queda nadie que pueda jugar
// ─────────────────────────────────────────────────────────────

// games = Map<code, {
//   players, currentPlayerId, timer, usedExerciseIds, config,
//   currentExercise, cardDrawn, answered, fiftyUsed:Set, history: Map<playerId, []>,
//   round, drewThisRound
// }>
const games = new Map()

const RESULT_PAUSE_MS = 2500
const ACE_CHOICE_MS   = 15000

// Lo que viaja al cliente: SIN respuesta correcta ni explicación (anti-trampa)
function publicExercise(ex) {
  if (!ex) return null
  const { id, topic, difficulty, points, question, options } = ex
  return { id, topic, difficulty, points, question, options }
}

// Carta pública (todos la ven en la mesa): valor y dificultad, nunca el ejercicio
function publicCard(card) {
  return card ? { value: card.isAce ? 'A' : card.value, isAce: card.isAce, difficulty: card.difficulty, penalty: card.penalty } : null
}

const norm = (s) => String(s ?? '').trim()

export function registerGameHandlers(io, socket) {

  // ── Iniciar partida (solo host) ───────────────────────────
  socket.on('game:start', async (_, cb) => {
    const code = socket.data.roomCode
    const room = rooms.get(code)

    if (!room) return cb?.({ ok: false, error: 'Sala no encontrada' })
    if (room.hostId !== socket.id) return cb?.({ ok: false, error: 'Solo el host puede iniciar' })
    if (room.players.length < 2) return cb?.({ ok: false, error: 'Mínimo 2 jugadores' })

    // Evita partidas duplicadas si el host da varios clics
    if (room.phase === 'playing' || games.has(code)) {
      socket.emit('game:started', { players: games.get(code)?.players ?? room.players })
      return cb?.({ ok: true })
    }

    room.phase = 'playing'

    // Orden de turnos aleatorio
    const players = room.players.map(p => ({ ...p, status: 'active', points: 0, passed: false, left: false, streak: 0, maxStreak: 0 }))
    shuffleInPlace(players)
    players.forEach((p, i) => { p.turnOrder = i })

    const game = {
      players,
      currentPlayerId: players[0].id,
      timer:           null,
      usedExerciseIds: new Set(),
      config:          room.config,
      currentExercise: null,
      cardDrawn:       false,
      answered:        false,
      fiftyUsed:       new Set(),
      history:         new Map(players.map(p => [p.id, []])),
      round:           1,
      drewThisRound:   false,
    }
    games.set(code, game)

    io.to(code).emit('game:started', { players })
    io.to(code).emit('game:round_start', { round: 1 })
    broadcastRooms(io)
    console.log(`[game] iniciada en sala ${code}`)
    cb?.({ ok: true })

    await startTurn(io, code)
  })

  // ── Acción del jugador: PEDIR CARTA o PLANTARSE (pasar turno) ──
  socket.on('game:action', async ({ type } = {}, cb) => {
    const code = socket.data.roomCode
    const game = games.get(code)
    if (!game) return cb?.({ ok: false, error: 'No hay partida' })
    if (game.currentPlayerId !== socket.id) return cb?.({ ok: false, error: 'No es tu turno' })

    if (type === 'stand') {
      // Si ya pediste carta, tienes que responderla
      if (game.cardDrawn) return cb?.({ ok: false, error: 'Ya pediste carta: debes responder' })

      clearTurnTimer(game)
      markPassed(io, code, game, socket.id)
      cb?.({ ok: true })
      await advanceTurn(io, code, game)
      return
    }

    if (type === 'draw') {
      if (!game.forecast) return cb?.({ ok: false, error: 'Aún no hay carta' })
      if (game.cardDrawn) return cb?.({ ok: true })
      game.cardDrawn     = true
      game.drewThisRound = true

      // La carta se decide AHORA (antes no existía → nadie puede espiarla)
      const card = drawFromForecast(game.forecast)
      card.penalty = card.isAce ? 1 : penaltyFor(card.value)
      game.card = card

      io.to(code).emit('game:card_drawn', { playerId: socket.id, card: publicCard(card) })
      announce(io, code, {
        type: card.isAce ? 'ace' : 'draw', playerId: socket.id,
        cardPoints: card.isAce ? 'A' : card.value, difficulty: card.difficulty,
      })
      cb?.({ ok: true, card: publicCard(card) })

      const exercise = await getExercise({ difficulty: card.difficulty, usedIds: game.usedExerciseIds, topics: game.config.topics })
      if (games.get(code) !== game || game.currentPlayerId !== socket.id || game.answered) return
      if (exercise) game.usedExerciseIds.add(exercise.id)
      game.currentExercise = { ...exercise, points: card.isAce ? 11 : card.value }

      socket.emit('game:exercise', { exercise: publicExercise(game.currentExercise), card: publicCard(card) })
    }
  })

  // ── Comodín 50/50 (uno por jugador por partida) ───────────
  socket.on('game:fifty', (_, cb) => {
    const code = socket.data.roomCode
    const game = games.get(code)
    if (!game) return cb?.({ ok: false, error: 'No hay partida' })
    if (game.currentPlayerId !== socket.id) return cb?.({ ok: false, error: 'No es tu turno' })
    if (!game.cardDrawn || game.answered) return cb?.({ ok: false, error: 'Primero pide carta' })
    if (game.fiftyUsed.has(socket.id)) return cb?.({ ok: false, error: 'Ya usaste tu 50/50' })

    const ex = game.currentExercise
    if (!ex?.options) return cb?.({ ok: false, error: 'La carta aún se está repartiendo' })
    const wrong = ex.options.filter(o => norm(o) !== norm(ex.correct_answer))
    shuffleInPlace(wrong)
    const remove = wrong.slice(0, 2)

    game.fiftyUsed.add(socket.id)
    io.to(code).emit('game:fifty_used', { playerId: socket.id })
    announce(io, code, { type: 'fifty', playerId: socket.id })
    cb?.({ ok: true, remove })
  })

  // ── Enviar respuesta ──────────────────────────────────────
  socket.on('game:answer', async ({ exerciseId, answer } = {}, cb) => {
    const code = socket.data.roomCode
    const game = games.get(code)
    if (!game) return cb?.({ ok: false })
    if (game.currentPlayerId !== socket.id) return cb?.({ ok: false, error: 'No es tu turno' })

    const exercise = game.currentExercise
    if (!exercise || exercise.id !== exerciseId || game.answered) return cb?.({ ok: false })

    clearTurnTimer(game)
    game.answered = true
    const correct = norm(answer) === norm(exercise.correct_answer)
    cb?.({ ok: true, correct })

    // As acertado → el jugador elige si vale 1 u 11
    if (correct && game.card?.isAce) {
      const player = game.players.find(p => p.id === socket.id)
      game.awaitingAce = { answer }
      socket.emit('game:ace_choice', { points: player?.points ?? 0, timeLimit: ACE_CHOICE_MS / 1000 })
      announce(io, code, { type: 'ace_choice', playerId: socket.id })
      game.timer = setTimeout(() => {
        if (games.get(code) !== game || !game.awaitingAce) return
        const pts = player?.points ?? 0
        chooseAce(io, code, game, socket.id, pts + 11 <= 21 ? 11 : 1)
      }, ACE_CHOICE_MS)
      return
    }

    await resolveAnswer(io, code, game, socket.id, answer, correct)
  })

  // ── Elegir valor del As (1 u 11) ──────────────────────────
  socket.on('game:ace', ({ value } = {}, cb) => {
    const code = socket.data.roomCode
    const game = games.get(code)
    if (!game || game.currentPlayerId !== socket.id || !game.awaitingAce) return cb?.({ ok: false })
    if (value !== 1 && value !== 11) return cb?.({ ok: false, error: 'El As vale 1 u 11' })
    cb?.({ ok: true })
    chooseAce(io, code, game, socket.id, value)
  })

  // ── Si alguien se va o se desconecta en plena partida ─────
  const onLeave = () => {
    const code = socket.data.roomCode
    const game = code && games.get(code)
    if (!game) return
    const player = game.players.find(p => p.id === socket.id)
    if (!player || player.left) return

    player.left   = true
    player.status = player.status === 'active' ? 'standing' : player.status   // 'standing' = se fue
    io.to(code).emit('game:points_update', {
      playerId: player.id, points: player.points, status: player.status, left: true,
    })

    if (game.currentPlayerId === socket.id) {
      clearTurnTimer(game)
      advanceTurn(io, code, game)
    } else if (!game.players.some(canPlay)) {
      endGame(io, code, game)
    }
  }
  socket.on('room:leave', onLeave)
  socket.on('disconnect', onLeave)
}

// ── Helpers internos ──────────────────────────────────────

function markPassed(io, code, game, playerId, timeout = false) {
  const player = game.players.find(p => p.id === playerId)
  if (!player) return
  player.passed = true
  io.to(code).emit('game:points_update', {
    playerId, points: player.points, status: player.status, passed: true,
  })
  announce(io, code, { type: timeout ? 'timeout_pass' : 'pass', playerId, points: player.points })
}

function chooseAce(io, code, game, playerId, value) {
  clearTurnTimer(game)
  const { answer } = game.awaitingAce ?? {}
  game.awaitingAce = null
  resolveAnswer(io, code, game, playerId, answer, true, value)
}

async function resolveAnswer(io, code, game, playerId, answer, correct, aceValue = null) {
  const exercise = game.currentExercise ?? {}
  const card     = game.card ?? { value: exercise.points ?? 2, isAce: false, penalty: 1 }
  const player   = game.players.find(p => p.id === playerId)
  if (!player) return

  // Valor que se suma/resta: el As vale lo que eligió (o 1 al fallar)
  const value   = card.isAce ? (correct ? (aceValue ?? 11) : 1) : card.value
  const updated = applyResult({ player, value, correct })
  const delta   = updated.delta
  Object.assign(player, { points: updated.points, status: updated.status })
  player.streak    = correct ? (player.streak ?? 0) + 1 : 0
  player.maxStreak = Math.max(player.maxStreak ?? 0, player.streak)

  // Historial PRIVADO para el repaso final
  game.history.get(playerId)?.push({
    question:      exercise.question,
    options:       exercise.options,
    topic:         exercise.topic,
    difficulty:    card.difficulty ?? exercise.difficulty,
    points:        card.isAce ? 'A' : card.value,
    ace:           !!card.isAce,
    answer:        answer ?? null,          // null = se acabó el tiempo
    correctAnswer: exercise.correct_answer,
    correct,
    delta,
    explanation:   exercise.explanation ?? null,
  })

  // Resultado PRIVADO al jugador
  io.to(playerId).emit('game:turn_result', {
    exerciseId:    exercise.id,
    correct,
    pointsDelta:   delta,
    penalty:       correct ? 0 : card.penalty,
    aceValue:      card.isAce && correct ? value : null,
    explanation:   correct ? null : exercise.explanation,
    correctAnswer: correct ? null : exercise.correct_answer,
    newPoints:     player.points,
    timeout:       answer == null,
  })

  // Puntos a TODOS (sin el ejercicio)
  io.to(code).emit('game:points_update', {
    playerId,
    points: player.points,
    status: player.status,
    streak: player.streak,
    delta,
  })

  // Aviso para la mesa (sin pregunta ni respuesta)
  const type =
    player.status === 'eliminated' ? 'bust'
    : player.status === 'winner'   ? 'twentyone'
    : correct                      ? 'correct'
    : answer == null               ? 'timeout'
    : 'wrong'
  announce(io, code, {
    type, playerId, delta, points: player.points,
    cardPoints: card.isAce ? 'A' : card.value, difficulty: card.difficulty, topic: exercise.topic,
    streak: player.streak, ace: !!card.isAce, aceValue: card.isAce && correct ? value : null,
  })

  setTimeout(() => {
    if (games.get(code) === game) advanceTurn(io, code, game)
  }, RESULT_PAUSE_MS)
}

async function startTurn(io, code) {
  const game = games.get(code)
  if (!game) return

  const player = game.players.find(p => p.id === game.currentPlayerId)
  if (!player || !canPlay(player)) return advanceTurn(io, code, game)

  game.cardDrawn       = false
  game.answered        = false
  game.awaitingAce     = null
  game.currentExercise = null
  game.card            = null
  game.forecast        = makeForecast()

  const timeLimit = game.config.timeLimit

  // Todos ven de quién es el turno y el pronóstico de cartas (la carta aún no existe)
  io.to(code).emit('game:turn_start', {
    playerId: player.id, exercise: null, timeLimit, round: game.round, forecast: game.forecast,
  })

  // Timer del servidor
  game.timer = setTimeout(async () => {
    if (games.get(code) !== game || game.currentPlayerId !== player.id) return
    if (game.awaitingAce) {
      chooseAce(io, code, game, player.id, player.points + 11 <= 21 ? 11 : 1)
      return
    }
    if (game.cardDrawn && !game.answered) {
      // Pidió carta y no respondió → cuenta como fallo
      game.answered = true
      await resolveAnswer(io, code, game, player.id, null, false)
      return
    }
    // No pidió carta → se planta (pasa este turno)
    markPassed(io, code, game, player.id, true)
    await advanceTurn(io, code, game)
  }, timeLimit * 1000)
}

async function advanceTurn(io, code, game) {
  if (games.get(code) !== game) return
  clearTurnTimer(game)
  io.to(code).emit('game:turn_end')

  const currentIdx = game.players.findIndex(p => p.id === game.currentPlayerId)
  const next = nextInRound(game.players, currentIdx)

  if (next) {
    game.currentPlayerId = next.id
    return startTurn(io, code)
  }

  // ── Se cerró la vuelta: ¿termina la partida? ──
  const someoneAt21 = game.players.some(p => p.status === 'winner')
  const nobodyLeft  = !game.players.some(canPlay)
  const allPassed   = !game.drewThisRound

  if (someoneAt21 || nobodyLeft || allPassed) return endGame(io, code, game)

  // ── Nueva vuelta ──
  game.round        += 1
  game.drewThisRound = false
  game.players.forEach(p => { p.passed = false })
  io.to(code).emit('game:round_start', { round: game.round })

  const first = firstInRound(game.players)
  if (!first) return endGame(io, code, game)
  game.currentPlayerId = first.id
  await startTurn(io, code)
}

function endGame(io, code, game) {
  if (games.get(code) !== game) return
  clearTurnTimer(game)

  const winners   = resolveWinners(game.players)
  const winnerIds = winners.map(w => w.id)

  // Logros de cada jugador
  for (const p of game.players) {
    p.badges = computeBadges({
      p,
      history:   game.history.get(p.id) ?? [],
      won:       winnerIds.includes(p.id),
      usedFifty: game.fiftyUsed.has(p.id),
    })
  }

  const ranking   = buildRanking(game.players, winnerIds)
  const reason    =
    winners.some(w => w.points === 21) ? 'twentyone'
    : !game.players.some(canPlay)      ? 'no_players'
    : 'all_passed'

  io.to(code).emit('game:finished', {
    ranking,
    winner:  winners[0] ?? null,   // compatibilidad
    winners: winnerIds,
    badges:  BADGES,
    reason,
    rounds:  game.round,
  })

  // Repaso PRIVADO: cada jugador recibe solo sus ejercicios
  for (const [playerId, history] of game.history) {
    io.to(playerId).emit('game:review', { history })
  }

  games.delete(code)
  const room = rooms.get(code)
  if (room) room.phase = 'lobby'
  broadcastRooms(io)

  // Estadísticas (en segundo plano, no bloquea)
  recordGame(game.players.map(p => ({
    profileId: p.profileId,
    nickname:  p.nickname,
    avatar:    p.avatar,
    won:       winnerIds.includes(p.id),
    points:    p.points,
    status:    p.status,
    history:   game.history.get(p.id) ?? [],
    maxStreak: p.maxStreak ?? 0,
    badges:    p.badges ?? [],
  }))).catch(err => console.warn('[perfil]', err.message))

  console.log(`[game] finalizada en sala ${code} (vuelta ${game.round}, ${reason}). Ganador(es): ${winners.map(w => w.nickname).join(', ') || 'nadie'}`)
}

// Aviso público de lo que pasó en la mesa (para los espectadores)
function announce(io, code, payload) {
  io.to(code).emit('game:announce', { ...payload, at: Date.now() })
}

function clearTurnTimer(game) {
  if (game.timer) {
    clearTimeout(game.timer)
    game.timer = null
  }
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
