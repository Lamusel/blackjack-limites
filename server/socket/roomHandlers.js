import { sanitizeTopics } from '../lib/topics.js'
import { getProfile } from '../services/profiles.js'

// ─────────────────────────────────────────────────────────────
// IDENTIDAD ESTABLE
// Cada pestaña tiene un "pid" propio (lo genera el cliente y lo guarda en
// sessionStorage). Así, si refrescas o el celular corta la conexión al
// cambiar de app, el server te reconoce y vuelves a tu asiento.
// Los mensajes privados van al canal "p:<pid>" (no al socket.id).
// ─────────────────────────────────────────────────────────────
export const chan  = (pid) => `p:${pid}`
export const pidOf = (socket) => socket.data.pid ?? socket.id

// Carga las victorias del jugador (para su marco bronce/plata/oro) sin bloquear la entrada
function loadWins(io, code, player) {
  if (!player.profileId) return
  getProfile(player.profileId)
    .then(profile => {
      player.wins = profile?.wins ?? 0
      const room = rooms.get(code)
      if (room?.players.includes(player)) io.to(code).emit('room:players_update', room.players)
    })
    .catch(() => {})
}

// Estado en memoria de las salas activas
// rooms = Map<code, { code, password, hostId, config, players[], phase, createdAt }>
// config = { timeLimit, maxPlayers, topics[] }
export const rooms = new Map()

const TIME_VALUES = [60, 90, 120]

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

function buildConfig(config = {}) {
  const timeLimit  = TIME_VALUES.includes(config.timeLimit) ? config.timeLimit : 90
  const maxPlayers = Math.min(6, Math.max(2, Number(config.maxPlayers) || 6))
  return { timeLimit, maxPlayers, topics: sanitizeTopics(config.topics) }
}

// El avatar viene del cliente: solo aceptamos claves y valores cortos y simples
// Avatar: el cliente lo valida a fondo al dibujarlo (estilos clásico, táctico,
// armadura, bloques, robot, místico). Aquí solo dejamos pasar claves y valores
// cortos y "seguros" para que nadie meta basura en la sala.
export function sanitizeAvatar(avatar) {
  if (!avatar || typeof avatar !== 'object' || Array.isArray(avatar)) return null
  const out = {}
  for (const [k, v] of Object.entries(avatar).slice(0, 30)) {
    if (/^[a-zA-Z]{1,16}$/.test(k) && typeof v === 'string' && /^[a-z0-9_]{1,16}$/i.test(v)) out[k] = v
  }
  return Object.keys(out).length ? out : null
}

const cleanNick = (n) => String(n ?? '').trim().slice(0, 16) || 'Jugador'
const cleanProfileId = (id) => (typeof id === 'string' && /^p_[a-z0-9]{6,40}$/i.test(id) ? id : null)

function makePlayer(socket, { nickname, avatar, profileId }, turnOrder, isHost) {
  return {
    id:        pidOf(socket),
    away:      false,
    nickname:  cleanNick(nickname),
    avatar:    sanitizeAvatar(avatar),
    profileId: cleanProfileId(profileId),
    wins:      0,
    points:    0,
    status:    'active',
    turnOrder,
    isHost,
  }
}

// Avisa a TODOS los clientes que la lista de salas cambió (para la pantalla de salas)
export function broadcastRooms(io) {
  io.emit('rooms:changed')
}

function publicRoom(r) {
  return {
    code:        r.code,
    host:        r.players.find(p => p.id === r.hostId)?.nickname ?? r.players[0]?.nickname ?? '?',
    players:     r.players.length,
    maxPlayers:  r.config.maxPlayers,
    hasPassword: !!r.password,
    topics:      r.config.topics,
    timeLimit:   r.config.timeLimit,
    phase:       r.phase,
    seats:       r.players.map(p => ({ nickname: p.nickname, avatar: p.avatar, wins: p.wins ?? 0 })),
  }
}

// Si el socket ya estaba en otra sala, sale de ella primero (y de su partida)
function leavePrevious(socket, nextCode) {
  const prev = socket.data.roomCode
  if (prev && prev !== nextCode) {
    for (const fn of socket.listeners('room:leave')) fn()
    socket.data.roomCode = null
  }
}

export function registerRoomHandlers(io, socket) {

  // ── Crear sala ────────────────────────────────────────────
  socket.on('room:create', (data = {}, cb) => {
    leavePrevious(socket, null)

    let code = generateCode()
    while (rooms.has(code)) code = generateCode()

    const player = makePlayer(socket, data, 0, true)
    rooms.set(code, {
      code,
      password:  data.password ? String(data.password).slice(0, 20) : null,
      hostId:    pidOf(socket),
      config:    buildConfig(data.config),
      players:   [player],
      phase:     'lobby',
      createdAt: Date.now(),
    })

    attachSocket(socket, code)

    const room = rooms.get(code)
    cb?.({ ok: true, code, config: room.config })
    socket.emit('room:joined', { code, config: room.config, isHost: true })
    io.to(code).emit('room:players_update', room.players)
    broadcastRooms(io)
    loadWins(io, code, player)

    console.log(`[room] creada: ${code} por ${player.nickname} · temas: ${room.config.topics.join(', ')}`)
  })

  // ── Verificar antes de entrar (código + contraseña) ───────
  socket.on('room:check', ({ code, password } = {}, cb) => {
    const room = rooms.get(String(code ?? '').toUpperCase().trim())
    if (!room) return cb?.({ ok: false, error: 'No existe una sala con ese código' })
    if (room.players.some(p => p.id === pidOf(socket))) return cb?.({ ok: true, code: room.code })
    if (room.phase !== 'lobby') return cb?.({ ok: false, error: 'Esa partida ya comenzó' })
    if (room.players.length >= room.config.maxPlayers) return cb?.({ ok: false, error: 'La sala está llena' })
    if (room.password && room.password !== password) {
      return cb?.({ ok: false, error: password ? 'Contraseña incorrecta' : 'Esta sala tiene contraseña', needsPassword: true })
    }
    cb?.({ ok: true, code: room.code })
  })

  // ── Unirse a sala ────────────────────────────────────────
  socket.on('room:join', (data = {}, cb) => {
    const code = String(data.code ?? '').toUpperCase().trim()
    const room = rooms.get(code)
    if (!room) return cb?.({ ok: false, error: 'Sala no encontrada' })

    // Si ya está dentro (p. ej. el host al entrar al Lobby) no se duplica
    const already = room.players.find(p => p.id === pidOf(socket))
    if (already) {
      // Actualiza nombre/avatar por si los cambió (solo en el lobby)
      if (room.phase === 'lobby') {
        already.nickname = cleanNick(data.nickname ?? already.nickname)
        already.avatar   = sanitizeAvatar(data.avatar) ?? already.avatar
      }
      attachSocket(socket, code)
      setPresence(io, code, already.id, false)
      const isHost = room.hostId === already.id
      cb?.({ ok: true, config: room.config, isHost })
      socket.emit('room:joined', { code, config: room.config, isHost })
      io.to(code).emit('room:players_update', room.players)
      return
    }

    if (room.phase !== 'lobby') return cb?.({ ok: false, error: 'La partida ya comenzó' })
    if (room.players.length >= room.config.maxPlayers) return cb?.({ ok: false, error: 'Sala llena' })
    if (room.password && room.password !== data.password) return cb?.({ ok: false, error: 'Contraseña incorrecta' })

    leavePrevious(socket, code)

    const player = makePlayer(socket, data, room.players.length, false)
    room.players.push(player)
    attachSocket(socket, code)

    cb?.({ ok: true, config: room.config, isHost: false })
    socket.emit('room:joined', { code, config: room.config, isHost: false })
    io.to(code).emit('room:players_update', room.players)
    broadcastRooms(io)
    loadWins(io, code, player)

    console.log(`[room] ${player.nickname} se unió a ${code}`)
  })

  // ── Listar salas (en espera primero, luego en juego) ──────
  socket.on('room:list', (_, cb) => {
    const list = [...rooms.values()]
      .sort((a, b) => (a.phase === b.phase ? b.createdAt - a.createdAt : a.phase === 'lobby' ? -1 : 1))
      .map(publicRoom)
    cb?.({ rooms: list })
  })

  // ── Salir de sala ─────────────────────────────────────────
  // (la desconexión NO saca de la sala al instante: ver sessionHandlers.js)
  socket.on('room:leave', () => {
    const code = socket.data.roomCode
    if (!code) return
    cancelGrace(code, pidOf(socket))
    removeFromRoom(io, code, pidOf(socket))
    socket.leave(code)
    // (no borramos socket.data.roomCode aquí: gameHandlers lo necesita para sacarlo de la partida)
  })
}

// Mete este socket a la sala (y lo recuerda para los demás handlers)
export function attachSocket(socket, code) {
  socket.join(code)
  socket.data.roomCode = code
  cancelGrace(code, pidOf(socket))
}

// ── Desconexiones con "período de gracia" ─────────────────
const graceTimers = new Map()   // `${code}:${pid}` → timeout
export function cancelGrace(code, pid) {
  const key = `${code}:${pid}`
  if (graceTimers.has(key)) { clearTimeout(graceTimers.get(key)); graceTimers.delete(key) }
}
export function scheduleGrace(code, pid, ms, onExpire) {
  cancelGrace(code, pid)
  graceTimers.set(`${code}:${pid}`, setTimeout(() => {
    graceTimers.delete(`${code}:${pid}`)
    onExpire()
  }, ms))
}

// Marca a un jugador como "reconectando" (away) o de vuelta
export function setPresence(io, code, pid, away) {
  const room = rooms.get(code)
  const p = room?.players.find(x => x.id === pid)
  if (!p || !!p.away === away) return
  p.away = away
  io.to(code).emit('room:players_update', room.players)
}

// Saca definitivamente a un jugador de la sala
export function removeFromRoom(io, code, pid) {
  const room = rooms.get(code)
  if (!room) return
  if (!room.players.some(p => p.id === pid)) return

  room.players = room.players.filter(p => p.id !== pid)

  if (room.players.length === 0) {
    rooms.delete(code)
    broadcastRooms(io)
    console.log(`[room] eliminada: ${code}`)
    return
  }

  // Si el host se va, el siguiente (que esté conectado) pasa a ser host
  if (room.hostId === pid) {
    const next = room.players.find(p => !p.away) ?? room.players[0]
    room.hostId = next.id
    room.players.forEach(p => { p.isHost = p.id === room.hostId })
    io.to(chan(next.id)).emit('room:host_assigned')
  }

  io.to(code).emit('room:players_update', room.players)
  broadcastRooms(io)
}
