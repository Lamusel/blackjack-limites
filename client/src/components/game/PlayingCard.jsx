import { DIFFICULTY } from '@/lib/utils'

// Reverso de carta Art Deco
function Back() {
  return (
    <div className="playing-card relative bg-noir-800 border border-gold-600/60 overflow-hidden shadow-card
                    flex items-center justify-center">
      <div className="absolute inset-1 rounded-[5px] border border-gold-600/40" />
      <svg className="absolute inset-0 w-full h-full opacity-[0.12]" viewBox="0 0 70 100" preserveAspectRatio="none">
        {Array.from({ length: 9 }).map((_, i) => (
          <g key={i}>
            <line x1="35" y1="50" x2={i * 8.75} y2="0" stroke="#c9a84c" strokeWidth="0.6" />
            <line x1="35" y1="50" x2={i * 8.75} y2="100" stroke="#c9a84c" strokeWidth="0.6" />
          </g>
        ))}
      </svg>
      <div className="relative w-7 h-7 rotate-45 border border-gold-500/70 flex items-center justify-center bg-noir-800">
        <span className="-rotate-45 text-gold-500 text-sm leading-none">♠</span>
      </div>
    </div>
  )
}

// Frente: valor de la carta (2–9) o el As dorado
function Front({ card }) {
  const d    = DIFFICULTY[card?.difficulty]
  const ace  = !!card?.isAce
  const val  = ace ? 'A' : (card?.value ?? '?')
  const ink  = ace ? 'text-[#4a3208]' : 'text-[#6e2130]'
  const suit = ace ? '♠' : '♦'
  return (
    <div className={`playing-card relative overflow-hidden shadow-card
      ${ace ? 'border border-[#fff2b0] bg-gradient-to-br from-[#fff2b0] via-[#e8c35a] to-[#a07a28] gold-card'
            : 'bg-cream border border-gold-600'}`}>
      <div className={`absolute top-1 left-1.5 leading-none text-left ${ink}`}>
        <div className="font-serif text-lg">{val}</div>
        <div className="text-xs">{suit}</div>
      </div>
      <div className={`absolute bottom-1 right-1.5 leading-none text-xs rotate-180 ${ink}`}>
        <div className="font-serif text-lg">{val}</div>
        <div className="text-xs">{suit}</div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {ace ? (
          <>
            <span className={`font-serif text-3xl leading-none ${ink}`}>♠</span>
            <span className="mt-1 text-[8px] font-sans uppercase tracking-widest text-[#4a3208]/80">1 u 11</span>
          </>
        ) : (
          <>
            <span className={`font-serif text-3xl leading-none ${ink}`}>{val}</span>
            {d && <span className="mt-1 text-[8px] font-sans uppercase tracking-widest text-noir-900/70">{d.label}</span>}
          </>
        )}
      </div>
      {ace && <div className="absolute inset-0 gold-sheen pointer-events-none" />}
    </div>
  )
}

// Carta en el centro de la mesa. Voltea cuando el jugador del turno la pide:
// el valor es público (todos lo ven), el ejercicio solo lo ve quien juega.
export default function PlayingCard({ card, faceUp = false, glow = false }) {
  const gold = faceUp && card?.isAce
  return (
    <div style={{ perspective: 600 }}
      className={gold ? 'drop-shadow-[0_0_22px_rgba(243,213,138,0.75)]'
               : glow ? 'drop-shadow-[0_0_14px_rgba(201,168,76,0.45)]' : ''}>
      <div className="relative playing-card"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(.2,.8,.2,1)',
          transform: faceUp ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <Back />
        </div>
        <div className="absolute inset-0"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
          <Front card={card} />
        </div>
      </div>
    </div>
  )
}

export { Back as CardBack }
