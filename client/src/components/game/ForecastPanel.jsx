import { difficultyFor, difficultyLabel, forecastOdds, penaltyFor, pct } from '@/lib/cards'

const TONE = {
  easy:     { ring: 'border-win-text/60',  text: 'text-win-text',  bg: 'bg-win/30' },
  medium:   { ring: 'border-blue-300/50',  text: 'text-blue-300',  bg: 'bg-blue-900/30' },
  hard:     { ring: 'border-stand-text/60',text: 'text-stand-text',bg: 'bg-stand/40' },
  advanced: { ring: 'border-lose-text/60', text: 'text-lose-text', bg: 'bg-lose/30' },
}

// Mini carta con el valor
function MiniCard({ value, gold = false, size = 'md' }) {
  const dims = size === 'lg' ? 'w-10 h-14 text-2xl' : 'w-7 h-10 text-base'
  return (
    <div className={`${dims} rounded-[6px] flex items-center justify-center font-serif flex-shrink-0 shadow-card
                     ${gold ? 'bg-gradient-to-b from-[#fff2b0] via-[#e8c35a] to-[#a07a28] text-[#4a3208] border border-[#fff2b0]'
                            : 'bg-cream text-[#6e2130] border border-gold-600'}`}>
      {value}
    </div>
  )
}

/**
 * "Probabilidad en el azar": qué carta te puede salir antes de decidir.
 * Muestra las 2 cartas más probables en grande, el resto repartido, el As dorado
 * y tu riesgo de pasarte si aciertas.
 */
export default function ForecastPanel({ forecast, points = 0, compact = false }) {
  if (!forecast) {
    return <div className="h-24 rounded-card border border-noir-600 bg-noir-800 animate-pulse" />
  }
  const [top1, top2, ...rest] = forecast.cards
  const restP = rest.reduce((s, c) => s + c.p, 0)
  const { bust, exact } = forecastOdds(forecast, points)
  const risk = bust >= 0.5 ? 'lose' : bust >= 0.25 ? 'stand' : 'win'

  const Big = ({ c }) => {
    const d = difficultyFor(c.value)
    const t = TONE[d]
    return (
      <div className={`flex-1 min-w-0 flex items-center gap-2.5 rounded-[12px] border ${t.ring} ${t.bg} px-2.5 py-2`}>
        <MiniCard value={c.value} size="lg" />
        <div className="min-w-0">
          <p className={`font-serif text-2xl leading-none ${t.text}`}>{pct(c.p)}</p>
          <p className="text-[10px] font-sans text-warm-400 mt-1 leading-tight">
            {difficultyLabel(d)} · <span className="text-lose-text/90">−{penaltyFor(c.value)}</span> si fallas
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <p className="label-muted">Pronóstico de tu carta</p>
        <p className="text-[10px] font-sans text-warm-600">probabilidad en el azar</p>
      </div>

      <div className="flex gap-2">
        <Big c={top1} />
        <Big c={top2} />
      </div>

      {!compact && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar rounded-[10px] border border-noir-600 bg-noir-900 px-2 py-1.5">
            <span className="text-[10px] font-sans text-warm-600 mr-1 flex-shrink-0">Resto {pct(restP)}</span>
            {rest.sort((a, b) => a.value - b.value).map(c => (
              <span key={c.value} className="flex-shrink-0 inline-flex items-center gap-0.5 px-1 rounded bg-noir-800 border border-noir-600">
                <span className="font-serif text-[11px] text-cream">{c.value}</span>
                <span className="text-[9px] font-mono text-warm-600">{pct(c.p)}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1.5 rounded-[10px] border border-[#e8c35a]/60 bg-[#4a3208]/40 px-2 py-1">
            <MiniCard value="A" gold />
            <span className="text-[10px] font-mono text-[#f3d58a]">{pct(forecast.ace)}</span>
          </div>
        </div>
      )}

      {/* Riesgo */}
      <div className="mt-2.5">
        <div className="flex items-baseline justify-between text-[11px] font-sans mb-1">
          <span className="text-warm-400">
            Si aciertas: <span className={risk === 'lose' ? 'text-lose-text' : risk === 'stand' ? 'text-stand-text' : 'text-win-text'}>
              {pct(bust)} de pasarte
            </span>
          </span>
          {exact > 0 && <span className="text-gold-400">{pct(exact)} de llegar a 21 ♛</span>}
        </div>
        <div className="h-1.5 rounded-full bg-noir-900 border border-noir-600 overflow-hidden flex">
          <div className="h-full bg-win-text/80" style={{ width: `${(1 - bust - exact) * 100}%` }} />
          <div className="h-full bg-gold-400" style={{ width: `${exact * 100}%` }} />
          <div className="h-full bg-lose-text/90" style={{ width: `${bust * 100}%` }} />
        </div>
      </div>
    </div>
  )
}

export { MiniCard }
