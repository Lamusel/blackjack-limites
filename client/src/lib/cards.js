// Cartas del juego (debe coincidir con server/lib/cards.js)
// Valores 2–9 (sin 10) + As dorado (vale 1 u 11, lo eliges al acertar)

export const TARGET = 21

export const DIFFICULTY_RANGES = [
  { key: 'easy',     label: 'Fácil',    range: '2–3', emoji: '🟢' },
  { key: 'medium',   label: 'Medio',    range: '4–5', emoji: '🔵' },
  { key: 'hard',     label: 'Difícil',  range: '6–7', emoji: '🟠' },
  { key: 'advanced', label: 'Avanzado', range: '8–9', emoji: '🔴' },
]

export function difficultyFor(value) {
  if (value <= 3) return 'easy'
  if (value <= 5) return 'medium'
  if (value <= 7) return 'hard'
  return 'advanced'
}

export const penaltyFor = (value) => Math.max(1, Math.round(value / 3))

export const difficultyLabel = (key) => DIFFICULTY_RANGES.find(d => d.key === key)?.label ?? key

/**
 * A partir del pronóstico y tus puntos:
 * - bust:  probabilidad de pasarte si aciertas
 * - exact: probabilidad de llegar a 21 justo si aciertas
 */
export function forecastOdds(forecast, points = 0) {
  if (!forecast) return { bust: 0, exact: 0 }
  const need = TARGET - points
  let bust = 0, exact = 0
  for (const c of forecast.cards) {
    if (c.value > need) bust += c.p
    if (c.value === need) exact += c.p
  }
  // El As nunca te pasa (puedes elegir 1); llega a 21 si te faltan 1 u 11
  if (need === 1 || need === 11) exact += forecast.ace
  return { bust, exact }
}

export const pct = (p) => {
  const v = p * 100
  if (v > 0 && v < 1) return `${v.toFixed(1)}%`
  if (v < 10 && v % 1) return `${v.toFixed(1)}%`
  return `${Math.round(v)}%`
}
