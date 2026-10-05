import Anthropic from '@anthropic-ai/sdk'
import { supabase } from './supabase.js'
import { TOPICS, TOPIC_KEYS, DIFFICULTIES, POINTS_MAP, sanitizeTopics } from '../lib/topics.js'

// El cliente de Anthropic se crea al primer uso (así no truena el server
// si falta la API key, ni importa el orden en que se carga el .env)
let anthropic = null
function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) return null
  if (!anthropic) anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return anthropic
}

const MODEL = () => process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const isUuid = (id) => /^[0-9a-f-]{36}$/i.test(String(id))

/**
 * Obtiene un ejercicio para el turno.
 * 1. Busca en Supabase (dificultad aleatoria, solo temas de la sala, sin repetir)
 * 2. Si no hay → lo genera Claude y lo guarda
 * 3. Si la IA falla → ejercicio de emergencia hardcodeado
 */
export async function getExercise({ difficulty, topics, usedIds = new Set() } = {}) {
  const diff       = DIFFICULTIES.includes(difficulty) ? difficulty : pick(DIFFICULTIES)
  const roomTopics = sanitizeTopics(topics)

  // 1. Base de datos
  let query = supabase
    .from('exercises')
    .select('*')
    .eq('difficulty', diff)
    .in('topic', roomTopics)
    .limit(200)

  // OJO: "id not in (null)" en SQL no devuelve nada → solo filtrar si hay usados
  const used = [...usedIds].filter(isUuid)
  if (used.length) query = query.not('id', 'in', `(${used.join(',')})`)

  const { data, error } = await query
  if (error) console.error('[exercises] error leyendo BD:', error.message)

  if (!error && data?.length) return normalizeExercise(pick(data))

  // 2. IA
  const topic = pick(roomTopics)
  console.log(`[ai] generando ejercicio: ${topic} / ${diff}`)
  const generated = await generateWithAI(topic, diff)
  if (generated) return generated

  // 3. Emergencia
  return getFallbackExercise({ difficulty: diff, topics: roomTopics, usedIds })
}

async function generateWithAI(topic, difficulty) {
  const client = getAnthropic()
  if (!client) {
    console.warn('[ai] sin ANTHROPIC_API_KEY, uso ejercicio de emergencia')
    return null
  }

  const t = TOPICS[topic]
  const prompt = `Genera UN ejercicio de Cálculo de selección múltiple.

Tema: ${t.label}
Nivel: ${difficulty} — ${t.levels[difficulty]}
Formato de la pregunta: ${t.format}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "question": "enunciado corto y claro",
  "options": ["opción A", "opción B", "opción C", "opción D"],
  "correct_answer": "debe ser EXACTAMENTE igual a una de las 4 opciones",
  "explanation": "solución paso a paso en 2-3 pasos cortos"
}

Notación matemática (OBLIGATORIO, se dibuja con KaTeX):
- Toda expresión matemática va en LaTeX entre $...$ (en línea).
- La expresión principal del enunciado va centrada entre $$...$$.
  Ej: "Calcula $$\\lim_{x\\to 2}\\frac{x^2-4}{x-2}$$"
- Las opciones numéricas o algebraicas también van entre $...$. Ej: "$\\frac{1}{4}$", "$2x\\,e^{x^2}$".
- Usa \\frac, \\sqrt, \\lim_{x\\to a}, \\infty, \\pi, \\ln, \\cos, \\tan, \\operatorname{sen} (seno en español),
  \\frac{\\partial f}{\\partial x}, f'(x), \\begin{cases} ... \\end{cases} para funciones a trozos.
- Como es JSON, cada barra invertida de LaTeX se escribe DOBLE (\\frac → "\\\\frac").
- No uses caracteres Unicode como x², √ o ∂ fuera de LaTeX.

Reglas:
- Todo en español.
- Exactamente 4 opciones distintas, plausibles, y solo UNA correcta.
- Los distractores deben ser errores típicos de estudiantes.
- Verifica tu respuesta antes de responder: el ejercicio debe ser matemáticamente correcto.
- Sin markdown, sin texto extra, solo el JSON.`

  try {
    const response = await client.messages.create({
      model:      MODEL(),
      max_tokens: 1200,
      messages:   [{ role: 'user', content: prompt }],
    })

    const text   = response.content?.find(b => b.type === 'text')?.text ?? ''
    const parsed = parseJson(text)
    validate(parsed)

    const row = {
      topic,                                   // no confiamos en el tema que diga el modelo
      difficulty,
      points:         POINTS_MAP[difficulty],
      question:       parsed.question.trim(),
      options:        parsed.options.map(o => String(o).trim()),
      correct_answer: String(parsed.correct_answer).trim(),
      explanation:    parsed.explanation ?? null,
      source:         'ai',
    }

    // Guardar para reutilizar (si la pregunta ya existe, igual la usamos)
    const { data: saved, error } = await supabase.from('exercises').insert(row).select().single()
    if (error) console.warn('[ai] no se guardó en BD:', error.message)

    return normalizeExercise(saved ?? { ...row, id: crypto.randomUUID() })
  } catch (err) {
    console.error('[ai] error generando ejercicio:', err.message)
    return null
  }
}

function parseJson(text) {
  const clean = text.replace(/```json|```/g, '').trim()
  const start = clean.indexOf('{')
  const end   = clean.lastIndexOf('}')
  return JSON.parse(clean.slice(start, end + 1))
}

function validate(ex) {
  if (!ex?.question || !Array.isArray(ex.options) || ex.options.length !== 4) {
    throw new Error('JSON inválido: faltan campos o no hay 4 opciones')
  }
  const opts = ex.options.map(o => String(o).trim())
  if (new Set(opts).size !== 4) throw new Error('Opciones repetidas')
  if (!opts.includes(String(ex.correct_answer).trim())) {
    throw new Error('La respuesta correcta no está entre las opciones')
  }
}

function normalizeExercise(ex) {
  return {
    id:             ex.id,
    topic:          ex.topic,
    difficulty:     ex.difficulty,
    points:         ex.points,
    question:       ex.question,
    options:        ex.options,
    correct_answer: ex.correct_answer,
    explanation:    ex.explanation,
  }
}

// ─────────────────────────────────────────────────────────────
// Ejercicios de emergencia (si la BD y la IA fallan)
// ─────────────────────────────────────────────────────────────
const FALLBACKS = [
  // Límites
  { id: 'fb-lim-1', topic: 'limites', difficulty: 'easy', points: 2,
    question: String.raw`Calcula $$\lim_{x\to 2}\left(3x+1\right)$$`,
    options: ['$5$', '$6$', '$7$', '$8$'], correct_answer: '$7$',
    explanation: String.raw`Sustituimos $x=2$: $3(2)+1=7$` },
  { id: 'fb-lim-2', topic: 'limites', difficulty: 'medium', points: 4,
    question: String.raw`Calcula $$\lim_{x\to 5}\frac{x^2-25}{x-5}$$`,
    options: ['$0$', '$5$', '$10$', 'No existe'], correct_answer: '$10$',
    explanation: String.raw`Factorizamos: $\frac{(x-5)(x+5)}{x-5}=x+5$. Con $x=5$: $10$` },
  { id: 'fb-lim-3', topic: 'limites', difficulty: 'hard', points: 6,
    question: String.raw`Calcula $$\lim_{x\to 0}\frac{\sqrt{x+1}-1}{x}$$`,
    options: ['$0$', String.raw`$\frac{1}{2}$`, '$1$', '$2$'], correct_answer: String.raw`$\frac{1}{2}$`,
    explanation: String.raw`Multiplicamos por el conjugado: $\dfrac{x}{x(\sqrt{x+1}+1)}=\dfrac{1}{2}$` },
  { id: 'fb-lim-4', topic: 'limites', difficulty: 'advanced', points: 8,
    question: String.raw`Calcula $$\lim_{x\to\infty}\frac{3x^2+2x}{x^2-5}$$`,
    options: ['$0$', '$1$', '$3$', String.raw`$\infty$`], correct_answer: '$3$',
    explanation: String.raw`Dividimos entre $x^2$: $\dfrac{3+\frac{2}{x}}{1-\frac{5}{x^2}}\to 3$` },

  // Continuidad
  { id: 'fb-con-1', topic: 'continuidad', difficulty: 'easy', points: 2,
    question: String.raw`¿Es continua $f(x)=|x|$ en $x=0$?`,
    options: ['Sí', String.raw`No, $f(0)$ no existe`, 'No, el límite no existe', String.raw`No, $\lim_{x\to0}f(x)\neq f(0)$`], correct_answer: 'Sí',
    explanation: String.raw`$f(0)=0$ y los límites laterales valen $0$ por ambos lados $\Rightarrow$ continua` },
  { id: 'fb-con-2', topic: 'continuidad', difficulty: 'hard', points: 6,
    question: String.raw`Halla $k$ para que $f$ sea continua en $x=1$: $$f(x)=\begin{cases}2x+k & x<1\\ 3 & x\ge 1\end{cases}$$`,
    options: ['$0$', '$1$', '$2$', '$3$'], correct_answer: '$1$',
    explanation: String.raw`Límite izquierdo: $2+k$. Debe ser igual a $3\Rightarrow k=1$` },

  // Derivadas básicas
  { id: 'fb-der-1', topic: 'derivadas_basicas', difficulty: 'easy', points: 2,
    question: String.raw`Deriva $$f(x)=7x-3$$`,
    options: ['$7$', '$7x$', '$-3$', '$0$'], correct_answer: '$7$',
    explanation: String.raw`La derivada de $7x$ es $7$ y la de una constante es $0$` },
  { id: 'fb-der-2', topic: 'derivadas_basicas', difficulty: 'medium', points: 4,
    question: String.raw`Deriva $$f(x)=x\cos x$$`,
    options: [String.raw`$\cos x-x\operatorname{sen}x$`, String.raw`$\cos x+x\operatorname{sen}x$`, String.raw`$-\operatorname{sen}x$`, String.raw`$-x\operatorname{sen}x$`],
    correct_answer: String.raw`$\cos x-x\operatorname{sen}x$`,
    explanation: String.raw`Producto: $1\cdot\cos x+x\cdot(-\operatorname{sen}x)=\cos x-x\operatorname{sen}x$` },

  // Regla de la cadena
  { id: 'fb-cad-1', topic: 'regla_cadena', difficulty: 'medium', points: 4,
    question: String.raw`Deriva $$f(x)=\cos(x^2)$$`,
    options: [String.raw`$-2x\operatorname{sen}(x^2)$`, String.raw`$-\operatorname{sen}(x^2)$`, String.raw`$2x\operatorname{sen}(x^2)$`, String.raw`$-\operatorname{sen}(2x)$`],
    correct_answer: String.raw`$-2x\operatorname{sen}(x^2)$`,
    explanation: String.raw`Cadena: $-\operatorname{sen}(x^2)\cdot 2x=-2x\operatorname{sen}(x^2)$` },
  { id: 'fb-cad-2', topic: 'regla_cadena', difficulty: 'hard', points: 6,
    question: String.raw`Deriva $$f(x)=\ln(x^2+1)$$`,
    options: [String.raw`$\frac{2x}{x^2+1}$`, String.raw`$\frac{1}{x^2+1}$`, String.raw`$2x\ln(x^2+1)$`, String.raw`$\frac{x}{x^2+1}$`],
    correct_answer: String.raw`$\frac{2x}{x^2+1}$`,
    explanation: String.raw`Cadena: $\dfrac{1}{x^2+1}\cdot 2x=\dfrac{2x}{x^2+1}$` },

  // Derivadas parciales
  { id: 'fb-par-1', topic: 'derivadas_parciales', difficulty: 'easy', points: 2,
    question: String.raw`Si $f(x,y)=4x+y^2$, calcula $$\frac{\partial f}{\partial x}$$`,
    options: ['$4$', '$2y$', '$4+2y$', '$4x$'], correct_answer: '$4$',
    explanation: String.raw`Tratamos $y$ como constante: $4+0=4$` },
  { id: 'fb-par-2', topic: 'derivadas_parciales', difficulty: 'hard', points: 6,
    question: String.raw`Si $f(x,y)=x^2\operatorname{sen}y$, calcula $$\frac{\partial f}{\partial y}$$`,
    options: [String.raw`$x^2\cos y$`, String.raw`$2x\operatorname{sen}y$`, String.raw`$2x\cos y$`, String.raw`$-x^2\cos y$`],
    correct_answer: String.raw`$x^2\cos y$`,
    explanation: String.raw`$x^2$ es constante respecto a $y$: $x^2\cos y$` },

  // Aplicaciones
  { id: 'fb-apl-1', topic: 'aplicaciones_derivada', difficulty: 'easy', points: 2,
    question: String.raw`¿Cuál es la pendiente de la recta tangente a $f(x)=x^3$ en $x=1$?`,
    options: ['$1$', '$2$', '$3$', '$6$'], correct_answer: '$3$',
    explanation: String.raw`$f'(x)=3x^2\Rightarrow f'(1)=3$` },
  { id: 'fb-apl-2', topic: 'aplicaciones_derivada', difficulty: 'advanced', points: 8,
    question: String.raw`¿Qué dos números positivos que suman $20$ tienen el mayor producto posible?`,
    options: ['$10$ y $10$', '$5$ y $15$', '$1$ y $19$', '$8$ y $12$'], correct_answer: '$10$ y $10$',
    explanation: String.raw`$P(x)=x(20-x)$, $P'(x)=20-2x=0\Rightarrow x=10$; el otro número es $10$` },
]

function getFallbackExercise({ difficulty, topics, usedIds }) {
  const fresh = FALLBACKS.filter(f => !usedIds.has(f.id))
  const pool  = fresh.length ? fresh : FALLBACKS

  // Prioridad: mismo tema y dificultad → mismo tema → misma dificultad → cualquiera
  const candidates =
    pool.filter(f => topics.includes(f.topic) && f.difficulty === difficulty).length
      ? pool.filter(f => topics.includes(f.topic) && f.difficulty === difficulty)
    : pool.filter(f => topics.includes(f.topic)).length
      ? pool.filter(f => topics.includes(f.topic))
    : pool.filter(f => f.difficulty === difficulty).length
      ? pool.filter(f => f.difficulty === difficulty)
    : pool

  return normalizeExercise(pick(candidates))
}

// Exportado por si las rutas lo necesitan
export { TOPIC_KEYS }
