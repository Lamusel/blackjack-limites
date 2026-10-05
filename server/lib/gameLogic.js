export const TARGET_SCORE = 21

/** Penalización por fallo: un tercio del valor de la carta, redondeado, mínimo 1 */
export function calcPenalty(value) {
  return Math.max(1, Math.round(value / 3))
}

/**
 * Aplica el resultado de un turno al jugador.
 * value = valor de la carta (2–9, o 1/11 si es el As)
 */
export function applyResult({ player, value, correct }) {
  const delta  = correct ? value : -calcPenalty(value)
  const newPts = player.points + delta

  let status = player.status
  if (newPts > TARGET_SCORE) status = 'eliminated'
  else if (newPts === TARGET_SCORE) status = 'winner'

  // El delta real puede ser menor si estaba en 0 y falló (no baja de 0)
  const points = Math.max(0, newPts)
  return { ...player, points, status, delta: points - player.points }
}

/**
 * Ganadores de la partida:
 * - Todos los que tengan 21 exacto (puede haber empate)
 * - Si nadie tiene 21: el/los de mayor puntaje sin pasarse
 */
export function resolveWinners(players) {
  const eligible = players.filter(p => p.status !== 'eliminated' && !p.left && p.points <= TARGET_SCORE)
  if (!eligible.length) return []

  const at21 = eligible.filter(p => p.points === TARGET_SCORE)
  if (at21.length) return at21

  const best = Math.max(...eligible.map(p => p.points))
  return eligible.filter(p => p.points === best)
}

/** Ranking final: ganadores primero, eliminados al final */
export function buildRanking(players, winnerIds = []) {
  return [...players]
    .sort((a, b) => {
      const aw = winnerIds.includes(a.id), bw = winnerIds.includes(b.id)
      if (aw !== bw) return aw ? -1 : 1
      const ae = a.status === 'eliminated', be = b.status === 'eliminated'
      if (ae !== be) return ae ? 1 : -1
      return b.points - a.points
    })
    .map((p, i) => ({ ...p, rank: i + 1, isWinner: winnerIds.includes(p.id) }))
}

/** ¿Puede jugar turnos? (no eliminado, no llegó a 21, no se fue) */
export const canPlay = (p) => p.status === 'active'

/** Siguiente jugador DENTRO de la misma vuelta (después de fromIdx). null = la vuelta terminó */
export function nextInRound(players, fromIdx) {
  for (let i = fromIdx + 1; i < players.length; i++) {
    if (canPlay(players[i])) return players[i]
  }
  return null
}

/** Primer jugador que puede jugar (inicio de vuelta) */
export function firstInRound(players) {
  return players.find(canPlay) ?? null
}
