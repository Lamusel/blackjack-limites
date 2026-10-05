import { TARGET_SCORE } from '@/lib/constants'
import ForecastPanel from './ForecastPanel'

// Zona de acciones debajo de la mesa
export default function ActionBar({
  me,
  myTurn,
  forecast,
  cardDrawn,
  turnPlayer,
  fiftyAvailable,
  onDraw,
  onStand,
}) {
  const points  = me?.points ?? 0
  const missing = TARGET_SCORE - points

  // ── Mi turno, aún no pido carta ──
  if (myTurn && !cardDrawn) {
    return (
      <div className="card-noir p-4 animate-fade-in">
        <div className="flex items-baseline justify-between mb-3">
          <p className="font-serif text-lg text-cream">Tu turno</p>
          <p className="text-warm-600 text-xs font-sans">
            Tienes <span className="text-gold-400 font-mono">{points}</span> · te faltan {missing}
          </p>
        </div>
        <div className="mb-3">
          <ForecastPanel forecast={forecast} points={points} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={onDraw} disabled={!forecast}
            className="btn-gold w-full !px-3 disabled:opacity-50 disabled:cursor-not-allowed">
            {forecast ? '🃏 Pedir carta' : 'Barajando…'}
          </button>
          <button onClick={onStand}
            className="w-full rounded-btn py-3 px-3 font-sans text-base bg-stand text-stand-text border border-stand-text/30
                       hover:brightness-110 active:scale-95 transition-all">
            ✋ Plantarse
          </button>
        </div>
        <p className="text-warm-600 text-[11px] font-sans text-center mt-3 leading-relaxed">
          Plantarte = pasas este turno y sigues en la mesa · si pides carta debes responderla
          {fiftyAvailable && <> · tienes un <span className="text-gold-400 font-mono">50/50</span></>}
        </p>
      </div>
    )
  }

  // ── Estado cuando no es mi turno (o ya estoy resolviendo) ──
  let title = 'Esperando…'
  let sub   = ''
  if (me?.status === 'eliminated') {
    title = 'Te pasaste de 21'
    sub   = 'Quedas fuera de esta partida, pero puedes seguir mirando'
  } else if (me?.status === 'winner') {
    title = '¡21 exacto!'
    sub   = 'La partida termina al cerrar esta vuelta'
  } else if (myTurn && cardDrawn) {
    title = 'Resolviendo tu carta'
    sub   = 'Responde en la hoja de abajo'
  } else if (turnPlayer && !myTurn) {
    title = `Turno de ${turnPlayer.nickname}`
    sub   = cardDrawn
      ? 'Está resolviendo una carta…'
      : me?.passed
        ? 'Te plantaste en esta vuelta · vuelves a jugar en la siguiente'
        : 'Está decidiendo si pide carta o se planta'
  }

  return (
    <div className="card-noir px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="font-serif text-base text-cream truncate">{title}</p>
        {sub && <p className="text-warm-600 text-xs font-sans leading-snug">{sub}</p>}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="label-muted">Tus puntos</p>
        <p className={`font-serif text-xl leading-none ${points > TARGET_SCORE ? 'text-lose-text' : 'text-gold-400'}`}>
          {points}<span className="text-warm-600 text-sm">/21</span>
        </p>
      </div>
    </div>
  )
}
