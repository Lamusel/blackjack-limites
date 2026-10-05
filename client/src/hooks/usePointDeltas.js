import { useEffect, useRef, useState } from 'react'

// Detecta cambios de puntos de cada jugador y devuelve { [playerId]: delta }
// durante unos segundos, para mostrar el "+4" / "-2" flotando sobre el avatar.
export function usePointDeltas(players = [], duration = 2200) {
  const prev   = useRef(null)
  const timers = useRef({})
  const [deltas, setDeltas] = useState({})

  useEffect(() => {
    const current = Object.fromEntries(players.map(p => [p.id, p.points ?? 0]))
    const before  = prev.current
    prev.current  = current
    if (!before) return

    for (const [id, pts] of Object.entries(current)) {
      if (before[id] === undefined || before[id] === pts) continue
      const delta = pts - before[id]
      setDeltas(d => ({ ...d, [id]: delta }))
      clearTimeout(timers.current[id])
      timers.current[id] = setTimeout(() => {
        setDeltas(d => { const n = { ...d }; delete n[id]; return n })
      }, duration)
    }
  }, [players, duration])

  useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), [])

  return deltas
}

export default usePointDeltas
