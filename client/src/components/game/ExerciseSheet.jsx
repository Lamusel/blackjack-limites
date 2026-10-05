import { useEffect, useState } from 'react'
import { DIFFICULTY } from '@/lib/utils'
import { topicLabel } from '@/lib/constants'
import { penaltyFor, TARGET } from '@/lib/cards'
import MathText from '@/components/ui/MathText'
import CircularTimer from './CircularTimer'
import { MiniCard } from './ForecastPanel'

const LETTERS = ['A', 'B', 'C', 'D']

// Cuenta regresiva local para elegir el As
function useCountdown(seconds, active) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (!active) return
    setLeft(seconds)
    const t = setInterval(() => setLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [active, seconds])
  return left
}

// Panel dorado: el As vale 1 u 11, tú decides
function AceChooser({ myPoints, timeLimit = 15, onAce }) {
  const [sent, setSent] = useState(null)
  const left = useCountdown(timeLimit, true)

  const Option = ({ value }) => {
    const total = myPoints + value
    const bust  = total > TARGET
    const exact = total === TARGET
    return (
      <button disabled={!!sent} onClick={() => { setSent(value); onAce?.(value) }}
        className={`flex-1 rounded-[14px] border px-3 py-3 flex flex-col items-center gap-1 transition-all active:scale-95
          ${sent === value ? 'border-[#fff2b0] bg-[#e8c35a]/25 scale-[1.03]' : sent ? 'opacity-40 border-noir-600 bg-noir-800'
            : bust ? 'border-lose-text/50 bg-lose/20 hover:bg-lose/30'
            : 'border-[#e8c35a]/70 bg-[#4a3208]/40 hover:bg-[#4a3208]/70'}`}>
        <span className="font-serif text-3xl text-[#f3d58a] leading-none">{value}</span>
        <span className="text-[11px] font-sans text-warm-400">
          quedas en <span className={`font-mono ${bust ? 'text-lose-text' : exact ? 'text-gold-400' : 'text-cream'}`}>{total}</span>
        </span>
        <span className={`text-[10px] font-sans uppercase tracking-wider ${bust ? 'text-lose-text' : exact ? 'text-gold-400' : 'text-warm-600'}`}>
          {bust ? 'te pasas' : exact ? '¡21 exacto! ♛' : 'seguro'}
        </span>
      </button>
    )
  }

  return (
    <div className="mt-4 rounded-[16px] border border-[#e8c35a]/70 bg-gradient-to-b from-[#4a3208]/60 to-noir-800 p-3 animate-fade-in ace-glow">
      <div className="flex items-center gap-2 mb-3">
        <MiniCard value="A" gold size="lg" />
        <div className="flex-1">
          <p className="font-serif text-[#f3d58a] text-lg leading-tight">¡Acertaste el As!</p>
          <p className="text-[11px] font-sans text-warm-400">Como en el blackjack real: decide cuánto vale</p>
        </div>
        <span className="font-mono text-xs text-[#f3d58a] tabular-nums">{left}s</span>
      </div>
      <div className="flex gap-2">
        <Option value={1} />
        <Option value={11} />
      </div>
      <p className="text-[10px] font-sans text-warm-600 text-center mt-2">
        {sent ? 'Listo…' : 'Si no eliges, se toma el mejor valor sin pasarte'}
      </p>
    </div>
  )
}

// Hoja inferior con el ejercicio (solo la ve quien tiene el turno)
export default function ExerciseSheet({
  exercise,
  selected,
  result,
  removedOptions = [],
  card,
  aceChoice,
  myPoints = 0,
  onAce,
  fiftyAvailable,
  fiftyLoading,
  onFifty,
  onAnswer,
  onClose,
  timeRemaining,
  turnTotal,
}) {
  const isAce   = !!card?.isAce
  const diffKey = card?.difficulty ?? exercise.difficulty
  const diff    = DIFFICULTY[diffKey] ?? { label: diffKey, emoji: '' }
  const value   = isAce ? 'A' : (card?.value ?? exercise.points)
  const penalty = card?.penalty ?? (isAce ? 1 : penaltyFor(exercise.points ?? 2))
  const locked  = !!selected || !!result

  const optionClass = (opt) => {
    const base = 'w-full text-left rounded-btn px-4 py-3 font-sans text-sm border transition-all flex items-start gap-2'
    const removed = removedOptions.includes(opt)
    if (result) {
      const isSel     = opt === selected
      const isCorrect = result.correct ? isSel : opt === result.correctAnswer
      if (isCorrect)                return `${base} bg-win border-win text-win-text`
      if (isSel && !result.correct) return `${base} bg-lose border-lose text-lose-text`
      return `${base} bg-noir-800 border-noir-600 text-warm-600 opacity-50`
    }
    if (aceChoice && opt === selected) return `${base} bg-win border-win text-win-text`
    if (removed) return `${base} bg-noir-900 border-noir-700 text-warm-600/50 line-through cursor-not-allowed`
    if (locked) {
      return opt === selected
        ? `${base} bg-noir-700 border-gold-500 text-cream`
        : `${base} bg-noir-800 border-noir-600 text-warm-600 opacity-50`
    }
    return `${base} bg-noir-800 border-noir-600 text-cream hover:border-gold-600 hover:bg-noir-700 active:scale-[0.98]`
  }

  const resultLine = () => {
    if (!result) return ''
    if (result.correct) {
      return result.aceValue
        ? `¡Correcto! Tu As vale ${result.aceValue} → +${result.pointsDelta}`
        : `¡Correcto! +${result.pointsDelta}`
    }
    return `${result.timeout ? 'Se acabó el tiempo' : 'Incorrecto'} ${result.pointsDelta < 0 ? result.pointsDelta : ''}`
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none">
      <div className={`pointer-events-auto w-full max-w-md landscape:max-w-xl animate-sheet-up
                      bg-noir-700 border border-b-0 rounded-t-[20px]
                      shadow-[0_-12px_40px_rgba(0,0,0,0.6)] max-h-[78vh] overflow-y-auto
                      ${isAce ? 'border-[#e8c35a]/70' : 'border-noir-600'}`}>
        {/* Encabezado */}
        <div className="sticky top-0 bg-noir-700 pt-2 pb-3 px-4 border-b border-noir-600 z-10">
          <div className="w-10 h-1 rounded-full bg-noir-500 mx-auto mb-3" />
          <div className="flex items-center gap-3">
            <MiniCard value={value} gold={isAce} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {isAce ? (
                  <span className="px-2 py-0.5 rounded-pill text-[11px] font-sans border border-[#e8c35a] text-[#f3d58a] bg-[#4a3208]/60">
                    ✦ As dorado · 1 u 11
                  </span>
                ) : (
                  <span className={`badge-difficulty badge-${diffKey}`}>{diff.emoji} +{value}</span>
                )}
                {exercise.topic && (
                  <span className="text-warm-400 text-[11px] font-sans uppercase tracking-wider truncate">
                    {topicLabel(exercise.topic)}
                  </span>
                )}
              </div>
              <p className="text-warm-600 text-[11px] font-sans mt-1">
                {diff.label} · si fallas pierdes <span className="text-lose-text">{penalty}</span>
              </p>
            </div>

            {/* 50/50 (comodín bien visible) */}
            <button onClick={onFifty} disabled={!fiftyAvailable || locked || fiftyLoading}
              title={fiftyAvailable ? 'Quita 2 opciones incorrectas (1 por partida)' : 'Ya usaste tu 50/50'}
              className={`relative flex-shrink-0 flex flex-col items-center justify-center w-[62px] h-[52px] rounded-[12px] border-2 transition-all
                ${fiftyAvailable && !locked
                  ? 'border-[#fff2b0] bg-gradient-to-b from-[#f3d58a] to-[#b08d3e] text-noir-900 shadow-[0_0_18px_rgba(243,213,138,0.55)] fifty-pulse hover:scale-105 active:scale-95'
                  : 'border-noir-600 bg-noir-800 text-warm-600 opacity-60 cursor-not-allowed'}`}>
              <span className="text-[17px] leading-none">{fiftyLoading ? '…' : '🎯'}</span>
              <span className="font-mono font-bold text-[12px] leading-none mt-1">50/50</span>
              {!fiftyAvailable && (
                <span className="text-[8px] font-sans leading-none mt-0.5">usado</span>
              )}
            </button>

            {!result && !aceChoice && <CircularTimer seconds={timeRemaining} total={turnTotal} size={46} />}
          </div>
        </div>

        <div className="p-4 pb-6">
          <MathText block text={exercise.question}
            className="text-cream font-sans text-base leading-relaxed mb-4 break-words" />

          <div className="flex flex-col gap-2">
            {exercise.options.map((opt, i) => {
              const removed = removedOptions.includes(opt)
              return (
                <button key={i} disabled={locked || removed} onClick={() => onAnswer(opt)} className={optionClass(opt)}>
                  <span className="text-warm-600 font-mono flex-shrink-0 pt-0.5">{LETTERS[i]}.</span>
                  <MathText text={opt} className="break-words min-w-0" />
                </button>
              )
            })}
          </div>

          {aceChoice && !result && (
            <AceChooser myPoints={aceChoice.points ?? myPoints} timeLimit={aceChoice.timeLimit ?? 15} onAce={onAce} />
          )}

          {selected && !result && !aceChoice && (
            <p className="text-warm-600 text-xs font-sans text-center mt-3 animate-pulse">Verificando…</p>
          )}
          {result && (
            <div className="mt-4 animate-fade-in">
              <p className={`text-center font-serif text-lg ${result.correct ? (result.aceValue ? 'text-[#f3d58a]' : 'text-win-text') : 'text-lose-text'}`}>
                {resultLine()}
              </p>
              {!result.correct && result.pointsDelta === 0 && (
                <p className="text-center text-warm-600 text-xs font-sans mt-1">
                  Estabas en 0, así que no perdiste puntos
                </p>
              )}
              {!result.correct && result.explanation && (
                <div className="mt-3 rounded-btn bg-noir-800 border border-noir-600 p-3">
                  <p className="label-muted mb-1">Cómo se resuelve</p>
                  <MathText block text={result.explanation}
                    className="text-warm-400 text-xs font-sans leading-relaxed whitespace-pre-line" />
                  <p className="text-warm-600 text-[10px] font-sans mt-2">🔒 Solo tú ves esta explicación</p>
                </div>
              )}
              {onClose && (
                <button onClick={onClose} className="btn-outline w-full mt-4">Entendido</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}