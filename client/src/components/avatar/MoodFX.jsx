// ─────────────────────────────────────────────────────────────
// Efectos animados de expresión (se dibujan ENCIMA de cualquier estilo
// de avatar, en el mismo espacio 200×200).
//   anchor = { eyeY, eyes: [xIzq, xDer], top, temple, cheekY }
// ─────────────────────────────────────────────────────────────

const STAR = 'M0,-9 L2,-2 L9,0 L2,2 L0,9 L-2,2 L-9,0 L-2,-2Z'
const HEART = 'M0,4 C-6,-1 -8,-5 -5,-8 C-3,-10 -1,-9 0,-7 C1,-9 3,-10 5,-8 C8,-5 6,-1 0,4Z'
const DROP = 'M0,-7 C3,-2 5,1 5,3.5 C5,6.5 2.8,8.5 0,8.5 C-2.8,8.5 -5,6.5 -5,3.5 C-5,1 -3,-2 0,-7Z'

export default function MoodFX({ mood, anchor = {} }) {
  if (!mood) return null
  const { eyeY = 95, eyes = [86, 114], top = 46, temple = 128, cheekY = 104 } = anchor

  switch (mood) {
    case 'win':
      return (
        <g fill="#f3d58a" className="av-sparkle">
          {[[44, 54, 1], [156, 46, 0.85], [160, 114, 0.7], [40, 120, 0.6]].map(([x, y, sc], i) => (
            <path key={i} transform={`translate(${x} ${y}) scale(${sc})`} d={STAR} />
          ))}
        </g>
      )
    case 'happy':
      return (
        <g fill="#fff3c0">
          {[[146, top + 8, 0.55, 0], [154, top + 26, 0.4, 0.25], [136, top - 2, 0.35, 0.5]].map(([x, y, sc, d], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path className="av-twinkle-fx" style={{ animationDelay: `${d}s` }} transform={`scale(${sc})`} d={STAR} />
            </g>
          ))}
        </g>
      )
    case 'love':
      return (
        <g fill="#e8456a" stroke="#7a1430" strokeWidth=".8">
          {[[140, top + 26, 1.3, 0], [152, top + 12, 1, 0.35], [130, top + 6, 0.8, 0.7]].map(([x, y, sc, d], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path className="av-rise" style={{ animationDelay: `${d}s` }} transform={`scale(${sc})`} d={HEART} />
            </g>
          ))}
        </g>
      )
    case 'sad':
      return (
        <g>
          <g transform={`translate(${eyes[0] - 5} ${eyeY + 8})`}>
            <path className="av-tear" d={DROP} transform="scale(.75)" fill="#8fd0ff" stroke="#3a7ab0" strokeWidth="1" />
          </g>
          <g transform={`translate(142 ${top + 2})`} opacity=".9">
            <g className="av-bob-slow">
              <path d="M-14,4 C-18,4 -18,-4 -12,-4 C-12,-10 -2,-12 0,-6 C4,-10 12,-8 12,-2 C18,-2 18,4 12,4Z" fill="#7d8794" />
              {[-8, -2, 4, 10].map((x, i) => (
                <path key={x} className="av-rain" style={{ animationDelay: `${i * 0.18}s` }} d={`M${x},7 l-1.4,5`} stroke="#8fd0ff" strokeWidth="1.4" strokeLinecap="round" />
              ))}
            </g>
          </g>
        </g>
      )
    case 'shock':
      return (
        <g>
          <g transform={`translate(${temple + 4} ${eyeY - 14})`}>
            <path className="av-sweat" d={DROP} fill="#9ad8ff" stroke="#3a7ab0" strokeWidth="1" />
          </g>
          <g stroke="#f3d58a" strokeWidth="2.6" strokeLinecap="round" className="av-burst-fx">
            <path d={`M142,${top} l8,-8`} /><path d={`M148,${top + 12} l10,-2`} /><path d={`M134,${top - 4} l2,-10`} />
          </g>
        </g>
      )
    case 'focus':
    case 'smug':
      return (
        <g transform={`translate(${eyes[1] + 12} ${eyeY - 9})`} fill="#fff">
          <path className="av-twinkle-fx" transform="scale(.55)" d={STAR} />
        </g>
      )
    case 'think':
      return (
        <g fill="#efe7d8" stroke="#8a8170" strokeWidth=".8">
          <circle cx="130" cy={top + 22} r="2.4" className="av-pop-fx" />
          <circle cx="137" cy={top + 13} r="3.4" className="av-pop-fx" style={{ animationDelay: '.15s' }} />
          <g className="av-pop-fx" style={{ animationDelay: '.3s' }}>
            <circle cx="149" cy={top} r="10" />
            <text x="149" y={top + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#4a3a2a" stroke="none" fontFamily="serif">?</text>
          </g>
        </g>
      )
    case 'dizzy': {
      const orbit = `M64,${top + 2} A36,11 0 1,1 136,${top + 2} A36,11 0 1,1 64,${top + 2}`
      return (
        <g>
          {[0, 1, 2].map(i => (
            <g key={i}>
              <path d={STAR} transform="scale(.8)" fill="#f3d58a" stroke="#7a5a1a" strokeWidth=".8" />
              <animateMotion dur="1.8s" repeatCount="indefinite" begin={`${-i * 0.6}s`} path={orbit} />
            </g>
          ))}
        </g>
      )
    }
    case 'angry':
      return (
        <g>
          <g transform={`translate(${temple + 2} ${top + 14})`}>
            <g className="av-throb" fill="none" stroke="#e03a3a" strokeWidth="2.6" strokeLinecap="round">
              <path d="M-7,-2 C-3,-2 -2,-3 -2,-7 M2,-7 C2,-3 3,-2 7,-2 M7,2 C3,2 2,3 2,7 M-2,7 C-2,3 -3,2 -7,2" />
            </g>
          </g>
          {[56, 144].map((x, i) => (
            <g key={x} transform={`translate(${x} ${top + 10})`}>
              <path className="av-steam" style={{ animationDelay: `${i * 0.3}s` }} d="M0,0 C-4,-4 4,-8 0,-12 C-4,-16 4,-20 0,-24" fill="none" stroke="#e8e2d6" strokeWidth="3" strokeLinecap="round" opacity=".8" />
            </g>
          ))}
        </g>
      )
    default:
      return null
  }
}

// Ojos luminosos que cambian con la expresión (robots, sombras, visores…)
export function GlowEyes({ mood, xs = [86, 114], y = 95, r = 6, color = '#4ae3ff', kind = 'round', glow = true, filterId }) {
  const shapes = xs.map((cx, i) => {
    const side = i === 0 ? -1 : 1   // -1 izquierdo, 1 derecho
    const key = `${cx}-${mood}`
    switch (mood) {
      case 'happy': case 'win':
        return <path key={key} d={`M${cx - r * 1.1},${y + r * 0.5} Q${cx},${y - r * 1.3} ${cx + r * 1.1},${y + r * 0.5}`} fill="none" stroke={color} strokeWidth={r * 0.75} strokeLinecap="round" />
      case 'love':
        return <path key={key} transform={`translate(${cx} ${y}) scale(${r / 5.5})`} d={HEART} fill={color} />
      case 'sad':
        return <rect key={key} x={cx - r * 1.1} y={y - r * 0.2} width={r * 2.2} height={r * 0.9} rx={r * 0.45} fill={color}
          transform={`rotate(${side * -16} ${cx} ${y})`} />
      case 'shock':
        return (
          <g key={key}>
            <circle cx={cx} cy={y} r={r * 1.45} fill="none" stroke={color} strokeWidth={r * 0.35} />
            <circle cx={cx} cy={y} r={r * 0.55} fill={color} />
          </g>
        )
      case 'dizzy':
        return <path key={key} d={`M${cx - r},${y - r} L${cx + r},${y + r} M${cx + r},${y - r} L${cx - r},${y + r}`} stroke={color} strokeWidth={r * 0.55} strokeLinecap="round" />
      case 'angry': case 'focus':
        return <path key={key} d={`M${cx - r * 1.2},${y - (side < 0 ? r * 0.7 : -r * 0.1)} L${cx + r * 1.2},${y - (side < 0 ? -r * 0.1 : r * 0.7)} L${cx + r * 1.2},${y + r * 0.6} L${cx - r * 1.2},${y + r * 0.6}Z`}
          fill={color} />
      case 'smug':
        return <rect key={key} x={cx - r * 1.15} y={y} width={r * 2.3} height={r * 0.7} rx={r * 0.3} fill={color} />
      case 'think':
        return i === 0
          ? <rect key={key} x={cx - r} y={y - r * 0.15} width={r * 2} height={r * 0.6} rx={r * 0.3} fill={color} />
          : <circle key={key} cx={cx + r * 0.3} cy={y - r * 0.4} r={r * 1.05} fill={color} />
      default:
        if (kind === 'slit') return <rect key={key} x={cx - r * 1.3} y={y - r * 0.45} width={r * 2.6} height={r * 0.9} rx={r * 0.45} fill={color} />
        if (kind === 'square') return <rect key={key} x={cx - r} y={y - r} width={r * 2} height={r * 2} rx={r * 0.25} fill={color} />
        return <circle key={key} cx={cx} cy={y} r={r} fill={color} />
    }
  })
  return (
    <g>
      {glow && <g opacity=".55" filter={filterId ? `url(#${filterId})` : undefined}>{shapes}</g>}
      <g>{shapes}</g>
    </g>
  )
}
