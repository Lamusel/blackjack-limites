import { Router } from 'express'
import { supabase } from '../services/supabase.js'
import { TOPICS, TOPIC_KEYS, DIFFICULTIES, POINTS_MAP } from '../lib/topics.js'

const router = Router()

// GET /api/exercises/topics — lista de temas disponibles
router.get('/topics', (_req, res) => {
  res.json(TOPIC_KEYS.map(key => ({ key, label: TOPICS[key].label })))
})

// GET /api/exercises — listar (filtros opcionales ?difficulty=&topic=)
router.get('/', async (req, res) => {
  const { difficulty, topic } = req.query
  let query = supabase.from('exercises').select('*').order('created_at', { ascending: false })
  if (difficulty) query = query.eq('difficulty', difficulty)
  if (topic)      query = query.eq('topic', topic)

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// POST /api/exercises — agregar ejercicio del profe
// Los puntos se calculan solos a partir de la dificultad
router.post('/', async (req, res) => {
  const { topic, difficulty, question, options, correct_answer, explanation } = req.body ?? {}

  if (!question || !options || !correct_answer) {
    return res.status(400).json({ error: 'Faltan campos obligatorios: question, options, correct_answer' })
  }
  if (!TOPIC_KEYS.includes(topic)) {
    return res.status(400).json({ error: `Tema inválido. Usa uno de: ${TOPIC_KEYS.join(', ')}` })
  }
  if (!DIFFICULTIES.includes(difficulty)) {
    return res.status(400).json({ error: `Dificultad inválida. Usa una de: ${DIFFICULTIES.join(', ')}` })
  }
  if (!Array.isArray(options) || options.length !== 4) {
    return res.status(400).json({ error: 'options debe ser un arreglo de 4 opciones' })
  }
  if (!options.includes(correct_answer)) {
    return res.status(400).json({ error: 'correct_answer debe ser exactamente una de las opciones' })
  }

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      topic,
      difficulty,
      points: POINTS_MAP[difficulty],
      question,
      options,
      correct_answer,
      explanation,
      source: 'professor',
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// DELETE /api/exercises/:id
router.delete('/:id', async (req, res) => {
  const { error } = await supabase.from('exercises').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ ok: true })
})

export default router