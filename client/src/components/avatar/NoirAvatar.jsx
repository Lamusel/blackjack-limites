import { useId, memo } from 'react'
import MoodFX from './MoodFX'
import {
  SKIN_TONES, HAIR_COLORS, EYE_COLORS, OUTFIT_COLORS, BACKGROUNDS,
  colorOf, shade, isLight, sanitizeAvatar,
} from '@/lib/avatar'

// ─────────────────────────────────────────────────────────────
// Avatar noir dibujado en SVG (viewBox 200×200).
// Capas: fondo → pelo atrás → ropa → cuello → orejas → cara → rasgos
//        → pelo adelante → gafas → sombrero
// ─────────────────────────────────────────────────────────────

const MIRROR = 'translate(200 0) scale(-1 1)'

// Forma de la cara según tipo
const FACES = {
  oval:   { w: 33, jw: 15, yT: 52, yB: 133 },
  round:  { w: 36, jw: 22, yT: 54, yB: 129 },
  square: { w: 34, jw: 25, yT: 53, yB: 131 },
  long:   { w: 31, jw: 14, yT: 50, yB: 136 },
  heart:  { w: 35, jw: 9,  yT: 52, yB: 133 },
}

function facePath({ w, jw, yT, yB }) {
  const yM = (yT + yB) / 2 + 2
  return [
    `M100,${yB}`,
    `C${100 - jw},${yB} ${100 - w},${yB - 16} ${100 - w},${yM}`,
    `C${100 - w},${yT + 13} ${100 - w * 0.58},${yT} 100,${yT}`,
    `C${100 + w * 0.58},${yT} ${100 + w},${yT + 13} ${100 + w},${yM}`,
    `C${100 + w},${yB - 16} ${100 + jw},${yB} 100,${yB}Z`,
  ].join(' ')
}

// Escala horizontal para que pelo/sombreros se ajusten al ancho de la cara
const fit = (w) => `translate(100 0) scale(${(w / 33).toFixed(3)} 1) translate(-100 0)`

// ── Pelo ──────────────────────────────────────────────────────
function ringOfCircles(cx, cy, rx, ry, from, to, step, r) {
  const out = []
  for (let a = from; a <= to; a += step) {
    const rad = (a * Math.PI) / 180
    out.push(<circle key={a} cx={cx + rx * Math.cos(rad)} cy={cy + ry * Math.sin(rad)} r={r} />)
  }
  return out
}

function HairBack({ style, fill, stroke }) {
  const common = { fill, stroke, strokeWidth: 1.4, strokeLinejoin: 'round' }
  switch (style) {
    case 'waves':
      return <path {...common} d="M60,96 C54,62 76,42 100,42 C124,42 146,62 140,96 C144,118 142,138 130,146 C122,140 120,128 124,112 L76,112 C80,128 78,140 70,146 C58,138 56,118 60,96Z" />
    case 'bob':
      return <path {...common} d="M61,100 C56,64 76,44 100,44 C124,44 144,64 139,100 L141,127 C134,132 125,131 120,125 L120,104 L80,104 L80,125 C75,131 66,132 59,127Z" />
    case 'long':
      return <path {...common} d="M59,94 C54,60 76,42 100,42 C124,42 146,60 141,94 L149,166 C137,174 124,170 120,158 L120,104 L80,104 L80,158 C76,170 63,174 51,166Z" />
    case 'bun':
      return (
        <g {...common}>
          <circle cx="100" cy="37" r="15" />
          <path d="M90,36 C95,30 105,30 110,36" fill="none" stroke={stroke} strokeWidth="1.2" opacity=".6" />
        </g>
      )
    case 'curly':
      return <g {...common}>{ringOfCircles(100, 82, 39, 36, 150, 390, 18, 12)}</g>
    case 'middle':
      return <path {...common} d="M62,96 C58,62 78,44 100,44 C122,44 142,62 138,96 L139,120 C130,124 124,122 120,116 L80,116 C76,122 70,124 61,120Z" />
    case 'ponytail':
      return (
        <g {...common}>
          <path d="M116,58 C148,60 158,100 150,142 C146,154 136,154 134,146 C142,112 138,82 114,68Z" />
          <path d="M140,92 C144,108 144,124 140,138 M134,80 C140,96 140,112 136,128" fill="none" stroke={stroke} strokeWidth="1" opacity=".5" />
        </g>
      )
    case 'braids':
      return (
        <g {...common}>
          <path d="M60,94 C56,62 76,44 100,44 C124,44 144,62 140,94 L134,112 L66,112Z" />
          {[66, 134].map(x => (
            <g key={x}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <ellipse key={i} cx={x + (i % 2 ? 2 : -2) * (x < 100 ? -1 : 1)} cy={106 + i * 10} rx="7.5" ry="6.5" />
              ))}
              <rect x={x - 4} y={164} width="8" height="4" rx="1.5" fill="#c9a84c" stroke="none" />
              <path d={`M${x - 3},168 L${x - 4},176 M${x},168 L${x},177 M${x + 3},168 L${x + 4},176`} stroke={stroke} strokeWidth="2" />
            </g>
          ))}
        </g>
      )
    case 'afro':
      return (
        <g {...common}>
          <ellipse cx="100" cy="76" rx="50" ry="44" />
          {ringOfCircles(100, 76, 50, 44, 0, 345, 15, 12)}
        </g>
      )
    default:
      return null
  }
}

function HairFront({ style, fill, stroke, shine }) {
  const common = { fill, stroke, strokeWidth: 1.4, strokeLinejoin: 'round' }
  const shineLine = (d, o = 0.55) => (
    <path d={d} fill="none" stroke={shine} strokeWidth="2.2" strokeLinecap="round" opacity={o} />
  )
  switch (style) {
    case 'slick':
      return (
        <g>
          <path {...common} d="M66,86 C63,56 80,40 101,40 C123,40 139,56 134,86 C132,74 127,64 116,60 C104,56 88,57 79,63 C72,68 68,76 66,86Z" />
          {shineLine('M82,50 C95,44 112,45 125,53')}
          {shineLine('M79,58 C92,52 110,52 127,61', 0.35)}
          <path d="M72,72 C80,62 92,58 104,58 M70,80 C76,70 86,64 96,62" fill="none" stroke={stroke} strokeWidth="1" opacity=".55" />
        </g>
      )
    case 'sidepart':
      return (
        <g>
          <path {...common} d="M66,88 C62,56 80,38 103,39 C126,40 140,56 134,88 C131,74 126,64 118,60 C108,56 98,60 92,58 C86,62 78,64 72,72 C69,76 67,82 66,88Z" />
          <path d="M92,42 C91,48 92,54 92,58" fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
          {shineLine('M97,46 C108,44 120,48 128,58')}
        </g>
      )
    case 'pompadour':
      return (
        <g>
          <path {...common} d="M66,84 C62,60 70,36 96,30 C120,26 140,44 134,84 C130,70 122,62 110,61 C96,60 82,64 74,70 C70,74 67,78 66,84Z" />
          {shineLine('M78,46 C86,36 104,32 118,38')}
          <path d="M84,44 C92,36 106,34 116,40 M72,66 C80,56 94,52 108,54" fill="none" stroke={stroke} strokeWidth="1" opacity=".5" />
          {shineLine('M76,56 C88,46 108,44 124,50', 0.3)}
        </g>
      )
    case 'waves':
      return (
        <g>
          <path {...common} d="M65,92 C60,60 80,40 104,42 C128,44 140,62 135,90 C130,76 122,66 110,66 C114,72 110,80 101,79 C93,78 92,70 85,70 C76,72 70,80 65,92Z" />
          {shineLine('M76,58 C84,50 92,56 100,50 C108,44 116,52 124,48', 0.5)}
          {shineLine('M70,74 C76,68 82,72 86,66', 0.35)}
        </g>
      )
    case 'bob':
      return (
        <g>
          <path {...common} d="M66,84 C64,58 80,45 100,45 C120,45 136,58 134,84 C127,77 116,75 100,75 C84,75 73,77 66,84Z" />
          {shineLine('M80,56 C92,50 110,50 122,56')}
        </g>
      )
    case 'long':
    case 'bun':
      return (
        <g>
          <path {...common} d="M66,88 C62,58 80,43 100,43 C120,43 138,58 134,88 C129,72 116,60 100,57 C84,60 71,72 66,88Z" />
          <path d="M100,45 L100,57" stroke={stroke} strokeWidth="1.2" opacity=".7" />
          {shineLine('M80,58 C86,50 94,48 98,48', 0.45)}
          {shineLine('M102,48 C108,48 116,50 122,58', 0.45)}
        </g>
      )
    case 'curly':
      return <g {...common}>{ringOfCircles(100, 66, 30, 15, 190, 350, 20, 8.5)}</g>
    case 'middle':
      return (
        <g>
          <path {...common} d="M66,90 C62,60 80,44 100,46 C120,44 138,60 134,90 C131,74 123,64 108,62 C104,60 101,56 100,52 C99,56 96,60 92,62 C77,64 69,74 66,90Z" />
          {shineLine('M78,60 C84,52 92,50 97,50', 0.45)}
          {shineLine('M103,50 C110,50 118,54 124,62', 0.45)}
          <path d="M74,72 C78,66 84,63 90,62 M126,72 C122,66 116,63 110,62" fill="none" stroke={stroke} strokeWidth="1" opacity=".5" />
        </g>
      )
    case 'ponytail':
      return (
        <g>
          <path {...common} d="M67,86 C64,58 80,44 100,44 C120,44 136,58 133,86 C126,70 114,62 100,61 C86,62 74,70 67,86Z" />
          <circle cx="120" cy="60" r="4.5" fill="#7a2838" stroke="#4a1520" strokeWidth="1" />
          {shineLine('M82,54 C92,48 108,48 118,54', 0.45)}
        </g>
      )
    case 'braids':
      return (
        <g>
          <path {...common} d="M66,88 C62,58 80,43 100,43 C120,43 138,58 134,88 C129,72 116,60 100,57 C84,60 71,72 66,88Z" />
          <path d="M100,45 L100,57" stroke={stroke} strokeWidth="1.2" opacity=".7" />
          {shineLine('M80,58 C86,50 94,48 98,48', 0.4)}
          {shineLine('M102,48 C108,48 116,50 122,58', 0.4)}
        </g>
      )
    case 'shortcurl':
      return (
        <g {...common}>
          <path d="M67,84 C65,58 80,47 100,47 C120,47 135,58 133,84 C126,74 114,70 100,70 C86,70 74,74 67,84Z" />
          {ringOfCircles(100, 66, 31, 18, 185, 355, 14, 6.5)}
          {ringOfCircles(100, 56, 22, 8, 190, 350, 26, 6)}
        </g>
      )
    case 'mohawk':
      return (
        <g>
          <path fill={fill} opacity=".35" d="M67,84 C65,60 80,47 100,47 C120,47 135,60 133,84 C126,74 114,70 100,70 C86,70 74,74 67,84Z" />
          <path {...common} d="M89,70 L84,46 L93,52 L94,30 L101,46 L106,26 L109,48 L118,40 L112,70 C104,66 96,66 89,70Z" />
          {shineLine('M97,36 L100,58', 0.5)}
        </g>
      )
    case 'afro':
      return <path {...common} d="M68,86 C68,66 82,58 100,58 C118,58 132,66 132,86 C124,78 112,74 100,74 C88,74 76,78 68,86Z" />
    case 'buzz':
      return <path fill={fill} opacity=".55" d="M67,84 C65,60 80,47 100,47 C120,47 135,60 133,84 C126,74 114,70 100,70 C86,70 74,74 67,84Z" />
    case 'bald':
      return <ellipse cx="88" cy="63" rx="11" ry="5" fill="#fff" opacity=".14" transform="rotate(-18 88 63)" />
    default:
      return null
  }
}

// ── Ojos ──────────────────────────────────────────────────────
function Eye({ type, cx, iris, lid, skin, look = [0, 0], small = false }) {
  const cy = 95
  const white = '#f7f1e6'
  const [lx, ly] = look
  const pupil = (r = 4.2) => {
    const rr = small ? r * 0.7 : r
    const px = cx + lx, py = cy + ly
    return (
      <g>
        <circle cx={px} cy={py} r={rr} fill={iris} />
        <circle cx={px} cy={py} r={rr * 0.45} fill="#0e0c0a" />
        <circle cx={px + rr * 0.35} cy={py - rr * 0.4} r={rr * 0.28} fill="#fff" opacity=".9" />
        <circle cx={px - rr * 0.35} cy={py + rr * 0.35} r={rr * 0.13} fill="#fff" opacity=".7" />
      </g>
    )
  }
  const lowerLash = <path d={`M${cx - 7},${cy + 2.2} Q${cx},${cy + 5.2} ${cx + 7},${cy + 2.2}`} fill="none" stroke={shade(skin, -0.32)} strokeWidth=".9" opacity=".6" />
  const almond = `M${cx - 8},${cy} Q${cx},${cy - 7} ${cx + 8},${cy} Q${cx},${cy + 5.5} ${cx - 8},${cy}Z`
  const lidLine = `M${cx - 9},${cy} Q${cx},${cy - 8.5} ${cx + 9},${cy - 1}`

  switch (type) {
    case 'sharp':
      return (
        <g>
          <path d={`M${cx - 8},${cy + 1} Q${cx},${cy - 4.5} ${cx + 9},${cy - 0.5} Q${cx},${cy + 4} ${cx - 8},${cy + 1}Z`} fill={white} />
          <clipPath id={`c${cx}${type}`}><path d={`M${cx - 8},${cy + 1} Q${cx},${cy - 4.5} ${cx + 9},${cy - 0.5} Q${cx},${cy + 4} ${cx - 8},${cy + 1}Z`} /></clipPath>
          <g clipPath={`url(#c${cx}${type})`}>{pupil(3.8)}</g>
          <path d={`M${cx - 9},${cy + 0.5} Q${cx},${cy - 6} ${cx + 10},${cy - 1.5}`} fill="none" stroke={lid} strokeWidth="2.6" strokeLinecap="round" />
        </g>
      )
    case 'wide':
      return (
        <g>
          <ellipse cx={cx} cy={cy} rx="7.5" ry="6.5" fill={white} />
          {pupil(4.6)}
          <path d={`M${cx - 8.5},${cy - 1} Q${cx},${cy - 9.5} ${cx + 8.5},${cy - 1}`} fill="none" stroke={lid} strokeWidth="1.8" strokeLinecap="round" />
        </g>
      )
    case 'sleepy':
      return (
        <g>
          <path d={almond} fill={white} />
          {pupil(4)}
          <path d={`M${cx - 9},${cy + 0.5} Q${cx},${cy - 9} ${cx + 9},${cy - 0.5} L${cx + 9},${cy + 0.5} Q${cx},${cy - 2.5} ${cx - 9},${cy + 1.5}Z`} fill={shade(skin, -0.14)} />
          <path d={`M${cx - 9},${cy + 1.2} Q${cx},${cy - 2.2} ${cx + 9},${cy}`} fill="none" stroke={lid} strokeWidth="2" strokeLinecap="round" />
        </g>
      )
    case 'lashes':
      return (
        <g>
          <path d={almond} fill={white} />
          {pupil()}
          <path d={lidLine} fill="none" stroke={lid} strokeWidth="2.2" strokeLinecap="round" />
          <path d={`M${cx + 7},${cy - 2.5} l4,-3 M${cx + 4},${cy - 4.8} l3,-3.6 M${cx + 0.5},${cy - 5.8} l1.4,-3.8`} stroke={lid} strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )
    case 'closed':
      return <path d={`M${cx - 8},${cy} Q${cx},${cy - 6} ${cx + 8},${cy}`} fill="none" stroke={lid} strokeWidth="2.2" strokeLinecap="round" />
    case 'happy':
      return <path d={`M${cx - 8},${cy + 2} Q${cx},${cy - 7} ${cx + 8},${cy + 2}`} fill="none" stroke={lid} strokeWidth="2.6" strokeLinecap="round" />
    case 'x':
      return <path d={`M${cx - 5},${cy - 5} L${cx + 5},${cy + 5} M${cx + 5},${cy - 5} L${cx - 5},${cy + 5}`} stroke={lid} strokeWidth="2.4" strokeLinecap="round" />
    default: // calm
      return (
        <g>
          <path d={almond} fill={white} />
          {pupil()}
          {lowerLash}
          <path d={lidLine} fill="none" stroke={lid} strokeWidth="1.9" strokeLinecap="round" />
        </g>
      )
  }
}

// ── Cejas ─────────────────────────────────────────────────────
function Brows({ type, color }) {
  const base = { fill: 'none', stroke: color, strokeLinecap: 'round' }
  const L = {
    arched:   { d: 'M76,83 Q86,76 96,81', w: 3 },
    straight: { d: 'M76,82 Q86,80 96,81', w: 3.2 },
    thick:    { d: 'M75,83 Q86,76 97,81', w: 5 },
    raised:   { d: 'M76,83 Q86,78 96,82', w: 3.2 },
    angry:    { d: 'M76,80 Q87,80 97,85', w: 3.4 },
    sad:      { d: 'M76,84 Q86,81 96,77', w: 3 },
    up:       { d: 'M76,78 Q86,70 96,75', w: 3 },
  }[type] ?? { d: 'M76,83 Q86,76 96,81', w: 3 }
  const R = type === 'raised' ? { d: 'M76,79 Q86,70 96,77', w: 3.2 } : L
  return (
    <g>
      <path {...base} d={L.d} strokeWidth={L.w} />
      <path {...base} d={R.d} strokeWidth={R.w} transform={MIRROR} />
    </g>
  )
}

// ── Nariz ─────────────────────────────────────────────────────
function Nose({ type, skin }) {
  const line = shade(skin, -0.32)
  const sh = shade(skin, -0.12)
  const tip = <circle cx="101.5" cy="103" r="1.4" fill="#fff" opacity=".28" />
  switch (type) {
    case 'straight':
      return (
        <g fill="none" stroke={line} strokeWidth="1.7" strokeLinecap="round">
          <path d="M99,90 L96,106 Q99,109 104,107" />
          <ellipse cx="100" cy="106" rx="5" ry="2.2" fill={sh} stroke="none" opacity=".5" />
          {tip}
        </g>
      )
    case 'roman':
      return (
        <g fill="none" stroke={line} strokeWidth="1.8" strokeLinecap="round">
          <path d="M99,88 Q105,98 99,107 Q101,110 106,108" />
          <path d="M94,107 Q96,109 98,108" />
        </g>
      )
    default:
      return (
        <g fill="none" stroke={line} strokeWidth="1.7" strokeLinecap="round">
          <path d="M95,105 Q100,110 105,105" />
          <ellipse cx="100" cy="103" rx="4.5" ry="3" fill={shade(skin, 0.15)} stroke="none" opacity=".45" />
        </g>
      )
  }
}

// ── Boca ──────────────────────────────────────────────────────
function Mouth({ type, skin }) {
  const lip = shade(skin, -0.38)
  switch (type) {
    case 'smirk':
      return <path d="M90,119 Q103,122 112,113" fill="none" stroke={lip} strokeWidth="2.4" strokeLinecap="round" />
    case 'neutral':
      return <path d="M91,118 Q100,119.5 109,118" fill="none" stroke={lip} strokeWidth="2.4" strokeLinecap="round" />
    case 'grin':
      return (
        <g>
          <path d="M86,114 Q100,132 114,114 Q100,118 86,114Z" fill="#5a1a22" stroke={lip} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M88,115 Q100,118.5 112,115 L111,118 Q100,121 89,118Z" fill="#f7f1e6" />
          <path d="M94,124 Q100,127 106,124" fill="none" stroke="#c85a62" strokeWidth="2" strokeLinecap="round" opacity=".8" />
        </g>
      )
    case 'lips':
      return (
        <g>
          <path d="M88,117 Q94,111.5 100,114.5 Q106,111.5 112,117 Q100,118.5 88,117Z" fill="#8e1f30" />
          <path d="M88,117 Q100,126 112,117 Q100,119.5 88,117Z" fill="#a52a3c" />
          <path d="M96,121 Q100,122.5 104,121" fill="none" stroke="#fff" strokeWidth="1" opacity=".35" strokeLinecap="round" />
        </g>
      )
    case 'surprised':
      return <ellipse cx="100" cy="119" rx="4.6" ry="5.6" fill="#4a1a20" stroke={lip} strokeWidth="1.4" />
    case 'frown':
      return <path d="M89,121 Q100,113 111,121" fill="none" stroke={lip} strokeWidth="2.4" strokeLinecap="round" />
    case 'wavy':
      return <path d="M87,119 q3.25,-3 6.5,0 t6.5,0 t6.5,0 t6.5,0" fill="none" stroke={lip} strokeWidth="2.2" strokeLinecap="round" />
    case 'open':
      return (
        <g>
          <path d="M88,115 Q100,129 112,115 Q100,119 88,115Z" fill="#5a1a22" stroke={lip} strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M94,123 Q100,126 106,123" fill="none" stroke="#c85a62" strokeWidth="2" strokeLinecap="round" opacity=".8" />
        </g>
      )
    default: // smile
      return <path d="M89,116 Q100,126 111,116" fill="none" stroke={lip} strokeWidth="2.4" strokeLinecap="round" />
  }
}

// ── Vello facial ──────────────────────────────────────────────
function FacialHair({ type, color, face }) {
  const { w, yB } = face
  switch (type) {
    case 'pencil':
      return <path d="M88,112 Q94,109.5 100,111 Q106,109.5 112,112" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    case 'mustache':
      return <path d="M83,115 C85,107 96,106 100,110 C104,106 115,107 117,115 C111,112 105,112.5 100,113.5 C95,112.5 89,112 83,115Z" fill={color} stroke={shade(color, -0.3)} strokeWidth="0.8" />
    case 'goatee':
      return (
        <g fill={color}>
          <path d="M86,113 C89,108 97,108 100,111 C103,108 111,108 114,113 C108,111.5 104,112 100,113 C96,112 92,111.5 86,113Z" />
          <path d={`M91,125 C94,130 106,130 109,125 L106,${yB - 1} C102,${yB + 2} 98,${yB + 2} 94,${yB - 1}Z`} />
        </g>
      )
    case 'stubble':
      return (
        <path
          d={`M${100 - w + 3},100 C${100 - w + 3},${yB - 8} 88,${yB} 100,${yB} C112,${yB} ${100 + w - 3},${yB - 8} ${100 + w - 3},100 C116,114 84,114 ${100 - w + 3},100Z`}
          fill={color} opacity=".22" />
      )
    case 'beard':
      return (
        <g>
          <path
            d={`M${100 - w},92 C${100 - w - 1},${yB} 86,${yB + 10} 100,${yB + 10} C114,${yB + 10} ${100 + w + 1},${yB} ${100 + w},92 C${100 + w - 4},110 112,113 100,113 C88,113 ${100 - w + 4},110 ${100 - w},92Z`}
            fill={color} stroke={shade(color, -0.3)} strokeWidth="1" />
          <path d="M83,115 C85,107 96,106 100,110 C104,106 115,107 117,115 C111,112 105,112.5 100,113.5 C95,112.5 89,112 83,115Z" fill={color} />
          <path d={`M90,${yB - 6} q3,4 0,8 M110,${yB - 6} q-3,4 0,8 M100,${yB} l0,7`} stroke={shade(color, 0.25)} strokeWidth="1" fill="none" opacity=".5" />
        </g>
      )
    default:
      return null
  }
}

// ── Ropa ──────────────────────────────────────────────────────
const SHIRT = '#efe7d8'
const BODY = 'M24,200 C26,172 50,156 82,151 L118,151 C150,156 174,172 176,200Z'

function Outfit(props) {
  const { type, color } = props
  const hi = shade(color, 0.18)
  return (
    <g>
      <OutfitBase {...props} />
      {type !== 'dress' && type !== 'vest' && (
        <g fill="none" stroke={hi} strokeLinecap="round" opacity=".35">
          <path d="M32,192 C38,176 52,166 70,160" strokeWidth="2" />
          <path d="M168,192 C162,176 148,166 130,160" strokeWidth="1.2" opacity=".6" />
          <path d="M60,200 C62,190 64,184 68,178 M140,200 C138,190 136,184 132,178" strokeWidth="1" stroke={shade(color, -0.4)} />
        </g>
      )}
    </g>
  )
}

function OutfitBase({ type, color, skin }) {
  const dark = shade(color, -0.32)
  const edge = shade(color, -0.45)
  const hi = shade(color, 0.12)
  switch (type) {
    case 'tuxedo':
      return (
        <g>
          <path d={BODY} fill={color} stroke={edge} strokeWidth="1.2" />
          <path d="M83,151 L100,190 L117,151 C110,154 90,154 83,151Z" fill={SHIRT} />
          <path d="M83,151 L100,190 L93,200 L64,200 C68,180 73,163 80,153Z" fill={dark} />
          <path d="M117,151 L100,190 L107,200 L136,200 C132,180 127,163 120,153Z" fill={dark} />
          <path d="M82,156 C78,170 74,184 70,198" stroke={hi} strokeWidth="1.4" fill="none" opacity=".5" />
          <circle cx="100" cy="176" r="1.6" fill="#1a1714" /><circle cx="100" cy="184" r="1.6" fill="#1a1714" />
        </g>
      )
    case 'suit':
      return (
        <g>
          <path d={BODY} fill={color} stroke={edge} strokeWidth="1.2" />
          <path d="M86,151 L100,180 L114,151Z" fill={SHIRT} />
          <path d="M86,151 L100,180 L96,200 L70,200 C73,180 77,163 83,153 L88,160Z" fill={dark} opacity=".85" />
          <path d="M114,151 L100,180 L104,200 L130,200 C127,180 123,163 117,153 L112,160Z" fill={dark} opacity=".85" />
          <path d="M86,151 L93,162 L100,155 L107,162 L114,151" fill={SHIRT} stroke={shade(SHIRT, -0.15)} strokeWidth=".8" />
          <path d="M56,176 L66,174 L64,182Z" fill="#c9a84c" />
        </g>
      )
    case 'trench':
      return (
        <g>
          <path d={BODY} fill={color} stroke={edge} strokeWidth="1.2" />
          <path d="M90,151 L100,170 L110,151Z" fill={SHIRT} />
          <path d="M82,148 L100,174 L76,192 L60,168 C66,158 74,151 82,148Z" fill={hi} stroke={edge} strokeWidth="1" />
          <path d="M118,148 L100,174 L124,192 L140,168 C134,158 126,151 118,148Z" fill={hi} stroke={edge} strokeWidth="1" />
          <circle cx="86" cy="190" r="2" fill={edge} /><circle cx="114" cy="190" r="2" fill={edge} />
        </g>
      )
    case 'dress':
      return (
        <g>
          <path d={BODY} fill={skin} />
          <path d="M70,170 C74,164 76,158 80,152 M130,170 C126,164 124,158 120,152" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M44,200 C48,184 58,173 72,170 C80,178 90,182 100,176 C110,182 120,178 128,170 C142,173 152,184 156,200Z" fill={color} stroke={edge} strokeWidth="1.2" />
          <path d="M76,176 C86,186 96,186 100,180" stroke={hi} strokeWidth="1.5" fill="none" opacity=".5" />
          <path d="M72,152 C80,160 92,164 100,164 C108,164 120,160 128,152" stroke={shade(skin, -0.18)} strokeWidth="1.2" fill="none" opacity=".6" />
        </g>
      )
    case 'turtleneck':
      return (
        <g>
          <path d={BODY} fill={color} stroke={edge} strokeWidth="1.2" />
          <path d="M85,127 L85,152 C92,158 108,158 115,152 L115,127 C108,131 92,131 85,127Z" fill={hi} stroke={edge} strokeWidth="1" />
          <path d="M86,135 C93,139 107,139 114,135 M86,143 C93,147 107,147 114,143" stroke={dark} strokeWidth="1" fill="none" />
          <path d="M60,200 L64,176 M140,200 L136,176" stroke={dark} strokeWidth="1" opacity=".6" />
        </g>
      )
    case 'vest':
      return (
        <g>
          <path d={BODY} fill={SHIRT} stroke={shade(SHIRT, -0.25)} strokeWidth="1.2" />
          <path d="M44,190 C50,178 54,172 58,168 M156,190 C150,178 146,172 142,168" stroke={shade(SHIRT, -0.2)} strokeWidth="1" fill="none" />
          <path d="M62,200 C64,182 72,166 84,153 L100,184 L116,153 C128,166 136,182 138,200Z" fill={color} stroke={edge} strokeWidth="1.2" />
          <path d="M86,151 L93,162 L100,155 L107,162 L114,151" fill={SHIRT} stroke={shade(SHIRT, -0.15)} strokeWidth=".8" />
          <circle cx="100" cy="190" r="1.8" fill="#c9a84c" /><circle cx="100" cy="197" r="1.8" fill="#c9a84c" />
        </g>
      )
    default:
      return <path d={BODY} fill={color} />
  }
}

function Neckwear({ type, outfitColor, outfit }) {
  const accent = isLight(outfitColor) ? '#1a1714' : '#7a2838'
  switch (type) {
    case 'bowtie':
      return (
        <g fill={outfit === 'tuxedo' ? '#141210' : accent}>
          <path d="M100,156 L86,149 C84,154 84,159 86,163Z" />
          <path d="M100,156 L114,149 C116,154 116,159 114,163Z" />
          <rect x="97" y="152.5" width="6" height="7" rx="2" fill={shade(outfit === 'tuxedo' ? '#141210' : accent, 0.2)} />
        </g>
      )
    case 'tie':
      return (
        <g fill={accent}>
          <path d="M96,155 L104,155 L102.5,161 L97.5,161Z" />
          <path d="M97.5,161 L102.5,161 L107,190 L100,198 L93,190Z" />
          <path d="M98,170 L104,166 M97,178 L105,173" stroke={shade(accent, 0.3)} strokeWidth="1.2" opacity=".6" />
        </g>
      )
    case 'pearls': {
      const y0 = outfit === 'dress' ? 154 : 150
      const pts = Array.from({ length: 11 }, (_, i) => {
        const t = i / 10
        return [84 + 32 * t, y0 + 9 * Math.sin(Math.PI * t)]
      })
      return (
        <g>
          {pts.map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="2.6" fill="#f3ece0" stroke="#cfc4b0" strokeWidth=".5" />
              <circle cx={x - 0.8} cy={y - 0.8} r=".8" fill="#fff" />
            </g>
          ))}
        </g>
      )
    }
    case 'scarf':
      return (
        <g>
          <path d="M87,150 C93,158 107,158 113,150 L109,171 C104,177 96,177 91,171Z" fill="#7a2838" stroke="#4a1520" strokeWidth=".8" />
          <circle cx="96" cy="162" r="1.2" fill="#c9a84c" /><circle cx="104" cy="164" r="1.2" fill="#c9a84c" /><circle cx="100" cy="170" r="1.2" fill="#c9a84c" />
        </g>
      )
    default:
      return null
  }
}

// ── Gafas ─────────────────────────────────────────────────────
function Eyewear({ type, w }) {
  const earX = 100 - w
  switch (type) {
    case 'round':
      return (
        <g fill="rgba(255,255,255,0.08)" stroke="#c9a84c" strokeWidth="2">
          <circle cx="86" cy="95" r="10.5" /><circle cx="114" cy="95" r="10.5" />
          <path d="M96.5,94 Q100,90.5 103.5,94" fill="none" />
          <path d={`M75.5,93 L${earX + 1},91 M124.5,93 L${200 - earX - 1},91`} fill="none" strokeWidth="1.6" />
        </g>
      )
    case 'cateye':
      return (
        <g fill="rgba(255,255,255,0.06)" stroke="#5a1a26" strokeWidth="2.6" strokeLinejoin="round">
          <path d="M73,89 C76,86 92,86 96,91 C96,100 91,103 85,103 C78,103 74,98 74,92 L70,85Z" />
          <path d="M73,89 C76,86 92,86 96,91 C96,100 91,103 85,103 C78,103 74,98 74,92 L70,85Z" transform={MIRROR} />
          <path d="M96,92 Q100,89 104,92" fill="none" />
        </g>
      )
    case 'shades':
      return (
        <g>
          <defs>
            <linearGradient id="shadesG" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a3631" /><stop offset="1" stopColor="#0e0c0a" />
            </linearGradient>
          </defs>
          {[false, true].map(m => (
            <g key={String(m)} transform={m ? MIRROR : undefined}>
              <path d="M74,90 C75,86 96,86 97,90 C97,100 92,104 86,104 C79,104 74,98 74,90Z" fill="url(#shadesG)" stroke="#c9a84c" strokeWidth="1.2" />
              <path d="M78,90 L84,99" stroke="#fff" strokeWidth="1.4" opacity=".25" strokeLinecap="round" />
            </g>
          ))}
          <path d="M96,89 L104,89" stroke="#c9a84c" strokeWidth="1.6" />
          <path d={`M74,90 L${earX + 1},89 M126,90 L${200 - earX - 1},89`} stroke="#c9a84c" strokeWidth="1.4" />
        </g>
      )
    case 'monocle':
      return (
        <g>
          <circle cx="114" cy="95" r="10.5" fill="rgba(255,255,255,0.1)" stroke="#c9a84c" strokeWidth="2" />
          <path d="M123,101 C130,116 128,136 134,154" fill="none" stroke="#c9a84c" strokeWidth="1" strokeDasharray="2 1.6" />
        </g>
      )
    default:
      return null
  }
}

// ── Sombreros ─────────────────────────────────────────────────
function Headwear({ type, outfitColor }) {
  const light = isLight(outfitColor)
  const hat = light ? shade(outfitColor, -0.15) : shade(outfitColor, 0.08)
  const hatEdge = shade(hat, -0.4)
  const band = light ? '#2b2622' : '#7a2838'
  switch (type) {
    case 'fedora':
      return (
        <g transform="rotate(-5 100 64)">
          <path d="M70,64 C68,46 73,30 100,28 C127,30 132,46 130,64Z" fill={hat} stroke={hatEdge} strokeWidth="1.2" />
          <path d="M80,34 C90,42 110,42 120,34" fill="none" stroke={hatEdge} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M70,55 C90,59 110,59 130,55 L130,64 C110,67 90,67 70,64Z" fill={band} />
          <path d="M32,68 C44,57 156,57 168,68 C158,79 42,79 32,68Z" fill={shade(hat, -0.08)} stroke={hatEdge} strokeWidth="1.2" />
          <path d="M42,67 C70,61 130,61 158,67" fill="none" stroke={shade(hat, 0.2)} strokeWidth="1" opacity=".5" />
        </g>
      )
    case 'tophat':
      return (
        <g>
          <path d="M72,64 L75,16 C90,12 110,12 125,16 L128,64Z" fill="#16130f" stroke="#000" strokeWidth="1" />
          <path d="M73,52 L127,52 L128,62 L72,62Z" fill="#7a2838" />
          <path d="M80,18 L78,50" stroke="#fff" strokeWidth="2" opacity=".08" />
          <path d="M46,66 C60,56 140,56 154,66 C140,75 60,75 46,66Z" fill="#1f1b17" stroke="#000" strokeWidth="1" />
        </g>
      )
    case 'beret':
      return (
        <g transform="rotate(-10 100 54)">
          <path d="M58,66 C52,48 74,34 102,34 C134,34 152,48 146,62 C132,72 76,74 58,66Z" fill={band === '#7a2838' ? '#6e2130' : '#1a1714'} stroke="#0e0c0a" strokeWidth="1" />
          <path d="M100,34 L101,27" stroke="#0e0c0a" strokeWidth="3" strokeLinecap="round" />
          <path d="M64,64 C88,70 120,70 142,62" fill="none" stroke="#000" strokeWidth="1" opacity=".3" />
        </g>
      )
    case 'cap':
      return (
        <g>
          <path d="M62,72 C56,48 80,35 104,36 C130,37 146,52 138,72 C120,64 82,64 62,72Z" fill={hat} stroke={hatEdge} strokeWidth="1.2" />
          <path d="M64,70 C84,80 116,80 136,70 C130,84 72,84 64,70Z" fill={shade(hat, -0.15)} stroke={hatEdge} strokeWidth="1" />
          <path d="M100,37 L100,66 M80,40 C84,52 86,60 86,67 M120,40 C116,52 114,60 114,67" stroke={hatEdge} strokeWidth=".9" fill="none" opacity=".6" />
          <circle cx="102" cy="37" r="3" fill={hatEdge} />
        </g>
      )
    case 'visor':
      return (
        <g>
          <path d="M63,72 C80,63 120,63 137,72 L137,78 C120,70 80,70 63,78Z" fill="#1a1714" stroke="#000" strokeWidth=".8" />
          <path d="M62,76 C80,68 120,68 138,76 L148,90 C120,81 80,81 52,90Z" fill="#2f8a5a" opacity=".78" stroke="#1d5a3a" strokeWidth="1.2" />
          <path d="M60,82 C82,76 118,76 142,82" fill="none" stroke="#bff0d4" strokeWidth="1" opacity=".35" />
          <circle cx="100" cy="71" r="2.6" fill="#c9a84c" />
        </g>
      )
    case 'widebrim':
      return (
        <g transform="rotate(-7 100 62)">
          <path d="M20,70 C38,52 162,52 180,70 C162,85 38,85 20,70Z" fill={hat} stroke={hatEdge} strokeWidth="1.2" />
          <path d="M66,66 C66,44 80,38 100,38 C120,38 134,44 134,66Z" fill={shade(hat, 0.06)} stroke={hatEdge} strokeWidth="1.2" />
          <path d="M66,58 C88,63 112,63 134,58 L134,66 C112,70 88,70 66,66Z" fill={band} />
          <path d="M128,62 C138,56 146,58 144,64 C140,68 134,66 128,62Z M128,62 C136,68 138,74 132,74 C128,72 128,68 128,62Z" fill={band} />
          <path d="M30,70 C60,62 140,62 170,70" fill="none" stroke={shade(hat, 0.22)} strokeWidth="1" opacity=".45" />
        </g>
      )
    case 'feather':
      return (
        <g>
          <path d="M70,66 C84,58 116,58 130,66" fill="none" stroke={band} strokeWidth="4" strokeLinecap="round" />
          <path d="M126,66 C130,44 142,28 160,16 C154,34 146,50 132,68Z" fill="#f0e6d3" stroke="#bfb29a" strokeWidth=".8" />
          <path d="M128,66 C136,48 146,34 158,19" fill="none" stroke="#9a8e78" strokeWidth="1" />
          {[0, 1, 2, 3, 4].map(i => (
            <path key={i} d={`M${132 + i * 5},${58 - i * 9} l7,-2`} stroke="#d8ccb6" strokeWidth=".8" />
          ))}
          <circle cx="128" cy="65" r="3.2" fill="#c9a84c" />
        </g>
      )
    case 'flower':
      return (
        <g transform="translate(132 64)">
          <path d="M-4,8 C-14,10 -18,4 -16,0 C-10,2 -6,4 -4,8Z M4,8 C12,14 18,10 18,6 C12,6 8,6 4,8Z" fill="#2d5a3d" />
          {[0, 72, 144, 216, 288].map(a => (
            <ellipse key={a} cx="0" cy="-6.5" rx="6" ry="8" fill="#f3ece0" stroke="#d8ccb6" strokeWidth=".6" transform={`rotate(${a})`} />
          ))}
          {[36, 108, 180, 252, 324].map(a => (
            <ellipse key={a} cx="0" cy="-4" rx="3.6" ry="5" fill="#fffaf0" transform={`rotate(${a})`} />
          ))}
          <circle r="2.6" fill="#c9a84c" />
        </g>
      )
    case 'cowboy': {
      const leather = '#7a5232', le = '#3e2814'
      return (
        <g transform="rotate(-4 100 66)">
          <path d="M68,70 C66,50 72,34 86,32 C92,38 108,38 114,32 C128,34 134,50 132,70Z" fill={leather} stroke={le} strokeWidth="1.4" />
          <path d="M86,33 C92,44 108,44 114,33" fill="none" stroke={le} strokeWidth="1.6" />
          <path d="M68,60 C90,64 110,64 132,60 L132,68 C110,72 90,72 68,68Z" fill="#2b1d12" />
          <circle cx="78" cy="64" r="2.4" fill="#c9c2b0" />
          <path d="M22,60 C34,72 66,76 100,76 C134,76 166,72 178,60 C176,74 156,86 100,86 C44,86 24,74 22,60Z" fill={shade(leather, -0.08)} stroke={le} strokeWidth="1.4" />
          <path d="M34,70 C60,78 140,78 166,70" fill="none" stroke={shade(leather, 0.25)} strokeWidth="1.2" opacity=".5" />
        </g>
      )
    }
    case 'beanie': {
      const k = light ? shade(outfitColor, -0.2) : '#7a2838'
      return (
        <g>
          <path d="M64,74 C60,46 80,30 100,30 C120,30 140,46 136,74Z" fill={k} stroke={shade(k, -0.4)} strokeWidth="1.3" />
          {[76, 88, 100, 112, 124].map(x => (
            <path key={x} d={`M${x},${36 + Math.abs(100 - x) * 0.25} L${x},68`} stroke={shade(k, -0.25)} strokeWidth="1.2" opacity=".6" />
          ))}
          <path d="M61,64 C86,71 114,71 139,64 L140,80 C114,87 86,87 60,80Z" fill={shade(k, 0.1)} stroke={shade(k, -0.4)} strokeWidth="1.3" />
          {[66, 74, 82, 90, 98, 106, 114, 122, 130].map(x => (
            <path key={x} d={`M${x},68 L${x},82`} stroke={shade(k, -0.2)} strokeWidth="1.4" opacity=".55" />
          ))}
          <g className="av-bob-slow">
            <circle cx="100" cy="27" r="9" fill={shade(k, 0.25)} stroke={shade(k, -0.3)} strokeWidth="1" />
            <circle cx="97" cy="24" r="3" fill="#fff" opacity=".25" />
          </g>
        </g>
      )
    }
    case 'bucket': {
      const b = light ? shade(outfitColor, -0.12) : '#a89068'
      return (
        <g>
          <path d="M62,70 C62,48 78,36 100,36 C122,36 138,48 138,70Z" fill={b} stroke={shade(b, -0.45)} strokeWidth="1.3" />
          <path d="M64,62 C88,66 112,66 136,62" fill="none" stroke={shade(b, -0.35)} strokeWidth="1.2" strokeDasharray="3 2" />
          <path d="M46,72 C60,64 140,64 154,72 L162,88 C132,80 68,80 38,88Z" fill={shade(b, -0.06)} stroke={shade(b, -0.45)} strokeWidth="1.3" />
          <path d="M44,82 C70,76 130,76 156,82" fill="none" stroke={shade(b, -0.35)} strokeWidth="1" strokeDasharray="3 2" />
        </g>
      )
    }
    case 'bandana':
      return (
        <g>
          <path d="M64,72 C84,62 116,62 136,72 L137,84 C116,75 84,75 63,84Z" fill="#a52a2a" stroke="#5a1414" strokeWidth="1.2" />
          {[72, 84, 96, 108, 120, 130].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 74 : 77} r="1.4" fill="#f3ece0" opacity=".85" />
          ))}
          <g className="av-sway" style={{ transformOrigin: '138px 78px' }}>
            <path d="M136,74 C146,72 152,78 156,86 C150,86 144,84 138,80Z" fill="#a52a2a" stroke="#5a1414" strokeWidth="1" />
            <path d="M137,80 C144,84 148,92 148,100 C143,96 139,90 136,84Z" fill="#8e2222" stroke="#5a1414" strokeWidth="1" />
          </g>
        </g>
      )
    case 'headphones':
      return (
        <g>
          <path d="M62,96 C56,40 144,40 138,96" fill="none" stroke="#1a1714" strokeWidth="7" strokeLinecap="round" />
          <path d="M66,90 C64,52 136,52 134,90" fill="none" stroke="#3a3631" strokeWidth="2" opacity=".8" />
          {[0, 1].map(i => (
            <g key={i} transform={i ? MIRROR : undefined}>
              <rect x="52" y="84" width="18" height="30" rx="8" fill="#1f1c19" stroke="#000" strokeWidth="1" />
              <rect x="56" y="88" width="10" height="22" rx="5" fill="#2e2a26" />
              <rect x="50" y="90" width="4" height="18" rx="2" fill="#c9a84c" className="av-glow" />
            </g>
          ))}
          <g fill="#f3d58a" className="av-notes">
            <path d="M40,74 l0,-12 l8,-2 l0,11" stroke="#f3d58a" strokeWidth="1.4" fill="none" />
            <circle cx="38" cy="74" r="2.6" /><circle cx="46" cy="71" r="2.6" />
          </g>
        </g>
      )
    case 'crown':
      return (
        <g transform="rotate(-6 100 50)">
          <path d="M68,62 L70,34 L84,48 L100,26 L116,48 L130,34 L132,62Z" fill="#e2b744" stroke="#7a5a1a" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M68,56 L132,56 L132,64 L68,64Z" fill="#c9a03a" stroke="#7a5a1a" strokeWidth="1" />
          <path d="M74,40 L76,56 M126,40 L124,56" stroke="#fff3c0" strokeWidth="1.2" opacity=".5" />
          {[[70, 34], [100, 26], [130, 34]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" fill="#fff3c0" stroke="#7a5a1a" strokeWidth=".8" />)}
          <circle cx="100" cy="60" r="3.2" fill="#b0283a" /><circle cx="84" cy="60" r="2.4" fill="#2a6ab0" /><circle cx="116" cy="60" r="2.4" fill="#2a8a4a" />
          <g fill="#fff8d8" className="av-twinkle">
            <path transform="translate(118 36) scale(.5)" d="M0,-9 L2,-2 L9,0 L2,2 L0,9 L-2,2 L-9,0 L-2,-2Z" />
          </g>
        </g>
      )
    case 'halo':
      return (
        <g className="av-bob">
          <ellipse cx="100" cy="30" rx="28" ry="7.5" fill="none" stroke="#fff3c0" strokeWidth="7" opacity=".25" />
          <ellipse cx="100" cy="30" rx="28" ry="7.5" fill="none" stroke="#f3d58a" strokeWidth="3.6" />
          <ellipse cx="100" cy="29" rx="28" ry="7.5" fill="none" stroke="#fffbe8" strokeWidth="1.2" opacity=".8" />
        </g>
      )
    case 'horns':
      return (
        <g className="av-glow">
          {[0, 1].map(i => (
            <g key={i} transform={i ? MIRROR : undefined}>
              <path d="M76,62 C66,52 62,38 68,22 C72,36 80,46 90,54Z" fill="#8e1f24" stroke="#3a0a0c" strokeWidth="1.3" />
              <path d="M70,28 C70,38 74,46 80,52" fill="none" stroke="#e05a4a" strokeWidth="1.4" opacity=".6" />
            </g>
          ))}
        </g>
      )
    case 'catears': {
      const f = hat
      return (
        <g>
          <g className="av-twitch" style={{ transformOrigin: '80px 60px' }}>
            <path d="M66,66 L70,28 L94,52Z" fill={f} stroke={shade(f, -0.45)} strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M71,58 L73,38 L86,52Z" fill="#e8a0a8" />
          </g>
          <g transform={MIRROR}>
            <path d="M66,66 L70,28 L94,52Z" fill={f} stroke={shade(f, -0.45)} strokeWidth="1.4" strokeLinejoin="round" />
            <path d="M71,58 L73,38 L86,52Z" fill="#e8a0a8" />
          </g>
        </g>
      )
    }
    default:
      return null
  }
}

// ── Accesorios ────────────────────────────────────────────────
function Gear({ type, skin, face, layer }) {
  const earX = 100 - face.w - 1
  const earY = (face.yT + face.yB) / 2 + 12
  // layer 'face' = sobre la cara (antes del pelo) · 'body' = sobre la ropa
  if (layer === 'body') {
    switch (type) {
      case 'goldchain':
        return (
          <g>
            <path d="M80,151 C84,170 116,170 120,151" fill="none" stroke="#7a5a1a" strokeWidth="4.4" />
            <path d="M80,151 C84,170 116,170 120,151" fill="none" stroke="#e2b744" strokeWidth="3" strokeDasharray="3.4 1.4" />
            <circle cx="100" cy="172" r="7.5" fill="#e2b744" stroke="#7a5a1a" strokeWidth="1.2" />
            <text x="100" y="175.5" textAnchor="middle" fontSize="9" fill="#7a5a1a" fontFamily="serif">♠</text>
            <circle cx="97" cy="169" r="1.6" fill="#fff8d8" className="av-twinkle" />
          </g>
        )
      case 'medal':
        return (
          <g transform="translate(124 162)">
            <path d="M-6,0 L6,0 L4,12 L-4,12Z" fill="#7a2838" />
            <path d="M-2,0 L2,0 L1.4,12 L-1.4,12Z" fill="#f3ece0" />
            <circle cy="18" r="7" fill="#e2b744" stroke="#7a5a1a" strokeWidth="1.2" />
            <path transform="translate(0 18) scale(.45)" d="M0,-9 L2,-2 L9,0 L2,2 L0,9 L-2,2 L-9,0 L-2,-2Z" fill="#fff3c0" />
          </g>
        )
      case 'earpiece':
        return <path d={`M${earX - 2},${earY + 6} C${earX - 6},${earY + 20} ${earX + 2},${earY + 26} ${earX - 2},${earY + 34} C${earX - 6},${earY + 42} ${earX},${earY + 50} 84,152`} fill="none" stroke="#d8d2c6" strokeWidth="1.2" opacity=".85" />
      default:
        return null
    }
  }
  switch (type) {
    case 'eyepatch':
      return (
        <g>
          <path d="M104,86 L64,72 M124,92 L136,96" stroke="#141210" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M104,88 C108,84 122,84 125,90 C126,100 120,106 114,106 C108,106 103,100 104,88Z" fill="#141210" stroke="#000" strokeWidth="1" />
          <path d="M108,90 C112,88 118,88 121,91" stroke="#4a443d" strokeWidth="1" fill="none" />
        </g>
      )
    case 'mask':
      return (
        <path fillRule="evenodd" fill="#141210" stroke="#000" strokeWidth="1"
          d="M66,90 C72,80 92,82 100,89 C108,82 128,80 134,90 C136,100 128,106 116,104 C108,103 104,99 100,99 C96,99 92,103 84,104 C72,106 64,100 66,90Z
             M78,95 C80,90 92,90 94,95 C92,99 80,99 78,95Z M106,95 C108,90 120,90 122,95 C120,99 108,99 106,95Z" />
      )
    case 'warpaint':
      return (
        <g fill="#1a1714" opacity=".82">
          <path d="M74,104 L94,103 L93,107 L75,109Z" /><path d="M76,111 L92,110 L91,113 L77,115Z" />
          <path d="M126,104 L106,103 L107,107 L125,109Z" /><path d="M124,111 L108,110 L109,113 L123,115Z" />
        </g>
      )
    case 'earpiece':
      return (
        <g>
          <ellipse cx={earX} cy={earY - 2} rx="3.4" ry="4.6" fill="#d8d2c6" stroke="#8a8478" strokeWidth=".8" />
          <circle cx={earX} cy={earY - 2} r="1.2" fill="#3a8a5a" className="av-blink-led" />
        </g>
      )
    case 'toothpick':
      return <path d="M107,119 L127,111" stroke="#d9c08a" strokeWidth="2" strokeLinecap="round" />
    case 'bandaid':
      return (
        <g transform="translate(120 108) rotate(-35)">
          <rect x="-9" y="-3.2" width="18" height="6.4" rx="3" fill="#e7b98f" stroke="#b48660" strokeWidth=".7" />
          <rect x="-3" y="-2.4" width="6" height="4.8" fill="#d4a27a" />
          <g transform="rotate(70)">
            <rect x="-9" y="-3.2" width="18" height="6.4" rx="3" fill="#e7b98f" stroke="#b48660" strokeWidth=".7" />
          </g>
        </g>
      )
    default:
      return null
  }
}

// ── Detalles ──────────────────────────────────────────────────
function Detail({ type, skin, face }) {
  const earX = 100 - face.w - 1
  const earY = (face.yT + face.yB) / 2 + 12
  switch (type) {
    case 'mole':
      return <circle cx="111" cy="123" r="1.7" fill="#3a2418" />
    case 'freckles':
      return (
        <g fill={shade(skin, -0.35)} opacity=".55">
          {[[84, 104], [88, 107], [80, 108], [116, 104], [112, 107], [120, 108], [93, 101], [107, 101]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.1" />
          ))}
        </g>
      )
    case 'blush':
      return (
        <g fill="#d0606a" opacity=".24">
          <ellipse cx="80" cy="108" rx="7.5" ry="4.2" /><ellipse cx="120" cy="108" rx="7.5" ry="4.2" />
        </g>
      )
    case 'pearl':
      return (
        <g>
          {[earX, 200 - earX].map(x => (
            <g key={x}><circle cx={x} cy={earY} r="3.4" fill="#f3ece0" stroke="#cfc4b0" strokeWidth=".6" /><circle cx={x - 1} cy={earY - 1} r="1" fill="#fff" /></g>
          ))}
        </g>
      )
    case 'hoops':
      return (
        <g fill="none" stroke="#c9a84c" strokeWidth="1.8">
          <circle cx={earX} cy={earY + 3} r="5" /><circle cx={200 - earX} cy={earY + 3} r="5" />
        </g>
      )
    case 'chip':
      return (
        <g transform={`translate(${200 - earX + 4} ${earY - 18}) rotate(20)`}>
          <circle r="7" fill="#7a2838" stroke="#f0e6d3" strokeWidth="2" strokeDasharray="2.4 2" />
          <circle r="3.6" fill="#f0e6d3" />
          <circle r="2" fill="#c9a84c" />
        </g>
      )
    case 'scar':
      return (
        <g stroke={shade(skin, -0.3)} strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path d="M77,98 L89,114" />
          <path d="M79,104 L83,101 M82,108 L86,105 M85,112 L89,109" strokeWidth="1.1" />
        </g>
      )
    default:
      return null
  }
}

// Encuadres: 'tight' para íconos pequeños (mesa, lobby), 'full' para el estudio,
// y acercamientos para las miniaturas del estudio.
export const FRAMING = {
  full:  '0 0 200 200',
  tight: '24 18 152 152',
  bust:  '34 26 132 132',
  head:  '44 22 112 112',
  eyes:  '62 66 76 76',
  mouth: '62 84 76 76',
  body:  '20 96 160 104',
}

// ── Expresiones según lo que pasa en la partida ───────────────
export const MOODS = {
  happy: { eyes: 'happy', mouth: 'grin', brows: 'arched' },
  win:   { eyes: 'happy', mouth: 'grin', brows: 'up', sparkle: true },
  love:  { eyes: 'happy', mouth: 'smile', brows: 'arched', blush: true },
  sad:   { eyes: 'calm', look: [0, 2.2], mouth: 'frown', brows: 'sad' },
  shock: { eyes: 'wide', small: true, mouth: 'surprised', brows: 'up' },
  focus: { eyes: 'sharp', look: [0, 1.4], mouth: 'neutral', brows: 'angry' },
  think: { eyes: 'calm', look: [2.4, -1.8], mouth: 'smirk', brows: 'raised' },
  smug:  { eyes: 'sleepy', mouth: 'smirk', brows: 'straight' },
  dizzy: { eyes: 'x', mouth: 'wavy', brows: 'sad' },
  angry: { eyes: 'sharp', mouth: 'frown', brows: 'angry' },
}

const seedNumber = (s) => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)

// ── Componente principal ──────────────────────────────────────
function NoirAvatar({ avatar, seed = 'jugador', size = 64, framing = 'tight', className = '', title, mood = null, animated = false }) {
  const viewBox = FRAMING[framing] ?? FRAMING.tight
  const [, , vw, vh] = viewBox.split(' ').map(Number)
  const uid = useId().replace(/:/g, '')
  const a = sanitizeAvatar(avatar, seed)

  const skin    = colorOf(SKIN_TONES, a.skin)
  const hair    = colorOf(HAIR_COLORS, a.hairColor)
  const iris    = colorOf(EYE_COLORS, a.eyeColor)
  const outfitC = colorOf(OUTFIT_COLORS, a.outfitColor)
  const bg      = colorOf(BACKGROUNDS, a.bg)
  const face    = FACES[a.face] ?? FACES.oval
  const yMid    = (face.yT + face.yB) / 2 + 2

  const hairEdge  = shade(hair, -0.35)
  const hairShine = shade(hair, isLight(hair) ? 0.45 : 0.35)
  const browColor = shade(hair, isLight(hair) ? -0.35 : -0.1)
  const lid       = shade(skin, -0.6)
  const skinEdge  = shade(skin, -0.28)
  const hasHat    = ['fedora', 'tophat', 'beret', 'cap', 'widebrim', 'cowboy', 'beanie', 'bucket'].includes(a.headwear)
  const m         = (mood && MOODS[mood]) || null
  const eyesType  = m?.eyes ?? a.eyes
  const mouthType = m?.mouth ?? a.mouth
  const browsType = m?.brows ?? a.brows
  const look      = m?.look ?? [0, 0]
  const blinkDelay = `${-(seedNumber(seed) % 4500) / 1000}s`
  // Con sombrero grande, los peinados muy altos se ven raros → se recortan atrás
  const hairBack  = hasHat && a.hair === 'afro' ? 'curly' : a.hair

  return (
    <svg viewBox={viewBox} width={size} height={size * (vh / vw)} className={`${animated ? 'av-anim ' : ''}${className}`}
      preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}
      role="img" aria-label={title ?? 'Avatar'} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg${uid}`} cx="50%" cy="42%" r="70%">
          <stop offset="0" stopColor={shade(bg, 0.16)} />
          <stop offset=".65" stopColor={bg} />
          <stop offset="1" stopColor={shade(bg, -0.45)} />
        </radialGradient>
        <radialGradient id={`sk${uid}`} cx="40%" cy="36%" r="75%">
          <stop offset="0" stopColor={shade(skin, 0.14)} />
          <stop offset=".6" stopColor={skin} />
          <stop offset="1" stopColor={shade(skin, -0.14)} />
        </radialGradient>
        <linearGradient id={`sd${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".22" />
          <stop offset=".35" stopColor="#000" stopOpacity="0" />
          <stop offset=".8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".1" />
        </linearGradient>
        <clipPath id={`rim${uid}`}><rect x="114" y="40" width="60" height="110" /></clipPath>
        <linearGradient id={`hr${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(hair, 0.12)} />
          <stop offset="1" stopColor={shade(hair, -0.18)} />
        </linearGradient>
      </defs>

      {/* Fondo con rayos art deco */}
      <rect width="200" height="200" fill={`url(#bg${uid})`} />
      <g fill="#e8d5a3" opacity=".06">
        {Array.from({ length: 18 }, (_, i) => {
          const a1 = (i * 20 * Math.PI) / 180, a2 = ((i * 20 + 8) * Math.PI) / 180
          return <path key={i} d={`M100,96 L${100 + 160 * Math.cos(a1)},${96 + 160 * Math.sin(a1)} L${100 + 160 * Math.cos(a2)},${96 + 160 * Math.sin(a2)}Z`} />
        })}
      </g>
      <circle cx="100" cy="84" r="62" fill="#fff" opacity=".05" />

      <g className={animated ? 'av-breathe' : undefined}>
      {/* Pelo de atrás */}
      <g transform={fit(face.w)}>
        <HairBack style={hairBack} fill={`url(#hr${uid})`} stroke={hairEdge} />
      </g>

      {/* Ropa + cuello */}
      <path d="M87,116 L87,152 C93,159 107,159 113,152 L113,116Z" fill={shade(skin, -0.06)} />
      <Outfit type={a.outfit} color={outfitC} skin={skin} />
      {a.outfit !== 'turtleneck' && (
        <path d="M87,122 C94,133 106,133 113,122 L113,131 C106,139 94,139 87,131Z" fill={shade(skin, -0.25)} opacity=".55" />
      )}
      <Neckwear type={a.neckwear} outfitColor={outfitC} outfit={a.outfit} />
      <Gear type={a.gear} skin={skin} face={face} layer="body" />

      {/* Orejas */}
      {[100 - face.w + 1, 100 + face.w - 1].map((x, i) => (
        <g key={i}>
          <ellipse cx={x} cy={yMid + 1} rx="6.5" ry="10" fill={skin} stroke={skinEdge} strokeWidth="1.2" />
          <path d={i === 0 ? `M${x + 1},${yMid - 4} q-3,5 0,10` : `M${x - 1},${yMid - 4} q3,5 0,10`} fill="none" stroke={skinEdge} strokeWidth="1.2" opacity=".7" />
        </g>
      ))}

      {/* Cara + volumen (sombra lateral y luz de borde dorada) */}
      <path d={facePath(face)} fill={`url(#sk${uid})`} stroke={skinEdge} strokeWidth="1.4" />
      <path d={facePath(face)} fill={`url(#sd${uid})`} />
      <path d={facePath(face)} fill="none" stroke="#f3d58a" strokeWidth="2.4" opacity=".38" clipPath={`url(#rim${uid})`} />

      {/* Vello facial (debajo de boca) */}
      {(a.facialHair === 'stubble' || a.facialHair === 'beard') && (
        <FacialHair type={a.facialHair} color={hair} face={face} />
      )}

      <Detail type={a.detail} skin={skin} face={face} />

      {/* Rasgos (cambian con la expresión) */}
      <g key={mood ?? 'base'} className={mood ? 'av-pop' : undefined}>
        {m?.blush && (
          <g fill="#e0607a" opacity=".35"><ellipse cx="80" cy="108" rx="7.5" ry="4.2" /><ellipse cx="120" cy="108" rx="7.5" ry="4.2" /></g>
        )}
        <Brows type={browsType} color={browColor} />
        <g className={animated && !['happy', 'x', 'closed'].includes(eyesType) ? 'av-blink' : undefined}
          style={animated ? { animationDelay: blinkDelay } : undefined}>
          {eyesType === 'wink' ? (
            <g>
              <Eye type="calm" cx={86} iris={iris} lid={lid} skin={skin} look={look} />
              <Eye type="closed" cx={114} iris={iris} lid={lid} skin={skin} />
            </g>
          ) : (
            <g>
              <Eye type={eyesType} cx={86} iris={iris} lid={lid} skin={skin} look={look} small={m?.small} />
              <Eye type={eyesType} cx={114} iris={iris} lid={lid} skin={skin} look={look} small={m?.small} />
            </g>
          )}
        </g>
        <Nose type={a.nose} skin={skin} />
        <Mouth type={mouthType} skin={skin} />
      </g>
      {['pencil', 'mustache', 'goatee'].includes(a.facialHair) && (
        <FacialHair type={a.facialHair} color={hair} face={face} />
      )}
      <Gear type={a.gear} skin={skin} face={face} layer="face" />

      {/* Pelo de adelante */}
      <g transform={fit(face.w)}>
        <HairFront style={a.hair} fill={`url(#hr${uid})`} stroke={hairEdge} shine={hairShine} />
      </g>

      <Eyewear type={a.eyewear} w={face.w} />
      <g transform={fit(face.w)}>
        <Headwear type={a.headwear} outfitColor={outfitC} />
      </g>
      </g>

      <MoodFX mood={mood} anchor={{ eyeY: 95, eyes: [86, 114], top: face.yT - 6, temple: 100 + face.w - 6, cheekY: 104 }} />
    </svg>
  )
}

export default memo(NoirAvatar)
export { Eye, Brows, Mouth, Nose, FacialHair, facePath, FACES, MIRROR }
