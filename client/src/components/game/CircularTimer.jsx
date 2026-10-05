// Timer circular SVG. Se pone rojo en los últimos 10 segundos.
export default function CircularTimer({ seconds = 0, total = 90, size = 64 }) {
  const stroke = 4
  const r      = (size - stroke) / 2
  const c      = 2 * Math.PI * r
  const pct    = total > 0 ? Math.max(0, Math.min(1, seconds / total)) : 0
  const danger = seconds <= 10

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}
      role="timer" aria-label={`${seconds} segundos restantes`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2e2a25" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          className={danger ? 'text-lose-text' : 'text-gold-500'}
          style={{ transition: 'stroke-dashoffset 1s linear, color 0.3s' }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center font-mono text-sm
                        ${danger ? 'text-lose-text animate-pulse' : 'text-cream'}`}>
        {Math.max(0, Math.ceil(seconds))}
      </span>
    </div>
  )
}
