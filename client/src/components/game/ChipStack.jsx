// Montón de fichas que representa los puntos de un jugador.
// Fichas negras/doradas = 5 pts, fichas crema = 1 pt.  Ej: 13 → 5 5 · 1 1 1
export default function ChipStack({ points = 0, dim = false }) {
  const pts   = Math.max(0, Math.min(points, 30))
  const fives = Math.floor(pts / 5)
  const ones  = pts % 5

  if (pts === 0) return null   // sin fichas: la mesa queda limpia

  const column = (count, cls, keyPrefix) => (
    <div className="relative" style={{ width: 22, height: 22 + (count - 1) * 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={`${keyPrefix}-${i}`}
          className={`chip ${cls} absolute left-0 animate-chip-drop`}
          style={{ bottom: i * 4, animationDelay: `${i * 40}ms` }} />
      ))}
    </div>
  )

  return (
    <div className={`flex flex-col items-center transition-opacity ${dim ? 'opacity-40 grayscale' : ''}`}>
      <div className="flex items-end gap-0.5">
        {fives > 0 && column(fives, 'chip-5', 'f')}
        {ones  > 0 && column(ones,  'chip-1', 'o')}
      </div>
      <span className="mt-1 px-1.5 rounded-pill bg-black/45 font-mono text-[10px] leading-4 text-gold-400">
        {points}
      </span>
    </div>
  )
}
