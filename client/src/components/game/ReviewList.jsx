import { useState } from 'react'
import { DIFFICULTY } from '@/lib/utils'
import { topicLabel } from '@/lib/constants'
import MathText from '@/components/ui/MathText'

// Repaso PRIVADO: solo los ejercicios que respondió este jugador
export default function ReviewList({ review = [] }) {
  const [open, setOpen] = useState(null)

  if (!review.length) {
    return (
      <p className="text-warm-600 text-xs font-sans text-center py-2">
        No respondiste ejercicios en esta partida.
      </p>
    )
  }

  const correctCount = review.filter(r => r.correct).length

  return (
    <div>
      <p className="text-warm-400 text-xs font-sans mb-3">
        Acertaste <span className="text-win-text font-mono">{correctCount}</span> de{' '}
        <span className="font-mono text-cream">{review.length}</span>. Toca uno para ver la solución.
      </p>
      <div className="flex flex-col gap-2">
        {review.map((r, i) => {
          const isOpen = open === i
          const d = DIFFICULTY[r.difficulty]
          return (
            <div key={i} className={`rounded-btn border ${r.correct ? 'border-win/70' : 'border-lose/80'} bg-noir-800`}>
              <button onClick={() => setOpen(isOpen ? null : i)} className="w-full text-left px-3 py-2.5 flex items-start gap-2">
                <span className="mt-0.5">{r.correct ? '✅' : '❌'}</span>
                <span className="flex-1 min-w-0">
                  <MathText text={r.question} className="block text-cream text-sm font-sans leading-snug break-words" />
                  <span className="block text-warm-600 text-[11px] font-sans mt-0.5">
                    {r.ace ? '✦ As dorado' : `Carta ${r.points ?? ''}`} · {topicLabel(r.topic)} · {d?.label ?? r.difficulty} ·{' '}
                    <span className={r.delta >= 0 ? 'text-win-text' : 'text-lose-text'}>
                      {r.delta > 0 ? `+${r.delta}` : r.delta}
                    </span>
                  </span>
                </span>
                <span className="text-warm-600 text-xs mt-1">{isOpen ? '▲' : '▼'}</span>
              </button>

              {isOpen && (
                <div className="px-3 pb-3 pt-1 border-t border-noir-600 text-xs font-sans animate-fade-in">
                  <p className="mt-2">
                    <span className="label-muted">Tu respuesta · </span>
                    <span className={r.correct ? 'text-win-text' : 'text-lose-text'}>
                      {r.answer ? <MathText text={r.answer} /> : 'Sin responder (tiempo agotado)'}
                    </span>
                  </p>
                  {!r.correct && (
                    <p className="mt-1">
                      <span className="label-muted">Correcta · </span>
                      <MathText text={r.correctAnswer} className="text-gold-400" />
                    </p>
                  )}
                  {r.explanation && (
                    <MathText block text={r.explanation} className="mt-2 text-warm-400 leading-relaxed whitespace-pre-line" />
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
