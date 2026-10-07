import { rooms, pidOf } from './roomHandlers.js'

// ─────────────────────────────────────────────────────────────
// Reacciones en la mesa
// - Emotes: salen flotando sobre tu propio asiento
// - Lanzables (estilo parchís): vuelan hacia otro jugador
// Las claves deben coincidir con client/src/components/game/Reactions.jsx
// ─────────────────────────────────────────────────────────────

const EMOTES = ['clap', 'laugh', 'fire', 'cool', 'money', 'wow', 'think', 'eyes', 'cold', 'cry', 'pray', 'skull']
const THROWABLE = [
  'tomato', 'egg', 'chicken', 'donkey', 'horn', 'slipper', 'fish', 'clown',   // burla
  'bang', 'dynamite', 'pie', 'water', 'lightning', 'snowball',                // caos
  'bills', 'jackpot', 'chip',                                                 // plata
  'kiss', 'rose', 'crown', 'clover', 'confetti',                              // cariño
  'flashbang', 'smoke', 'laser', 'headshot', 'pixel', 'gg',                   // gamer
]
const COOLDOWN_MS = 2500

export function registerReactionHandlers(io, socket) {
  let lastAt = 0

  socket.on('game:react', ({ kind, to } = {}, cb) => {
    const code = socket.data.roomCode
    const room = code && rooms.get(code)
    if (!room || !room.players.some(p => p.id === pidOf(socket))) return cb?.({ ok: false })

    const now = Date.now()
    if (now - lastAt < COOLDOWN_MS) return cb?.({ ok: false, error: 'Espera un momento', retryIn: COOLDOWN_MS - (now - lastAt) })

    if (EMOTES.includes(kind)) {
      lastAt = now
      io.to(code).emit('game:reaction', { id: `${pidOf(socket)}-${now}`, kind, from: pidOf(socket), to: null })
      return cb?.({ ok: true })
    }

    if (THROWABLE.includes(kind)) {
      if (!to || to === pidOf(socket) || !room.players.some(p => p.id === to)) return cb?.({ ok: false, error: 'Elige a otro jugador' })
      lastAt = now
      io.to(code).emit('game:reaction', { id: `${pidOf(socket)}-${now}`, kind, from: pidOf(socket), to })
      return cb?.({ ok: true })
    }

    cb?.({ ok: false, error: 'Reacción desconocida' })
  })
}
