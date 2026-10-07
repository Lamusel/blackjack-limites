import AvatarRenderer from '@/components/avatar/AvatarRenderer'
import { winTier } from '@/lib/avatar'

// Asiento de un jugador alrededor de la mesa.
// El turno se marca con un anillo dorado que se va vaciando (timer).
export default function Seat({
  onClick,
  player,
  isMe = false,
  isTurn = false,
  timeRemaining = 0,
  turnTotal = 90,
  delta = null,
  fiftyUsed = false,
  mood = null,
}) {
  const tier = winTier(player.wins ?? 0)
  const size       = isMe ? 58 : 48
  const ring       = size + 10
  const stroke     = 3
  const r          = (ring - stroke) / 2
  const c          = 2 * Math.PI * r
  const pct        = turnTotal > 0 ? Math.max(0, Math.min(1, timeRemaining / turnTotal)) : 0
  const danger     = isTurn && timeRemaining <= 10
  const eliminated = player.status === 'eliminated'
  const left       = !!player.left                          // salió de la partida
  const away       = !left && !!player.away                 // se le cortó la conexión (puede volver)
  const standing   = !left && !!player.passed && !isTurn    // se plantó en esta vuelta
  const winner     = player.status === 'winner'

  return (
    <button type="button" onClick={onClick}
      aria-label={isMe ? 'Reaccionar' : `Lanzar algo a ${player.nickname}`}
      className="flex flex-col items-center select-none cursor-pointer active:scale-95 transition-transform
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-[14px]"
      style={{ width: isMe ? 92 : 78 }}>
      {/* Avatar con anillo de turno */}
      <div className="relative" style={{ width: ring, height: ring }}>
        {isTurn && (
          <svg width={ring} height={ring} className="absolute inset-0 -rotate-90 pointer-events-none">
            <circle cx={ring / 2} cy={ring / 2} r={r} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={stroke} />
            <circle cx={ring / 2} cy={ring / 2} r={r} fill="none"
              stroke={danger ? '#cf7e7e' : '#c9a84c'} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }} />
          </svg>
        )}

        {/* Marco según victorias (bronce · plata · oro) */}
        {tier && !isTurn && (
          <div className="absolute rounded-full" title={tier.label}
            style={{ width: size + 7, height: size + 7, left: (ring - size - 7) / 2, top: (ring - size - 7) / 2, background: tier.ring }} />
        )}
        <div
          className={`absolute rounded-full overflow-hidden bg-noir-800 border-2 transition-all
            ${isTurn ? 'border-transparent animate-seat-glow' : winner ? 'border-gold-400' : standing ? 'border-stand-text/60' : tier ? 'border-noir-900' : 'border-gold-600/45'}
            ${left ? 'grayscale opacity-50' : away ? 'grayscale opacity-60' : eliminated ? 'grayscale-[.7] opacity-75' : ''}`}
          style={{ width: size, height: size, left: (ring - size) / 2, top: (ring - size) / 2 }}>
          <AvatarRenderer nickname={player.nickname} avatar={player.avatar} size={size} framing="bust" mood={mood} animated />
        </div>

        {/* Etiquetas de estado */}
        {away && !eliminated && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 rounded-pill bg-noir-700 text-gold-400
                           text-[9px] font-sans font-medium tracking-wider border border-gold-600/50 animate-pulse z-[1]">
            VOLVIENDO…
          </span>
        )}
        {standing && !away && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 rounded-pill bg-stand text-stand-text
                           text-[9px] font-sans font-medium tracking-wider border border-black/40">
            SE PLANTÓ
          </span>
        )}
        {left && !eliminated && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 rounded-pill bg-noir-700 text-warm-400
                           text-[9px] font-sans font-medium tracking-wider border border-black/40">
            SALIÓ
          </span>
        )}
        {eliminated && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 rounded-pill bg-lose text-lose-text
                           text-[9px] font-sans font-medium tracking-wider border border-black/40">
            SE PASÓ
          </span>
        )}
        {winner && (
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-gold-400 text-base">♛</span>
        )}
        {isTurn && !standing && !eliminated && (
          <span className={`absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-noir-900 border
                            flex items-center justify-center font-mono text-[10px]
                            ${danger ? 'border-lose-text text-lose-text' : 'border-gold-500 text-gold-400'}`}>
            {Math.max(0, Math.ceil(timeRemaining))}
          </span>
        )}
        {(player.streak ?? 0) >= 2 && !eliminated && (
          <span title={`${player.streak} aciertos seguidos`}
            className={`absolute -top-1 -left-2 px-1.5 rounded-pill border text-[10px] font-mono leading-4
                        ${player.streak >= 3 ? 'bg-[#4a1d0e] border-[#e0803a] text-[#ffb36b] animate-streak' : 'bg-noir-900 border-noir-500 text-warm-400'}`}>
            🔥{player.streak}
          </span>
        )}
        {fiftyUsed && (
          <span title="Ya usó su 50/50"
            className="absolute top-1/2 -right-3 px-1 rounded-pill bg-noir-900 border border-noir-500 text-[8px] font-mono text-warm-400">
            50/50
          </span>
        )}

        {/* Delta flotante (+4 / -2) */}
        {delta !== null && delta !== 0 && (
          <span className="absolute left-1/2 -translate-x-1/2 -top-4 z-10 pointer-events-none">
            <span key={`${delta}-${player.points}`}
              className={`block font-mono text-sm font-medium px-1.5 rounded-btn animate-float-up
                          ${delta > 0 ? 'bg-win text-win-text' : 'bg-lose text-lose-text'}`}
              style={{ animationDuration: '1.8s' }}>
              {delta > 0 ? `+${delta}` : delta}
            </span>
          </span>
        )}
      </div>

      {/* Placa con nombre */}
      <div className={`mt-1 max-w-full px-2 py-0.5 rounded-pill border text-center leading-tight
                       ${isTurn ? 'bg-noir-900 border-gold-600' : 'bg-noir-900/85 border-noir-600'}`}>
        <span className={`block truncate text-[11px] font-sans
                          ${eliminated ? 'line-through text-warm-600' : isMe ? 'text-gold-400' : 'text-cream'}`}>
          {isMe ? 'Tú' : player.nickname}
        </span>
      </div>
    </button>
  )
}
