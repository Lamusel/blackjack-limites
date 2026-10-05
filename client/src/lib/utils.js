// ── Lógica de puntos ───────────────────────────────────────

/** Devuelve la penalización por fallar un ejercicio (piso de la mitad) */
export function getPenalty(points) {
  return Math.floor(points / 2)
}

/** Verifica si sumar puntos eliminaría al jugador */
export function wouldEliminate(currentPoints, exercisePoints) {
  return currentPoints + exercisePoints > 21
}

/** Devuelve el estado del jugador según sus puntos */
export function getPlayerStatus(points) {
  if (points > 21) return 'eliminated'
  if (points === 21) return 'winner'
  return 'active'
}

// ── Dificultad ─────────────────────────────────────────────

export const DIFFICULTY = {
  easy:     { label: 'Fácil',    points: 2, color: 'badge-easy',     emoji: '🟢' },
  medium:   { label: 'Medio',    points: 4, color: 'badge-medium',   emoji: '🔵' },
  hard:     { label: 'Difícil',  points: 6, color: 'badge-hard',     emoji: '🟠' },
  advanced: { label: 'Avanzado', points: 8, color: 'badge-advanced', emoji: '🔴' },
}

export function getDifficulty(key) {
  return DIFFICULTY[key] ?? DIFFICULTY.easy
}

// ── Sala ───────────────────────────────────────────────────

/** Genera un código de sala de 6 letras mayúsculas */
export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

// ── Temporizador ───────────────────────────────────────────

/** Convierte segundos a MM:SS */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/** Devuelve el porcentaje del tiempo restante (0–1) */
export function timeProgress(remaining, total) {
  return total > 0 ? remaining / total : 0
}

// ── Avatar ─────────────────────────────────────────────────

export const AVATAR_DEFAULTS = {
  skin:       'skin1',
  hair:       'hair1',
  hairColor:  '#3b2314',
  eyes:       'eyes1',
  mouth:      'mouth1',
  outfit:     'outfit1',
  accessory:  'none',
  bgColor:    '#2d5a3d',
}

// ── Clases CSS condicionales ───────────────────────────────

/** Combina clases condicionales (tiny cn helper sin instalar clsx) */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
