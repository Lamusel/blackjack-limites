// ─────────────────────────────────────────────────────────────
// Cartas: valores 2 a 9 + As dorado (sin 10)
// - La dificultad del ejercicio depende del valor de la carta
// - Cada turno trae un "pronóstico": probabilidades a la vista
//   (ej. 60% carta de 2 · 25% carta de 8 · resto repartido)
// - Fallar resta un tercio del valor (redondeado, mínimo 1)
// ─────────────────────────────────────────────────────────────

export const VALUES = [2, 3, 4, 5, 6, 7, 8, 9]
export const ACE_PROBABILITY = 0.015   // 1.5 %: la carta más rara

export function difficultyFor(value) {
  if (value <= 3) return 'easy'
  if (value <= 5) return 'medium'
  if (value <= 7) return 'hard'
  return 'advanced'
}

// El As trae un ejercicio de nivel alto
export function aceDifficulty() {
  return Math.random() < 0.6 ? 'hard' : 'advanced'
}

export const penaltyFor = (value) => Math.max(1, Math.round(value / 3))

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const round5 = (x) => Math.round(x * 20) / 20

/**
 * Pronóstico del turno: dos valores "destacados" con mucha probabilidad
 * y el resto repartido entre los demás. Suma 1 (incluye el As).
 * → [{ value, p }] ordenado de mayor a menor + { ace: p }
 */
export function makeForecast() {
  const a = pick(VALUES)
  const b = pick(VALUES.filter(v => v !== a))
  const pA = round5(0.40 + Math.random() * 0.25)          // 40–65 %
  const pB = round5(0.15 + Math.random() * (0.85 - pA - 0.15 - ACE_PROBABILITY) * 0.8)
  const rest = Math.max(0, 1 - pA - pB - ACE_PROBABILITY)
  const others = VALUES.filter(v => v !== a && v !== b)
  const each = rest / others.length

  const cards = [
    { value: a, p: pA },
    { value: b, p: pB },
    ...others.map(value => ({ value, p: each })),
  ].sort((x, y) => y.p - x.p || x.value - y.value)

  return { cards, ace: ACE_PROBABILITY }
}

/** Saca una carta según el pronóstico */
export function drawFromForecast(forecast) {
  let r = Math.random()
  if (r < forecast.ace) return { value: 11, isAce: true, difficulty: aceDifficulty() }
  r -= forecast.ace
  for (const c of forecast.cards) {
    if (r < c.p) return { value: c.value, isAce: false, difficulty: difficultyFor(c.value) }
    r -= c.p
  }
  const last = forecast.cards[forecast.cards.length - 1]
  return { value: last.value, isAce: false, difficulty: difficultyFor(last.value) }
}
