import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useGame } from '@/hooks/useGame'
import { useSocket } from '@/hooks/useSocket'
import { useAudio } from '@/hooks/useAudio'
import { useGameSounds } from '@/hooks/useGameSounds'
import { usePointDeltas } from '@/hooks/usePointDeltas'
import Table from '@/components/game/Table'
import ActionBar from '@/components/game/ActionBar'
import ExerciseSheet from '@/components/game/ExerciseSheet'
import Podium from '@/components/game/Podium'
import SettingsButton from '@/components/ui/SettingsButton'

export default function Game() {
  const { code }  = useParams()
  const navigate  = useNavigate()
  const { state, dispatch } = useGame()
  const { emit }  = useSocket()
  const { play }  = useAudio()

  const {
    players = [], playerId, currentTurn, myTurn, exercise, timeRemaining = 0, turnTotal = 90,
    cardDrawn, removedOptions = [], fiftyUsedBy = [], lastResult, forecast, card, aceChoice,
  } = state

  const me         = players.find(p => p.id === playerId)
  const turnPlayer = players.find(p => p.id === currentTurn)
  const fiftyAvailable = !fiftyUsedBy.includes(playerId)

  useGameSounds(state, play)
  const deltas = usePointDeltas(players)

  // ── Estado local ───────────────────────────────────────────
  const [selected, setSelected]       = useState(null)
  const [fiftyLoading, setFiftyLoading] = useState(false)
  const [snapshot, setSnapshot]       = useState(null)   // hoja que queda abierta tras responder

  // Nuevo ejercicio → limpiar selección
  useEffect(() => { setSelected(null) }, [exercise?.id])

  // Cuando llega mi resultado, congelar la hoja para poder leer la explicación con calma
  useEffect(() => {
    if (lastResult && exercise) {
      setSnapshot({ exercise, selected, result: lastResult, removedOptions, card })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastResult])

  // En mi siguiente turno se cierra la hoja vieja
  useEffect(() => { if (myTurn) setSnapshot(null) }, [myTurn, currentTurn])

  // Si llegamos a /game sin partida (recarga), volver al inicio
  useEffect(() => {
    if (!players.length && state.phase !== 'finished') {
      const t = setTimeout(() => navigate('/'), 1500)
      return () => clearTimeout(t)
    }
  }, [players.length, state.phase, navigate])

  // ── Acciones ───────────────────────────────────────────────
  const handleDraw = () => {
    if (!forecast || cardDrawn) return
    play('card_flip')
    dispatch({ type: 'CARD_DRAWN' })          // optimista; el server lo confirma a todos
    emit('game:action', { type: 'draw' })
  }

  const handleStand = () => {
    emit('game:action', { type: 'stand' }, (res) => {
      if (res && !res.ok && res.error) alert(res.error)
    })
  }

  const handleFifty = () => {
    if (!fiftyAvailable || fiftyLoading) return
    setFiftyLoading(true)
    emit('game:fifty', {}, (res) => {
      setFiftyLoading(false)
      if (res?.ok) {
        play('stand')
        dispatch({ type: 'REMOVE_OPTIONS', payload: res.remove ?? [] })
      }
    })
  }

  const handleAce = (value) => {
    emit('game:ace', { value })
    play(value === 11 ? 'sparkle' : 'stand')
  }

  const handleAnswer = (answer) => {
    if (selected || !exercise) return
    setSelected(answer)
    emit('game:answer', { exerciseId: exercise.id, answer })
  }

  // ── Fin de partida ─────────────────────────────────────────
  if (state.phase === 'finished') {
    return (
      <Podium
        ranking={state.finalRanking ?? []}
        playerId={playerId}
        winners={state.winners ?? []}
        endReason={state.endReason}
        rounds={state.round}
        review={state.review ?? []}
        badgeCatalog={state.badgeCatalog}
        onProfile={() => navigate('/profile')}
        onHome={() => navigate('/')}
        onRooms={() => navigate(`/lobby/${code}`)}
      />
    )
  }

  // ── Hoja del ejercicio: en vivo (mi turno) o congelada (ya respondí) ──
  const liveSheet = myTurn && cardDrawn && exercise
  // Doble seguro: el resultado solo se muestra si es de ESTE ejercicio
  const liveResult = lastResult && (!lastResult.exerciseId || lastResult.exerciseId === exercise?.id)
    ? lastResult : null
  const sheet = liveSheet
    ? { exercise, selected, result: liveResult, removedOptions, card }
    : snapshot
  const dealing = myTurn && cardDrawn && !exercise

  // ── Mesa ───────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-noir-900 flex flex-col overflow-x-hidden">
      {/* Barra superior */}
      <header className="w-full max-w-md landscape:max-w-5xl mx-auto px-4 pt-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-gold-500">♠</span>
          <span className="font-serif text-cream">Mesa</span>
          {code && <span className="font-mono text-xs text-warm-600 tracking-widest">{code}</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-pill border border-noir-600 bg-noir-800 font-sans text-xs text-warm-400">
            Vuelta <span className="text-gold-400 font-mono">{state.round ?? 1}</span>
          </span>
          <SettingsButton />
        </div>
      </header>

      <main className="flex-1 w-full max-w-md landscape:max-w-5xl mx-auto flex flex-col
                       landscape:flex-row landscape:items-center landscape:gap-4">
        <div className="min-w-0 landscape:flex-1">
          <Table
            players={players}
            playerId={playerId}
            currentTurn={currentTurn}
            timeRemaining={timeRemaining}
            turnTotal={turnTotal}
            deltas={deltas}
            fiftyUsedBy={fiftyUsedBy}
            card={card}
            cardDrawn={cardDrawn}
            myTurn={myTurn}
          />
        </div>

        <div className="px-4 pb-6 landscape:w-80 landscape:pb-0 flex-shrink-0">
          <ActionBar
            me={me}
            myTurn={myTurn}
            forecast={forecast}
            cardDrawn={cardDrawn}
            turnPlayer={turnPlayer}
            fiftyAvailable={fiftyAvailable}
            onDraw={handleDraw}
            onStand={handleStand}
          />
        </div>
      </main>

      {/* La carta se está repartiendo (el ejercicio llega en un instante) */}
      {dealing && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none">
          <div className="w-full max-w-md rounded-t-[20px] border border-b-0 border-noir-600 bg-noir-700 px-4 py-6 text-center animate-sheet-up">
            <p className={`font-serif text-lg ${card?.isAce ? 'text-[#f3d58a]' : 'text-cream'}`}>
              {card?.isAce ? '¡Sacaste el AS DORADO!' : card ? `Carta de ${card.value}` : 'Repartiendo…'}
            </p>
            <p className="text-warm-600 text-xs font-sans mt-1 animate-pulse">Preparando tu ejercicio…</p>
          </div>
        </div>
      )}

      {sheet?.exercise && (
        <ExerciseSheet
          exercise={sheet.exercise}
          selected={sheet.selected}
          result={sheet.result}
          removedOptions={sheet.removedOptions}
          card={sheet.card}
          aceChoice={liveSheet ? aceChoice : null}
          myPoints={me?.points ?? 0}
          onAce={handleAce}
          fiftyAvailable={fiftyAvailable}
          fiftyLoading={fiftyLoading}
          onFifty={handleFifty}
          onAnswer={handleAnswer}
          onClose={!liveSheet ? () => setSnapshot(null) : undefined}
          timeRemaining={timeRemaining}
          turnTotal={turnTotal}
        />
      )}
    </div>
  )
}
