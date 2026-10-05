import { useEffect, useRef, useState } from 'react'
import { useSocket } from './useSocket'
import { EMOTES, THROWABLES, FLIGHT_MS } from '@/components/game/Reactions'

// ─────────────────────────────────────────────────────────────
// Expresión de cada avatar en la mesa según lo que pasa:
// - Temporales (unos segundos): acierta → feliz, falla → triste,
//   le lanzan un tomate → sorpresa, le dan un beso → enamorado…
// - Permanentes: eliminado → mareado, 21 → victoria,
//   su turno → pensando / concentrado al resolver
// ─────────────────────────────────────────────────────────────

const ANNOUNCE_MOODS = {
  correct:      ['happy', 3000],
  wrong:        ['sad',   3000],
  timeout:      ['sad',   3000],
  pass:         ['smug',  2600],
  timeout_pass: ['sad',   2200],
  fifty:        ['think', 2200],
  ace:          ['shock', 2600],
  ace_choice:   ['smug',  2600],
}

export function useTableMoods({ players = [], currentTurn, cardDrawn }) {
  const { on } = useSocket()
  const [temp, setTemp] = useState({})   // { playerId: mood }
  const timers = useRef({})

  useEffect(() => {
    const setMood = (id, mood, ms, delay = 0) => {
      const apply = () => {
        setTemp(t => ({ ...t, [id]: mood }))
        clearTimeout(timers.current[id])
        timers.current[id] = setTimeout(() => {
          setTemp(t => { const n = { ...t }; delete n[id]; return n })
        }, ms)
      }
      if (delay) setTimeout(apply, delay)
      else apply()
    }

    const offA = on('game:announce', (a) => {
      const m = ANNOUNCE_MOODS[a.type]
      if (m) setMood(a.playerId, m[0], m[1])
    })
    const offR = on('game:reaction', ({ kind, from, to }) => {
      const emote = EMOTES.find(e => e.kind === kind)
      if (emote) return setMood(from, emote.mood, 2200)
      const t = THROWABLES.find(x => x.kind === kind)
      if (t && to) {
        setMood(from, 'smug', 1600)
        setMood(to, t.mood, Math.min(t.ms, 3000), FLIGHT_MS)
      }
    })
    return () => { offA?.(); offR?.(); Object.values(timers.current).forEach(clearTimeout) }
  }, [on])

  // Resultado: temporal > permanente
  const moods = {}
  for (const p of players) {
    let mood = null
    if (p.status === 'eliminated') mood = 'dizzy'
    else if (p.status === 'winner') mood = 'win'
    else if (p.id === currentTurn) mood = cardDrawn ? 'focus' : 'think'
    moods[p.id] = temp[p.id] ?? mood
  }
  return moods
}

export default useTableMoods
