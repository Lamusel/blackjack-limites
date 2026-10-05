import 'dotenv/config'
import express       from 'express'
import { createServer } from 'http'
import { Server }    from 'socket.io'
import cors          from 'cors'

import exerciseRouter from './routes/exercises.js'
import roomRouter     from './routes/rooms.js'
import profileRouter  from './routes/profiles.js'
import { registerRoomHandlers }     from './socket/roomHandlers.js'
import { registerGameHandlers }     from './socket/gameHandlers.js'
import { registerReactionHandlers } from './socket/reactionHandlers.js'

const app    = express()
const server = createServer(app)
const PORT   = process.env.PORT || 3001

// CLIENT_URL puede traer varias URLs separadas por coma
// (ej. "http://localhost:5173,https://blackjack-calculo.vercel.app").
// Sin CLIENT_URL se acepta cualquier origen (útil en desarrollo y en el celular).
const allowed = (process.env.CLIENT_URL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)

const corsOrigin = allowed.length
  ? (origin, cb) => {
      // Sin origin (curl, proxy de Vite) o IP local de la red → permitido
      if (!origin || allowed.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(origin)) {
        return cb(null, true)
      }
      cb(new Error(`Origen no permitido: ${origin}`))
    }
  : true

// ── Middlewares ───────────────────────────────────────────
app.use(cors({ origin: corsOrigin }))
app.use(express.json())

// ── REST Routes ───────────────────────────────────────────
app.use('/api/exercises', exerciseRouter)
app.use('/api/rooms',     roomRouter)
app.use('/api/profiles',  profileRouter)

app.get('/health', (_req, res) => res.json({ ok: true }))

// ── Socket.io ─────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'] },
})

io.on('connection', (socket) => {
  console.log(`[socket] conectado: ${socket.id}`)
  registerRoomHandlers(io, socket)
  registerGameHandlers(io, socket)
  registerReactionHandlers(io, socket)

  socket.on('disconnect', () => {
    console.log(`[socket] desconectado: ${socket.id}`)
  })
})

// ── Start ─────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('ℹ️  Sin ANTHROPIC_API_KEY: se usan los ejercicios de la BD y los de emergencia')
  }
})