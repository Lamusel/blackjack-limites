import { Router } from 'express'
import { rooms }   from '../socket/roomHandlers.js'

const router = Router()

// GET /api/rooms — listar salas en lobby
router.get('/', (_req, res) => {
  const list = [...rooms.values()]
    .filter(r => r.phase === 'lobby')
    .map(r => ({
      code:        r.code,
      host:        r.players[0]?.nickname ?? '?',
      players:     r.players.length,
      maxPlayers:  r.config.maxPlayers,
      hasPassword: !!r.password,
    }))
  res.json(list)
})

export default router
