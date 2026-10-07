import {
  rooms, chan, pidOf, attachSocket, scheduleGrace, cancelGrace, setPresence, removeFromRoom, broadcastRooms,
} from './roomHandlers.js'
import { hasGame, getGameSnapshot, setGamePresence, leaveGame } from './gameHandlers.js'

// ─────────────────────────────────────────────────────────────
// SESIÓN: reconexión sin perder tu puesto
// - Al conectar, el cliente manda su "pid" (fijo por pestaña).
// - Si se cae la conexión (refrescar, cambiar de app en el celular,
//   mala señal) NO se te saca de inmediato: quedas "reconectando…"
//   y tienes un tiempo de gracia para volver.
// - Al volver, el cliente pide 'session:resume' y recibe todo el estado.
// ─────────────────────────────────────────────────────────────

const GRACE_LOBBY_MS = Number(process.env.GRACE_LOBBY_MS) || 45 * 1000        // en la sala de espera
const GRACE_GAME_MS  = Number(process.env.GRACE_GAME_MS)  || 3 * 60 * 1000    // en plena partida (tus turnos se pasan solos mientras tanto)

const validPid = (pid) => typeof pid === 'string' && /^[a-z0-9_-]{8,48}$/i.test(pid)

// Busca la sala donde está este jugador
function findRoomOf(pid, hint) {
  const byHint = hint && rooms.get(String(hint).toUpperCase())
  if (byHint?.players.some(p => p.id === pid)) return byHint
  for (const room of rooms.values()) {
    if (room.players.some(p => p.id === pid)) return room
  }
  return null
}

export function registerSessionHandlers(io, socket) {
  const auth = socket.handshake.auth ?? {}
  socket.data.pid = validPid(auth.pid) ? auth.pid : socket.id
  socket.join(chan(socket.data.pid))

  // ── Volver a la sala/partida ──────────────────────────────
  socket.on('session:resume', ({ code } = {}, cb) => {
    const pid  = pidOf(socket)
    const room = findRoomOf(pid, code)

    if (!room) {
      // ¿Terminó la partida mientras no estaba? Igual le mostramos su podio
      return cb?.({ ok: false })
    }

    attachSocket(socket, room.code)
    setPresence(io, room.code, pid, false)
    setGamePresence(io, room.code, pid, false)

    const isHost = room.hostId === pid
    const base   = { ok: true, code: room.code, isHost, config: room.config }

    if (hasGame(room.code)) {
      cb?.({ ...base, phase: 'playing', snapshot: getGameSnapshot(room.code, pid) })
      return
    }

    // Sala en espera: ¿acaba de terminar una partida en la que estaba?
    const lf = room.lastFinished
    if (lf && lf.reviews.has(pid)) {
      cb?.({ ...base, phase: 'finished', players: room.players, finished: lf.finished, review: lf.reviews.get(pid) })
      return
    }

    cb?.({ ...base, phase: 'lobby', players: room.players })
  })

  // ── Se cayó la conexión ───────────────────────────────────
  socket.on('disconnect', () => {
    const pid  = pidOf(socket)
    const code = socket.data.roomCode
    if (!code) return

    // ¿Sigue conectado desde otra pestaña/socket con el mismo pid?
    const still = io.sockets.adapter.rooms.get(chan(pid))
    if (still && still.size > 0) return

    const room = rooms.get(code)
    if (!room?.players.some(p => p.id === pid)) return

    setPresence(io, code, pid, true)
    setGamePresence(io, code, pid, true)

    const inGame = hasGame(code)
    scheduleGrace(code, pid, inGame ? GRACE_GAME_MS : GRACE_LOBBY_MS, () => {
      const r = rooms.get(code)
      const p = r?.players.find(x => x.id === pid)
      if (!p || !p.away) return            // ya volvió
      leaveGame(io, code, pid)
      removeFromRoom(io, code, pid)
      broadcastRooms(io)
      console.log(`[session] ${p.nickname} no volvió a ${code}: sale de la sala`)
    })
    console.log(`[session] ${pid.slice(0, 10)} desconectado de ${code} (esperando reconexión)`)
  })
}

export { cancelGrace }
