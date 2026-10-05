import { Router } from 'express'
import { getProfile, getLeaderboard, isValidProfileId } from '../services/profiles.js'

const router = Router()

// GET /api/profiles/top — ranking general (más victorias)
router.get('/top', async (_req, res) => {
  try {
    res.json(await getLeaderboard(10))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/profiles/:id — estadísticas de un jugador
router.get('/:id', async (req, res) => {
  if (!isValidProfileId(req.params.id)) return res.status(400).json({ error: 'Id inválido' })
  try {
    const profile = await getProfile(req.params.id)
    if (!profile) return res.status(404).json({ error: 'Aún no has jugado partidas' })
    res.json(profile)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
