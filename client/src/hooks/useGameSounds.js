import { useEffect, useRef } from 'react'

// Sonidos de la partida: reacciona a los cambios de estado que manda el servidor.
// (El sonido de la carta se dispara al voltearla, desde Game.jsx)
export function useGameSounds(state, play) {
  const { lastResult, players, playerId, myTurn, timeRemaining, phase, finalRanking, cardDrawn, card, aceChoice } = state

  // Sale el As dorado (para todos) → destello
  const prevAce = useRef(false)
  useEffect(() => {
    const isAce = !!card?.isAce
    if (isAce && !prevAce.current) setTimeout(() => play('sparkle'), 350)
    prevAce.current = isAce
  }, [card, play])

  // Me toca elegir el valor del As
  useEffect(() => { if (aceChoice) play('slot') }, [aceChoice, play])

  // Otro jugador pide carta → también se oye el flip (el mío suena al tocar el botón)
  const prevDrawn = useRef(cardDrawn)
  useEffect(() => {
    if (cardDrawn && !prevDrawn.current && !myTurn) play('card_flip')
    prevDrawn.current = cardDrawn
  }, [cardDrawn, myTurn, play])

  // Resultado de mi respuesta → correct / wrong
  const lastResultRef = useRef(lastResult)
  useEffect(() => {
    if (!lastResult || lastResult === lastResultRef.current) return
    lastResultRef.current = lastResult
    play(lastResult.correct ? 'correct' : 'wrong')
  }, [lastResult, play])

  // Alguien se planta (pasa) o queda eliminado → stand (fichas) / eliminated
  const prevState = useRef(null)
  useEffect(() => {
    const current = Object.fromEntries((players ?? []).map(p => [p.id, { status: p.status, passed: !!p.passed }]))
    const prev = prevState.current
    prevState.current = current
    if (!prev) return

    let sound = null
    for (const [id, now] of Object.entries(current)) {
      const before = prev[id]
      if (!before) continue
      if (now.status === 'eliminated' && before.status !== 'eliminated') sound = 'eliminated'
      else if (now.passed && !before.passed && !sound) sound = 'stand'
    }
    if (!sound) return
    const delay = sound === 'eliminated' && current[playerId]?.status === 'eliminated' ? 450 : 0
    const t = setTimeout(() => play(sound), delay)
    return () => clearTimeout(t)
  }, [players, playerId, play])

  // Últimos 10 segundos de mi turno → tick
  useEffect(() => {
    if (myTurn && timeRemaining > 0 && timeRemaining <= 10) play('tick')
  }, [timeRemaining, myTurn, play])

  // Fin de partida: si gané yo → win
  const winPlayed = useRef(false)
  useEffect(() => {
    if (phase !== 'finished') { winPlayed.current = false; return }
    if (winPlayed.current) return
    winPlayed.current = true
    const winnerIds = state.winners?.length
      ? state.winners
      : (finalRanking?.[0] && finalRanking[0].status !== 'eliminated' ? [finalRanking[0].id] : [])
    if (winnerIds.includes(playerId)) play('win')
  }, [phase, finalRanking, state.winners, playerId, play])
}

export default useGameSounds
