import { memo, useId } from 'react'
import {
  SKIN_TONES, BACKGROUNDS, ACCENTS, OP_CAMO, AR_COLOR, AR_VISOR, BK_COLOR, BK_SHIRT, BK_EYES,
  RB_METAL, MY_COLOR, colorOf, shade, isLight,
} from '@/lib/avatar'
import { Eye, Brows, Mouth, Nose, FacialHair, facePath, MOODS, FRAMING, MIRROR } from './NoirAvatar'
import MoodFX, { GlowEyes } from './MoodFX'

// ─────────────────────────────────────────────────────────────
// Estilos "imagen de jugador": Táctico · Armadura · Bloques · Robot · Místico
// Todos en el mismo lienzo 200×200 que el clásico (cabeza ~x100 y95,
// hombros abajo) para que los encuadres de la mesa funcionen igual.
// ─────────────────────────────────────────────────────────────

const BODY = 'M24,200 C26,172 50,156 82,151 L118,151 C150,156 174,172 176,200Z'

// ═════════════════════════ TÁCTICO ═════════════════════════
const CAMO = {
  woodland: { base: '#4a5636', c1: '#2f3a22', c2: '#6b6a45', c3: '#20261a' },
  desert:   { base: '#b39a6b', c1: '#8c7550', c2: '#d1bd8f', c3: '#6e5a3b' },
  urban:    { base: '#6f747a', c1: '#4a4e53', c2: '#9aa0a6', c3: '#2f3236' },
  arctic:   { base: '#d9dde0', c1: '#aab2b8', c2: '#f4f6f7', c3: '#7d868d' },
  black:    { base: '#2a2c30', c1: '#1a1c1f', c2: '#3a3d42', c3: '#111214' },
  jungle:   { base: '#3b5a3a', c1: '#24402a', c2: '#6a7a3c', c3: '#4a3a24' },
}
const OP_FACE = { w: 33, jw: 21, yT: 52, yB: 134 }

function CamoPattern({ id, camo }) {
  return (
    <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse">
      <rect width="36" height="36" fill={camo.base} />
      <path d="M2,6 C8,0 16,4 14,10 C12,16 4,14 2,6Z" fill={camo.c1} />
      <path d="M20,18 C26,12 35,16 32,24 C30,30 20,28 20,18Z" fill={camo.c2} />
      <path d="M5,24 C10,20 16,24 14,31 C10,35 3,30 5,24Z" fill={camo.c3} />
      <path d="M24,1 C30,-1 35,4 30,8 C26,10 21,6 24,1Z" fill={camo.c3} />
    </pattern>
  )
}

function Operator({ a, uid, mood }) {
  const skin = colorOf(SKIN_TONES, a.skin)
  const camo = CAMO[a.opCamo] ?? CAMO.woodland
  const acc  = colorOf(ACCENTS, a.opAccent)
  const cm   = `url(#cm${uid})`
  const vest = shade(camo.base, -0.32)
  const gear = '#1f2226'
  const face = OP_FACE
  const yMid = (face.yT + face.yB) / 2 + 2
  const m    = (mood && MOODS[mood]) || null
  const helmetish = ['helmet', 'nvg'].includes(a.opHead)
  const eyesHidden = a.opEyes === 'nvgdown'
  const fabric = a.opCamo === 'arctic' ? '#e8ebed' : a.opCamo === 'desert' ? '#8c7550' : '#16181b'

  const features = (
    <g key={mood ?? 'base'} className={mood ? 'av-pop' : undefined}>
      <Brows type={m?.brows ?? 'thick'} color={shade(skin, -0.62)} />
      {!eyesHidden && (
        <g className="av-blink-a">
          <Eye type={m?.eyes ?? 'sharp'} cx={86} iris="#3d3328" lid={shade(skin, -0.6)} skin={skin} look={m?.look ?? [0, 0]} small={m?.small} />
          <Eye type={m?.eyes ?? 'sharp'} cx={114} iris="#3d3328" lid={shade(skin, -0.6)} skin={skin} look={m?.look ?? [0, 0]} small={m?.small} />
        </g>
      )}
    </g>
  )

  return (
    <g>
      {/* Capucha atrás */}
      {a.opHead === 'hood' && (
        <path d="M54,154 C48,98 66,40 100,36 C134,40 152,98 146,154 C136,150 128,134 126,112 C124,80 114,66 100,66 C86,66 76,80 74,112 C72,134 64,150 54,154Z"
          fill={shade(camo.base, -0.18)} stroke={shade(camo.base, -0.5)} strokeWidth="1.4" />
      )}

      {/* Uniforme + chaleco portaplacas */}
      <path d={BODY} fill={cm} stroke={shade(camo.base, -0.5)} strokeWidth="1.2" />
      <path d="M84,150 L100,163 L116,150" fill="none" stroke={shade(camo.base, -0.45)} strokeWidth="2" />
      <path d="M56,200 L60,170 C66,160 78,156 86,155 L114,155 C122,156 134,160 140,170 L144,200Z" fill={vest} stroke={shade(vest, -0.45)} strokeWidth="1.4" />
      <path d="M70,156 L66,176 M130,156 L134,176" stroke={shade(vest, -0.4)} strokeWidth="5" strokeLinecap="round" />
      {[172, 180].map(y => <path key={y} d={`M64,${y} L136,${y}`} stroke={shade(vest, -0.35)} strokeWidth="1.2" strokeDasharray="6 3" />)}
      {[70, 92, 114].map(x => (
        <g key={x}>
          <rect x={x} y="184" width="16" height="18" rx="2" fill={shade(vest, 0.1)} stroke={shade(vest, -0.4)} strokeWidth="1" />
          <path d={`M${x},190 L${x + 16},190`} stroke={shade(vest, -0.4)} strokeWidth="1" />
          <rect x={x + 6} y="186" width="4" height="3" rx="1" fill={shade(vest, -0.5)} />
        </g>
      ))}

      {/* Equipo en el cuerpo */}
      {a.opGear === 'sling' && (
        <g>
          <path d="M58,158 L146,204" stroke="#16181b" strokeWidth="7" strokeLinecap="round" />
          <rect x="94" y="174" width="10" height="8" rx="1.5" fill="#6a6e74" transform="rotate(28 99 178)" />
        </g>
      )}
      {a.opGear === 'dogtags' && (
        <g>
          <path d="M86,152 L99,170 L114,152" fill="none" stroke="#b9bec4" strokeWidth="1.2" strokeDasharray="1.6 1" />
          <rect x="93" y="167" width="8" height="12" rx="2.5" fill="#c9ced4" stroke="#8a9096" strokeWidth=".7" transform="rotate(-10 97 173)" />
          <rect x="99" y="169" width="8" height="12" rx="2.5" fill="#dfe3e7" stroke="#8a9096" strokeWidth=".7" transform="rotate(8 103 175)" />
        </g>
      )}
      {a.opGear === 'radio' && (
        <g>
          <path d="M48,160 L40,112" stroke="#111" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="40" y="158" width="15" height="26" rx="2.5" fill="#2a2d31" stroke="#000" strokeWidth="1" />
          <rect x="43" y="166" width="9" height="10" rx="1" fill="#3a3e44" />
          <circle cx="51" cy="161.5" r="1.8" fill={acc} className="av-blink-led" />
        </g>
      )}
      {a.opGear === 'patch' && (
        <g transform="translate(150 172) rotate(14)">
          <rect x="-11" y="-8" width="22" height="16" rx="2.5" fill={shade(camo.base, -0.45)} stroke={acc} strokeWidth="1.2" />
          <path d="M-6,3 L0,-3 L6,3 M-6,-1 L0,-7 L6,-1" fill="none" stroke={acc} strokeWidth="1.8" />
        </g>
      )}

      {/* Cuello + orejas + cara */}
      <path d="M87,116 L87,152 C93,159 107,159 113,152 L113,116Z" fill={shade(skin, -0.08)} />
      <path d="M87,122 C94,133 106,133 113,122 L113,131 C106,139 94,139 87,131Z" fill={shade(skin, -0.28)} opacity=".55" />
      {[100 - face.w + 1, 100 + face.w - 1].map((x, i) => (
        <ellipse key={i} cx={x} cy={yMid + 1} rx="6.5" ry="10" fill={skin} stroke={shade(skin, -0.3)} strokeWidth="1.2" />
      ))}
      <path d={facePath(face)} fill={`url(#sk${uid})`} stroke={shade(skin, -0.3)} strokeWidth="1.4" />
      <path d={facePath(face)} fill={`url(#sd${uid})`} />
      <FacialHair type="stubble" color="#2a211a" face={face} />

      {a.opFace === 'paint' && (
        <g opacity=".85">
          <path d="M68,100 L132,84 L133,92 L69,108Z" fill={camo.c3} />
          <path d="M70,116 L130,100 L130,106 L72,122Z" fill={camo.c1} />
          <path d="M84,70 L120,62 L121,67 L85,75Z" fill={camo.c3} opacity=".8" />
        </g>
      )}

      {a.opFace === 'balaclava' ? (
        <g>
          <path d={facePath({ w: 35, jw: 23, yT: 46, yB: 138 })} fill={fabric} stroke="#000" strokeWidth="1.2" />
          <path d="M86,130 L84,156 C92,162 108,162 116,156 L114,130Z" fill={fabric} />
          <path d="M68,86 Q100,79 132,86 L131,104 Q100,109 69,104Z" fill={`url(#sk${uid})`} stroke="#000" strokeWidth="1.2" />
          {features}
          <path d="M72,120 Q100,128 128,120" fill="none" stroke={shade(fabric, 0.12)} strokeWidth="1" opacity=".6" />
        </g>
      ) : (
        <g>
          {features}
          {!['gasmask', 'jaw', 'shemagh'].includes(a.opFace) && (
            <g>
              <Nose type="straight" skin={skin} />
              <Mouth type={m?.mouth ?? 'neutral'} skin={skin} />
            </g>
          )}
        </g>
      )}

      {a.opFace === 'jaw' && (
        <g>
          <path d="M67,104 C80,99 120,99 133,104 L131,122 C124,136 112,143 100,143 C88,143 76,136 69,122Z" fill="#26292d" stroke="#000" strokeWidth="1.4" />
          <path d="M76,116 L124,116" stroke="#e8e4da" strokeWidth="1.2" opacity=".85" />
          {[80, 86, 92, 98, 104, 110, 116].map(x => (
            <path key={x} d={`M${x + 2},110 L${x + 2},122`} stroke="#e8e4da" strokeWidth="1.1" opacity=".85" />
          ))}
          <path d="M80,110 C92,107 108,107 120,110 M82,122 C92,126 108,126 118,122" fill="none" stroke="#e8e4da" strokeWidth="1.1" opacity=".85" />
          <path d="M70,108 L64,98 M130,108 L136,98" stroke="#111" strokeWidth="3" />
        </g>
      )}
      {a.opFace === 'shemagh' && (
        <g>
          <path d="M64,102 C80,96 120,96 136,102 L138,120 C130,142 114,150 100,150 C86,150 70,142 62,120Z" fill="#cdbf9e" stroke="#7a6a4a" strokeWidth="1.2" />
          <g stroke="#6a5a3a" strokeWidth="1" opacity=".55">
            {[106, 114, 122, 130, 138].map(y => <path key={y} d={`M64,${y} L136,${y}`} />)}
            {[72, 82, 92, 102, 112, 122, 132].map(x => <path key={x} d={`M${x},100 L${x},148`} />)}
          </g>
          <path d="M70,104 C86,112 114,112 130,104" fill="none" stroke="#7a6a4a" strokeWidth="1.4" opacity=".7" />
        </g>
      )}
      {a.opFace === 'gasmask' && (
        <g>
          <path d="M64,84 C64,68 136,68 136,84 L136,118 C132,138 114,148 100,148 C86,148 68,138 64,118Z" fill="#2a2c2e" stroke="#000" strokeWidth="1.4" />
          <path d="M64,90 L54,86 M136,90 L146,86" stroke="#16181b" strokeWidth="5" />
          {[86, 114].map(cx => (
            <g key={cx}>
              <circle cx={cx} cy="95" r="12" fill="#3a3d42" stroke="#111" strokeWidth="1.5" />
              <circle cx={cx} cy="95" r="9" fill={shade(acc, -0.55)} opacity=".9" />
              <circle cx={cx} cy="95" r="9" fill={acc} opacity=".22" className="av-glow" />
            </g>
          ))}
          <GlowEyes mood={mood} xs={[86, 114]} y={95} r={3.2} color={shade(acc, 0.4)} filterId={`gl${uid}`} />
          {[86, 114].map(cx => <path key={cx} d={`M${cx - 6},${90} Q${cx - 2},${87} ${cx + 2},${88}`} stroke="#fff" strokeWidth="1.3" opacity=".35" fill="none" />)}
          <circle cx="100" cy="128" r="12" fill="#3a3d42" stroke="#111" strokeWidth="1.5" />
          {[0, 1, 2, 3].map(i => <path key={i} d={`M${92 + i * 5.3},121 L${92 + i * 5.3},135`} stroke="#1a1c1f" strokeWidth="1.6" />)}
          <path d="M80,116 L70,122 M120,116 L130,122" stroke="#16181b" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* Gafas / visores */}
      {a.opEyes === 'glasses' && (
        <g>
          <path d="M66,88 C80,84 120,84 134,88 L133,96 C128,104 110,104 102,97 L98,97 C90,104 72,104 67,96Z" fill={`url(#tint${uid})`} stroke="#0e0f11" strokeWidth="1.6" />
          <path d="M72,90 L84,98 M108,90 L120,98" stroke="#fff" strokeWidth="1.4" opacity=".28" />
          <path d="M66,90 L58,92 M134,90 L142,92" stroke="#0e0f11" strokeWidth="2" />
        </g>
      )}
      {a.opEyes === 'goggles' && (
        <g>
          <path d="M58,94 L142,94" stroke="#16181b" strokeWidth="8" />
          <path d="M68,84 C80,79 120,79 132,84 C136,95 131,107 118,107 C110,107 106,101 100,101 C94,101 90,107 82,107 C69,107 64,95 68,84Z"
            fill={acc} fillOpacity=".38" stroke="#1a1a1a" strokeWidth="3.4" strokeLinejoin="round" />
          <path d="M74,88 C80,85 88,85 92,87 M108,87 C114,85 120,85 126,88" stroke="#fff" strokeWidth="1.6" opacity=".45" fill="none" />
        </g>
      )}
      {a.opEyes === 'nvgdown' && (
        <g>
          <rect x="95" y="58" width="10" height="20" rx="2" fill="#1d1f22" />
          <rect x="76" y="74" width="48" height="14" rx="5" fill="#26292d" stroke="#000" strokeWidth="1" />
          {[88, 112].map(cx => (
            <g key={cx}>
              <circle cx={cx} cy="96" r="11" fill="#16181b" stroke="#000" strokeWidth="1.4" />
              <circle cx={cx} cy="96" r="7.5" fill={shade(acc, -0.5)} />
              <circle cx={cx} cy="96" r="7.5" fill={acc} opacity=".85" filter={`url(#gl${uid})`} className="av-glow-pulse" />
              <circle cx={cx - 2.5} cy="93.5" r="2" fill="#fff" opacity=".7" />
            </g>
          ))}
        </g>
      )}
      {a.opEyes === 'visor' && (
        <g>
          <clipPath id={`vz${uid}`}><path d="M62,84 L138,84 L136,103 L64,103Z" /></clipPath>
          <path d="M62,84 L138,84 L136,103 L64,103Z" fill={acc} fillOpacity=".3" stroke={acc} strokeWidth="1.6" />
          <g clipPath={`url(#vz${uid})`}>
            <rect x="60" y="82" width="80" height="2.4" fill={acc} opacity=".7" className="av-scan" />
            <path d="M120,88 L130,88 M124,92 L130,92 M70,98 L78,98" stroke={acc} strokeWidth="1.2" opacity=".9" />
          </g>
        </g>
      )}

      {/* Diadema del headset (debajo del casco) */}
      {a.opGear === 'headset' && !helmetish && a.opHead !== 'hood' && (
        <path d="M60,92 C56,46 144,46 140,92" fill="none" stroke={gear} strokeWidth="5" strokeLinecap="round" />
      )}

      {/* Cabeza */}
      {helmetish && (
        <g>
          <path d="M60,86 C56,52 78,33 100,33 C122,33 144,52 140,86 L132,88 C131,77 127,72 120,70 L80,70 C73,72 69,77 68,88Z"
            fill={`url(#hm${uid})`} stroke={shade(camo.base, -0.6)} strokeWidth="1.5" />
          <path d="M76,44 C88,37 104,36 118,42" fill="none" stroke="#fff" strokeWidth="2" opacity=".18" strokeLinecap="round" />
          <rect x="88" y="47" width="24" height="10" rx="2" fill={shade(camo.base, -0.35)} />
          <rect x="93" y="35" width="14" height="9" rx="2" fill="#1d1f22" />
          {[0, 1].map(i => (
            <g key={i} transform={i ? MIRROR : undefined}>
              <rect x="59" y="62" width="9" height="18" rx="2" fill="#26292d" />
              <path d="M60,66 L67,66 M60,70 L67,70 M60,74 L67,74" stroke="#4a4e54" strokeWidth="1" />
            </g>
          ))}
          <rect x="110" y="30" width="7" height="5" rx="1" fill="#16181b" />
          <circle cx="113.5" cy="32.5" r="1.6" fill={acc} className="av-blink-led" />
        </g>
      )}
      {a.opHead === 'nvg' && (
        <g>
          <rect x="95" y="27" width="10" height="10" rx="2" fill="#1d1f22" />
          <rect x="80" y="17" width="40" height="13" rx="4" fill="#26292d" stroke="#000" strokeWidth="1" />
          {[88, 112].map(cx => (
            <g key={cx}>
              <rect x={cx - 7} y="5" width="14" height="15" rx="3" fill="#1a1c1f" stroke="#000" strokeWidth="1" />
              <ellipse cx={cx} cy="6" rx="6" ry="2.6" fill={acc} opacity=".9" className="av-glow-pulse" />
            </g>
          ))}
        </g>
      )}
      {a.opHead === 'boonie' && (
        <g transform="rotate(-3 100 70)">
          <path d="M64,74 C62,50 80,40 100,40 C120,40 138,50 136,74Z" fill={cm} stroke={shade(camo.base, -0.5)} strokeWidth="1.3" />
          <path d="M63,65 C88,70 112,70 137,65 L137,74 C112,78 88,78 63,74Z" fill={shade(camo.base, -0.35)} />
          {[74, 90, 110, 126].map(x => <rect key={x} x={x} y="64" width="3" height="10" fill={shade(camo.base, -0.55)} />)}
          <path d="M36,78 C48,66 152,66 164,78 C158,92 42,92 36,78Z" fill={cm} stroke={shade(camo.base, -0.5)} strokeWidth="1.3" />
          <path d="M44,80 C70,74 130,74 156,80" fill="none" stroke={shade(camo.base, -0.45)} strokeWidth="1" strokeDasharray="3 2" />
        </g>
      )}
      {a.opHead === 'beanie' && (
        <g>
          <path d="M64,80 C60,48 80,33 100,33 C120,33 140,48 136,80Z" fill={fabric} stroke="#000" strokeWidth="1.3" />
          <path d="M61,70 C86,77 114,77 139,70 L139,82 C114,89 86,89 61,82Z" fill={shade(fabric, 0.1)} stroke="#000" strokeWidth="1.2" />
          {[68, 78, 88, 98, 108, 118, 128].map(x => <path key={x} d={`M${x + 2},73 L${x + 2},86`} stroke={shade(fabric, 0.22)} strokeWidth="1.3" opacity=".6" />)}
        </g>
      )}
      {a.opHead === 'cap' && (
        <g>
          <path d="M62,76 C56,50 80,36 104,37 C130,38 146,54 138,76 C120,68 82,68 62,76Z" fill={cm} stroke={shade(camo.base, -0.5)} strokeWidth="1.3" />
          <rect x="88" y="52" width="24" height="12" rx="2" fill={shade(camo.base, -0.4)} />
          <path d="M92,58 L100,54 L108,58" fill="none" stroke={acc} strokeWidth="1.6" />
          <path d="M62,74 C84,84 116,84 138,74 C132,90 68,90 62,74Z" fill={shade(camo.base, -0.3)} stroke={shade(camo.base, -0.55)} strokeWidth="1.2" />
        </g>
      )}
      {a.opHead === 'hood' && (
        <g>
          <path d="M66,94 C70,66 84,56 100,56 C116,56 130,66 134,94 C122,80 78,80 66,94Z" fill="#000" opacity=".35" />
          <path d="M60,130 C56,84 74,52 100,50 C126,52 144,84 140,130" fill="none" stroke={shade(camo.base, -0.4)} strokeWidth="6" />
          <path d="M60,130 C56,84 74,52 100,50 C126,52 144,84 140,130" fill="none" stroke={shade(camo.base, 0.15)} strokeWidth="1.4" opacity=".6" />
        </g>
      )}

      {/* Headset (copas sobre las orejas) */}
      {a.opGear === 'headset' && (
        <g>
          {[0, 1].map(i => (
            <g key={i} transform={i ? MIRROR : undefined}>
              <rect x="53" y="84" width="17" height="30" rx="7" fill={gear} stroke="#000" strokeWidth="1" />
              <rect x="56" y="90" width="5" height="18" rx="2" fill="#33373d" />
            </g>
          ))}
          <path d="M60,110 C62,124 76,130 88,126" fill="none" stroke={gear} strokeWidth="2.8" strokeLinecap="round" />
          <rect x="86" y="122" width="8" height="6" rx="3" fill="#111" />
          <circle cx="146" cy="100" r="1.6" fill={acc} className="av-blink-led" />
        </g>
      )}
    </g>
  )
}

// ═════════════════════════ ARMADURA ═════════════════════════
const AR_SHAPES = {
  ranger: {
    shell: 'M60,98 C58,58 78,38 100,38 C122,38 142,58 140,98 L138,120 C132,138 116,148 100,148 C84,148 68,138 62,120Z',
    visor: 'M68,84 C78,75 122,75 132,84 L130,104 C122,114 78,114 70,104Z', eyes: { xs: [87, 113], y: 93, r: 4.4, kind: 'slit' },
  },
  tvisor: {
    shell: 'M64,96 L66,62 C72,46 84,38 100,38 C116,38 128,46 134,62 L136,96 L134,126 L116,146 L84,146 L66,126Z',
    visor: 'M70,79 L130,79 L130,93 L107,93 L105,128 L95,128 L93,93 L70,93Z', eyes: { xs: [84, 116], y: 86, r: 3.6, kind: 'slit' },
  },
  dome: {
    shell: 'M50,96 C50,64 72,42 100,42 C128,42 150,64 150,96 C150,124 130,146 100,146 C70,146 50,124 50,96Z',
    visor: 'M68,98 C68,78 82,66 100,66 C118,66 132,78 132,98 C132,118 118,130 100,130 C82,130 68,118 68,98Z', eyes: { xs: [89, 111], y: 96, r: 4.6, kind: 'round' },
  },
  knight: {
    shell: 'M62,142 L62,74 C62,50 80,38 100,38 C120,38 138,50 138,74 L138,142 C124,148 76,148 62,142Z',
    visor: 'M70,88 L130,88 L128,98 L72,98Z', eyes: { xs: [86, 114], y: 93, r: 3.2, kind: 'slit' },
  },
  hunter: {
    shell: 'M60,92 C58,60 78,40 100,40 C122,40 142,60 140,92 L136,128 L100,150 L64,128Z',
    visor: 'M66,82 L134,82 L100,124Z', eyes: { xs: [86, 114], y: 90, r: 3.8, kind: 'slit' },
  },
}

function Armor({ a, uid, mood }) {
  const col = colorOf(AR_COLOR, a.arColor)
  const vis = colorOf(AR_VISOR, a.arVisor)
  const S = AR_SHAPES[a.arHelmet] ?? AR_SHAPES.ranger
  const edge = shade(col, -0.55)
  const ink = isLight(col) ? '#24262a' : '#ecebe6'
  const plate = `url(#ar${uid})`
  const crestY = a.arHelmet === 'dome' ? 4 : 0

  return (
    <g>
      {/* Traje y armadura */}
      <path d={BODY} fill="#1f2226" stroke="#0c0d0f" strokeWidth="1.2" />
      <path d="M86,128 L86,156 L114,156 L114,128Z" fill="#1a1c20" />
      {[134, 140, 146, 152].map(y => <path key={y} d={`M86,${y} L114,${y}`} stroke="#2e3238" strokeWidth="1.4" />)}
      <path d="M58,200 L62,170 C72,158 86,154 100,154 C114,154 128,158 138,170 L142,200Z" fill={plate} stroke={edge} strokeWidth="1.4" />
      <path d="M80,176 L100,170 L120,176 M84,188 L100,183 L116,188" fill="none" stroke={edge} strokeWidth="1.4" opacity=".7" />
      <path d="M78,152 C88,162 112,162 122,152 L120,160 C110,168 90,168 80,160Z" fill={shade(col, -0.3)} stroke={edge} strokeWidth="1" />
      {[0, 1].map(i => (
        <g key={i} transform={i ? MIRROR : undefined}>
          <path d="M16,200 C14,176 30,158 56,155 C70,157 76,168 73,184 C58,180 36,187 27,200Z" fill={plate} stroke={edge} strokeWidth="1.4" />
          <path d="M24,190 C30,176 42,166 58,163" fill="none" stroke="#fff" strokeWidth="1.6" opacity=".2" strokeLinecap="round" />
          <path d="M30,198 C40,188 54,184 70,186" fill="none" stroke={edge} strokeWidth="1.2" opacity=".6" />
        </g>
      ))}
      <circle cx="100" cy="176" r="4.5" fill={vis} opacity=".9" className="av-pulse" />

      {a.arMark === 'chevron' && <path d="M86,186 L100,177 L114,186 L114,192 L100,183 L86,192Z" fill={vis} opacity=".9" />}
      {a.arMark === 'number' && (
        <text x="40" y="188" fontSize="15" fontWeight="800" fontFamily="ui-monospace, monospace" fill={ink} opacity=".85" transform="rotate(-18 40 188)">07</text>
      )}

      {/* Casco */}
      <path d={S.shell} fill={plate} stroke={edge} strokeWidth="1.8" />
      <path d={S.shell} fill={`url(#sd${uid})`} />
      {a.arHelmet === 'knight' && <path d="M100,40 L100,146" stroke={shade(col, 0.25)} strokeWidth="2.4" />}
      {a.arHelmet === 'knight' && (
        <g fill="#0c0d0f">
          {[112, 120, 128].map(y => [80, 86, 92, 108, 114, 120].map(x => <circle key={`${x}${y}`} cx={x} cy={y} r="1.6" />))}
        </g>
      )}
      {a.arHelmet === 'ranger' && (
        <g stroke={edge} strokeWidth="1.6" strokeLinecap="round">
          <path d="M74,122 L84,128 M74,128 L84,134 M126,122 L116,128 M126,128 L116,134" />
          <circle cx="60" cy="102" r="7" fill={shade(col, -0.15)} /><circle cx="140" cy="102" r="7" fill={shade(col, -0.15)} />
        </g>
      )}
      {a.arHelmet === 'hunter' && (
        <g fill={plate} stroke={edge} strokeWidth="1.4">
          <path d="M60,78 L42,62 L58,100Z" /><path d="M140,78 L158,62 L142,100Z" />
        </g>
      )}
      {a.arHelmet === 'dome' && (
        <g fill={shade(col, -0.2)} stroke={edge}>
          {[0, 60, 120, 180, 240, 300].map(d => {
            const r = (d * Math.PI) / 180
            return <circle key={d} cx={100 + 40 * Math.cos(r)} cy={97 + 40 * Math.sin(r)} r="2.4" strokeWidth=".8" />
          })}
        </g>
      )}
      <path d="M78,48 C88,42 104,41 116,45" fill="none" stroke="#fff" strokeWidth="2.6" opacity=".22" strokeLinecap="round" />

      {a.arMark === 'stripe' && <path d="M96,40 L104,40 L104,74 L96,74Z" fill={ink} opacity=".75" />}
      {(a.arMark === 'scratches' || a.arMark === 'battle') && (
        <g stroke={shade(col, 0.45)} strokeWidth="1.1" strokeLinecap="round" opacity=".75">
          <path d="M72,60 L84,70 M76,58 L86,66 M118,118 L128,110 M40,182 L52,174 M144,176 L156,186" />
        </g>
      )}
      {a.arMark === 'battle' && (
        <g fill="#0c0d0f" opacity=".45">
          <ellipse cx="124" cy="60" rx="7" ry="4" transform="rotate(30 124 60)" />
          <ellipse cx="36" cy="190" rx="9" ry="5" />
          <ellipse cx="80" cy="132" rx="5" ry="3" />
        </g>
      )}

      {/* Visor con ojos luminosos detrás */}
      <clipPath id={`vc${uid}`}><path d={S.visor} /></clipPath>
      <path d={S.visor} fill={`url(#vs${uid})`} stroke={edge} strokeWidth="1.6" />
      <g clipPath={`url(#vc${uid})`}>
        <g opacity=".75">
          <GlowEyes mood={mood} xs={S.eyes.xs} y={S.eyes.y} r={S.eyes.r} kind={S.eyes.kind} color={shade(vis, 0.65)} filterId={`gl${uid}`} />
        </g>
        <path d="M60,70 L90,70 L70,120 L50,120Z" fill="#fff" opacity=".22" />
        <rect x="40" y="60" width="16" height="90" fill="#fff" opacity=".35" transform="skewX(-20)" className="av-sheen" />
      </g>

      {/* Cresta */}
      <g transform={`translate(0 ${crestY})`}>
        {a.arCrest === 'antenna' && (
          <g>
            <path d="M130,66 L148,24" stroke={edge} strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="148" cy="24" r="3.4" fill={vis} className="av-blink-led" />
          </g>
        )}
        {a.arCrest === 'fin' && (
          <g>
            <path d="M88,46 C90,30 98,18 108,12 C110,24 112,36 112,48 C104,44 96,44 88,46Z" fill={plate} stroke={edge} strokeWidth="1.4" />
            <path d="M100,44 C101,32 104,22 108,16" fill="none" stroke={vis} strokeWidth="2" opacity=".85" />
          </g>
        )}
        {a.arCrest === 'horns' && (
          <g>
            {[0, 1].map(i => (
              <path key={i} transform={i ? MIRROR : undefined} d="M72,58 C60,50 54,36 58,18 C64,34 72,42 84,48Z" fill={plate} stroke={edge} strokeWidth="1.4" />
            ))}
          </g>
        )}
        {a.arCrest === 'plume' && (
          <g className="av-flicker">
            <path d="M94,40 C84,26 92,12 104,2 C102,16 114,22 108,40Z" fill={vis} opacity=".55" filter={`url(#gl${uid})`} />
            <path d="M96,40 C90,28 96,16 104,8 C103,18 110,24 106,40Z" fill={shade(vis, 0.5)} opacity=".95" />
          </g>
        )}
        {a.arCrest === 'lamp' && (
          <g>
            <path d="M52,90 L4,76 L4,116 L52,98Z" fill={`url(#beam${uid})`} className="av-flicker" />
            <rect x="50" y="84" width="12" height="16" rx="2.5" fill="#1a1c20" stroke="#000" />
            <circle cx="52" cy="92" r="4" fill={shade(vis, 0.6)} />
          </g>
        )}
      </g>
    </g>
  )
}

// ═════════════════════════ BLOQUES ═════════════════════════
const P = 10, HX = 60, HY = 40          // píxel de 10 · cabeza 8×8 en (60,40)
const SP = 5                             // sub-píxel para ojos y boca

const EYE_SPRITES = {
  base:  ['....', 'WWII', 'WWII', '....'],
  happy: ['....', '.DD.', 'D..D', '....'],
  sad:   ['..DD', '....', 'WWII', 'T...'],
  shock: ['WWWW', 'WIIW', 'WIIW', 'WWWW'],
  dizzy: ['D..D', '.DD.', '.DD.', 'D..D'],
  angry: ['DD..', '..DD', 'WWII', '....'],
  smug:  ['....', 'DDDD', 'WWII', '....'],
  think: ['..WI', '..WI', '....', '....'],
}
EYE_SPRITES.win = EYE_SPRITES.happy
EYE_SPRITES.focus = EYE_SPRITES.angry
const MOUTH_SPRITES = {
  base:  ['..DDDD..', '........'],
  happy: ['D......D', '.DDDDDD.'],
  sad:   ['.DDDDDD.', 'D......D'],
  shock: ['...DD...', '...DD...'],
  dizzy: ['.D.D.D..', 'D.D.D.D.'],
  smug:  ['.....DD.', '..DDDD..'],
  think: ['....DDD.', '........'],
}
MOUTH_SPRITES.win = MOUTH_SPRITES.love = MOUTH_SPRITES.happy
MOUTH_SPRITES.angry = MOUTH_SPRITES.focus = MOUTH_SPRITES.sad

function Sprite({ rows, x, y, colors, mirror = false, size = SP }) {
  const out = []
  rows.forEach((row, r) => {
    const chars = mirror ? [...row].reverse() : [...row]
    chars.forEach((ch, c) => {
      if (ch !== '.' && colors[ch]) out.push(<rect key={`${r}-${c}`} x={x + c * size} y={y + r * size} width={size} height={size} fill={colors[ch]} />)
    })
  })
  return <g>{out}</g>
}

const jitter = (i, j) => (((i * 37 + j * 11 + i * j * 7) % 7) - 3) * 0.028

function PixelGrid({ map, palette, x0 = HX, y0 = HY, size = P }) {
  const out = []
  map.forEach((row, j) => [...row].forEach((ch, i) => {
    const c = palette[ch]
    if (!c) return
    out.push(<rect key={`${i}-${j}`} x={x0 + i * size} y={y0 + j * size} width={size} height={size} fill={shade(c, jitter(i, j))} />)
  }))
  return <g>{out}</g>
}

const HEAD_MAPS = {
  crafter: ['HHHHHHHH', 'HHHHHHHH', 'HSSSSSSH', 'SSSSSSSS', 'SSSSSSSS', 'SSSNNSSS', 'SSSSSSSS', 'SSSSSSSS'],
  void:    ['VVVVVVVV', 'VVVVVVVV', 'VVVVVVVV', 'VVVVVVVV', 'VVVVVVVV', 'VVVVVVVV', 'VVVVVVVV', 'VVVVVVVV'],
  golem:   ['MMGMGGMG', 'GGGGMGGG', 'GGGGGGGG', 'BBBBBBBB', 'GGGLLGGG', 'GGGLLGGG', 'GGGLLGGG', 'GGGGGGGG'],
  knight:  ['IIIIIIII', 'IJJJJJJI', 'IIIIIIII', 'IIIIIIII', 'XXXXXXXX', 'IIIIIIII', 'IJIJIJII', 'IIIIIIII'],
}

function Block({ a, uid, mood }) {
  const type  = a.bkType ?? 'crafter'
  const skin  = colorOf(SKIN_TONES, a.skin)
  const main  = colorOf(BK_COLOR, a.bkColor)
  const shirt = colorOf(BK_SHIRT, a.bkShirt)
  const eye   = colorOf(BK_EYES, a.bkEyes)
  const key   = mood && EYE_SPRITES[mood] ? mood : 'base'
  const eyeRows = type === 'void' && key === 'base' ? ['....', 'IWWI', '....', '....']
    : type === 'knight' && key === 'base' ? ['....', '.II.', '....', '....']
    : EYE_SPRITES[key]

  const eyeColors = {
    crafter: { W: '#f4f4f4', I: eye, D: shade(skin, -0.6), T: '#6ec6ff' },
    void:    { W: shade(eye, 0.55), I: eye, D: eye, T: eye },
    slime:   { W: '#14301a', I: '#0a160c', D: '#0a160c', T: '#e8fff0' },
    golem:   { W: shade(eye, 0.5), I: eye, D: '#2a2c2e', T: eye },
    knight:  { W: shade(eye, 0.5), I: eye, D: eye, T: eye },
  }[type]

  const eyesNode = mood === 'love'
    ? (
      <g fill="#e8456a">
        {[80, 120].map(cx => <path key={cx} transform={`translate(${cx} 86) scale(1.6)`} d="M0,4 C-6,-1 -8,-5 -5,-8 C-3,-10 -1,-9 0,-7 C1,-9 3,-10 5,-8 C8,-5 6,-1 0,4Z" />)}
      </g>
    ) : (
      <g>
        <Sprite rows={eyeRows} x={70} y={75} colors={eyeColors} />
        <Sprite rows={eyeRows} x={110} y={75} colors={eyeColors} mirror />
      </g>
    )
  const glowEyes = ['void', 'golem', 'knight'].includes(type)
  const mouthKey = mood && MOUTH_SPRITES[mood] ? mood : 'base'

  let head
  if (type === 'slime') {
    head = (
      <g className="av-squish">
        <rect x="58" y="40" width="84" height="82" fill={main} opacity=".78" />
        <rect x="80" y="62" width="40" height="40" fill={shade(main, -0.28)} opacity=".85" />
        <rect x="58" y="40" width="84" height="8" fill={shade(main, 0.35)} opacity=".7" />
        <rect x="58" y="40" width="8" height="82" fill={shade(main, 0.25)} opacity=".5" />
        <rect x="66" y="50" width="10" height="6" fill="#fff" opacity=".6" />
        {eyesNode}
        <Sprite rows={MOUTH_SPRITES[mouthKey]} x={80} y={104} colors={{ D: '#0a160c' }} />
      </g>
    )
  } else if (type === 'crafter') {
    head = (
      <g>
        <PixelGrid map={HEAD_MAPS.crafter} palette={{ H: main, S: skin, N: shade(skin, -0.14) }} />
        {eyesNode}
        <Sprite rows={MOUTH_SPRITES[mouthKey]} x={80} y={100} colors={{ D: shade(skin, -0.5) }} />
      </g>
    )
  } else {
    const palettes = {
      void:   { V: '#17121d' },
      golem:  { G: '#8a8d90', M: main, B: '#5d6064', L: '#a3a6a9' },
      knight: { I: '#b8bec6', J: '#8f969f', X: '#16181c' },
    }
    head = (
      <g>
        <PixelGrid map={HEAD_MAPS[type]} palette={palettes[type]} />
        <g filter={glowEyes ? `url(#gl${uid})` : undefined} opacity=".7">{eyesNode}</g>
        {eyesNode}
        {type === 'golem' && <Sprite rows={MOUTH_SPRITES[mouthKey]} x={80} y={112} colors={{ D: '#3a3c3f' }} />}
      </g>
    )
  }

  // Cuerpo
  let body
  if (type === 'void') {
    body = <rect x="72" y="124" width="56" height="80" fill="#17121d" />
  } else if (type === 'slime') {
    body = <ellipse cx="100" cy="132" rx="50" ry="9" fill={main} opacity=".45" />
  } else if (type === 'golem') {
    body = (
      <g>
        <rect x="46" y="124" width="108" height="80" fill="#7d8083" />
        <rect x="46" y="124" width="108" height="8" fill="#94979a" />
        {[[58, 140], [128, 150], [90, 170], [64, 186], [140, 182]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="10" height="10" fill={main} opacity=".85" />)}
      </g>
    )
  } else if (type === 'knight') {
    body = (
      <g>
        <rect x="50" y="124" width="100" height="80" fill="#9aa1aa" />
        <rect x="50" y="124" width="100" height="6" fill="#c3c9d0" />
        <rect x="80" y="130" width="40" height="74" fill={shirt} />
        <rect x="96" y="140" width="8" height="30" fill={shade(shirt, 0.4)} /><rect x="88" y="148" width="24" height="8" fill={shade(shirt, 0.4)} />
      </g>
    )
  } else {
    body = (
      <g>
        <rect x="84" y="118" width="32" height="8" fill={shade(skin, -0.12)} />
        <rect x="52" y="124" width="96" height="80" fill={shirt} />
        <rect x="52" y="124" width="12" height="80" fill={shade(shirt, 0.12)} />
        <rect x="136" y="124" width="12" height="80" fill={shade(shirt, -0.15)} />
        <rect x="92" y="124" width="16" height="10" fill={skin} /><rect x="96" y="134" width="8" height="5" fill={skin} />
      </g>
    )
  }

  // Accesorio de arriba
  const gold = '#e2b744'
  const top = {
    crown: (
      <g>
        <PixelGrid map={['G..GG..G'.replace(/G/g, 'G'), 'GGGRBGGG']} palette={{ G: gold, R: '#c0283a', B: '#2a6ab0' }} y0={22} />
      </g>
    ),
    cap: (
      <g>
        <PixelGrid map={['CCCCCCCC', 'CCCLCCCC']} palette={{ C: shirt, L: '#f4f4f4' }} y0={30} />
        <rect x="50" y="50" width="90" height="6" fill={shade(shirt, -0.3)} />
      </g>
    ),
    headphones: (
      <g>
        <rect x="70" y="30" width="60" height="10" fill="#2a2a2a" />
        <rect x="60" y="34" width="10" height="10" fill="#2a2a2a" /><rect x="130" y="34" width="10" height="10" fill="#2a2a2a" />
        <rect x="50" y="62" width="12" height="34" fill="#2a2a2a" /><rect x="138" y="62" width="12" height="34" fill="#2a2a2a" />
        <rect x="52" y="72" width="6" height="14" fill={eye} className="av-glow" /><rect x="142" y="72" width="6" height="14" fill={eye} className="av-glow" />
      </g>
    ),
    halo: (
      <g className="av-bob">
        <rect x="74" y="14" width="52" height="5" fill={gold} /><rect x="74" y="24" width="52" height="5" fill={gold} />
        <rect x="69" y="19" width="5" height="5" fill={gold} /><rect x="126" y="19" width="5" height="5" fill={gold} />
      </g>
    ),
    horns: (
      <g fill="#8e1f24">
        <rect x="60" y="30" width="10" height="10" /><rect x="54" y="20" width="10" height="10" /><rect x="52" y="12" width="6" height="8" fill="#c0303a" />
        <rect x="130" y="30" width="10" height="10" /><rect x="136" y="20" width="10" height="10" /><rect x="142" y="12" width="6" height="8" fill="#c0303a" />
      </g>
    ),
  }[a.bkTop]

  return (
    <g shapeRendering="crispEdges">
      {body}
      {head}
      {top}
      {type === 'void' && (
        <g fill={eye}>
          {[[50, 150, 0], [150, 130, 0.8], [40, 100, 1.6], [158, 84, 2.2], [66, 176, 1.1], [138, 170, 2.8]].map(([x, y, d], i) => (
            <rect key={i} x={x} y={y} width="5" height="5" className="av-float" style={{ animationDelay: `${d}s` }} />
          ))}
        </g>
      )}
    </g>
  )
}

// ═════════════════════════ ROBOT ═════════════════════════
const RB_SHAPES = {
  box:     { el: (p) => <rect x="60" y="46" width="80" height="86" rx="12" {...p} />, top: 46 },
  dome:    { el: (p) => <path d="M60,104 C60,62 78,44 100,44 C122,44 140,62 140,104 L138,124 C136,132 64,132 62,124Z" {...p} />, top: 44 },
  tv:      { el: (p) => <rect x="52" y="52" width="96" height="78" rx="10" {...p} />, top: 52 },
  capsule: { el: (p) => <rect x="66" y="40" width="68" height="96" rx="34" {...p} />, top: 40 },
  mech:    { el: (p) => <path d="M64,62 L80,44 L120,44 L136,62 L140,104 L128,132 L72,132 L60,104Z" {...p} />, top: 44 },
}

function ScreenMouth({ mood, y = 106, color }) {
  const d = {
    happy: `M88,${y - 3} Q100,${y + 9} 112,${y - 3}`, win: `M88,${y - 3} Q100,${y + 9} 112,${y - 3}`, love: `M90,${y - 2} Q100,${y + 7} 110,${y - 2}`,
    sad: `M88,${y + 4} Q100,${y - 6} 112,${y + 4}`, angry: `M88,${y + 3} L112,${y - 1}`, focus: `M90,${y} L110,${y}`,
    dizzy: `M86,${y} q3,-4 6,0 t6,0 t6,0 t6,0`, smug: `M92,${y + 1} Q104,${y + 3} 112,${y - 4}`, think: `M96,${y + 1} L110,${y - 1}`,
  }[mood] ?? `M90,${y} L110,${y}`
  if (mood === 'shock') return <rect x="95" y={y - 5} width="10" height="9" rx="2" fill={color} />
  return <path d={d} fill="none" stroke={color} strokeWidth="3.2" strokeLinecap="square" />
}

function VisorBar({ mood, color }) {
  const sw = { stroke: color, strokeWidth: 7, strokeLinecap: 'round', fill: 'none' }
  switch (mood) {
    case 'happy': case 'win': return <path d="M78,100 Q100,82 122,100" {...sw} />
    case 'sad':   return <path d="M78,90 Q100,106 122,90" {...sw} />
    case 'angry': case 'focus': return <path d="M78,88 L100,98 L122,88" {...sw} />
    case 'dizzy': return <path d="M76,95 l8,-6 l8,12 l8,-12 l8,12 l8,-12 l8,6" {...sw} strokeWidth={4} />
    case 'shock': return <rect x="76" y="85" width="48" height="20" rx="6" fill={color} />
    case 'smug':  return <rect x="76" y="96" width="48" height="5" rx="2.5" fill={color} />
    case 'think': return <rect x="100" y="90" width="24" height="10" rx="5" fill={color} />
    case 'love':  return <path transform="translate(100 96) scale(1.5)" d="M0,4 C-6,-1 -8,-5 -5,-8 C-3,-10 -1,-9 0,-7 C1,-9 3,-10 5,-8 C8,-5 6,-1 0,4Z" fill={color} />
    default:
      return (
        <g>
          <rect x="76" y="90" width="48" height="10" rx="5" fill={color} />
          <circle cx="80" cy="95" r="4" fill="#fff" opacity=".85" className="av-scan-x" />
        </g>
      )
  }
}

function Robot({ a, uid, mood }) {
  const metal = colorOf(RB_METAL, a.rbMetal)
  const L     = colorOf(ACCENTS, a.rbLight)
  const S     = RB_SHAPES[a.rbHead] ?? RB_SHAPES.box
  const edge  = shade(metal, -0.55)
  const grad  = `url(#mt${uid})`
  const isTv  = a.rbHead === 'tv'
  const eyesType = a.rbEyes ?? 'duo'
  const xs = isTv ? [82, 106] : [86, 114]
  const plate = isTv
    ? <rect x="62" y="60" width="64" height="62" rx="10" fill="#0b1418" stroke="#000" strokeWidth="1.5" />
    : eyesType === 'screen'
      ? <rect x="68" y="74" width="64" height="44" rx="10" fill="#0b1013" stroke={edge} strokeWidth="1.6" />
      : <rect x={a.rbHead === 'capsule' ? 72 : 70} y="80" width={a.rbHead === 'capsule' ? 56 : 60} height="30" rx="14" fill="#0c0f13" stroke={edge} strokeWidth="1.6" />
  const ey = isTv ? 84 : eyesType === 'screen' ? 90 : 95
  const dy = S.top - 46

  let eyes
  if (eyesType === 'visor' && !isTv) eyes = <VisorBar mood={mood} color={L} />
  else if (eyesType === 'cyclops') {
    const cx = isTv ? 94 : 100
    eyes = (
      <g>
        <circle cx={cx} cy={ey} r="13" fill="#111" stroke={edge} strokeWidth="2" />
        <g className={!mood ? 'av-scan-x' : undefined}>
          <GlowEyes mood={mood} xs={[cx]} y={ey} r={6.5} color={L} filterId={`gl${uid}`} />
        </g>
      </g>
    )
  } else if (eyesType === 'lenses') {
    eyes = (
      <g>
        <circle cx={xs[0]} cy={ey} r="11" fill="#14171b" stroke={shade(metal, 0.2)} strokeWidth="2.4" />
        <circle cx={xs[1] + 1} cy={ey + 1} r="7.5" fill="#14171b" stroke={shade(metal, 0.2)} strokeWidth="2" />
        <GlowEyes mood={mood} xs={[xs[0], xs[1] + 1]} y={ey} r={4.2} color={L} filterId={`gl${uid}`} />
        <circle cx={xs[1] + 12} cy={ey - 11} r="2" fill="#ff3b3b" className="av-blink-led" />
      </g>
    )
  } else {
    eyes = <GlowEyes mood={mood} xs={xs} y={ey} r={eyesType === 'screen' || isTv ? 5 : 6} kind={eyesType === 'screen' || isTv ? 'square' : 'round'} color={L} filterId={`gl${uid}`} />
  }

  return (
    <g>
      {/* Cuerpo */}
      <path d={BODY} fill={grad} stroke={edge} strokeWidth="1.4" />
      <rect x="78" y="166" width="44" height="36" rx="6" fill={shade(metal, -0.22)} stroke={edge} strokeWidth="1" />
      <circle cx="100" cy="182" r="9" fill="#0c0f13" />
      <circle cx="100" cy="182" r="6" fill={L} className="av-pulse" filter={`url(#gl${uid})`} />
      <circle cx="100" cy="182" r="4" fill={shade(L, 0.5)} />
      {[46, 154].map(x => <circle key={x} cx={x} cy="176" r="3" fill={shade(metal, -0.3)} stroke={edge} strokeWidth=".8" />)}
      <rect x="88" y="126" width="7" height="30" fill={shade(metal, -0.35)} /><rect x="105" y="126" width="7" height="30" fill={shade(metal, -0.35)} />
      <ellipse cx="100" cy="154" rx="26" ry="6" fill={shade(metal, -0.15)} stroke={edge} strokeWidth="1.2" />

      {/* Cabeza */}
      {S.el({ fill: grad, stroke: edge, strokeWidth: 2 })}
      {S.el({ fill: `url(#sd${uid})` })}
      {a.rbHead === 'box' && (
        <g>
          <path d="M62,60 L138,60" stroke={edge} strokeWidth="1" opacity=".6" />
          <rect x="52" y="82" width="9" height="24" rx="3" fill={shade(metal, -0.25)} stroke={edge} />
          <rect x="139" y="82" width="9" height="24" rx="3" fill={shade(metal, -0.25)} stroke={edge} />
        </g>
      )}
      {a.rbHead === 'dome' && <path d="M70,70 C78,54 92,48 106,48" fill="none" stroke="#fff" strokeWidth="3" opacity=".3" strokeLinecap="round" />}
      {a.rbHead === 'mech' && (
        <g>
          <path d="M76,116 L124,116 L118,132 L82,132Z" fill={shade(metal, -0.3)} stroke={edge} strokeWidth="1.2" />
          <path d="M90,44 L100,56 L110,44" fill={shade(metal, 0.2)} stroke={edge} />
          <path d="M64,104 L72,110 M64,96 L72,102 M136,104 L128,110 M136,96 L128,102" stroke={edge} strokeWidth="1.6" />
        </g>
      )}
      {isTv && (
        <g>
          <circle cx="137" cy="74" r="4.5" fill={shade(metal, -0.3)} stroke={edge} />
          <circle cx="137" cy="90" r="4.5" fill={shade(metal, -0.3)} stroke={edge} />
          {[102, 108, 114].map(y => <path key={y} d={`M131,${y} L143,${y}`} stroke={edge} strokeWidth="1.6" />)}
        </g>
      )}
      {plate}
      {isTv && (
        <g opacity=".22">
          {Array.from({ length: 15 }, (_, i) => <path key={i} d={`M62,${62 + i * 4} L126,${62 + i * 4}`} stroke="#9fe" strokeWidth=".6" />)}
        </g>
      )}
      {eyes}
      {(eyesType === 'screen' || isTv) && <ScreenMouth mood={mood} y={isTv ? 104 : 106} color={L} />}
      {!isTv && eyesType !== 'screen' && (
        <g stroke={shade(metal, -0.5)} strokeWidth="2" strokeLinecap="round">
          {[116, 121, 126].map(y => <path key={y} d={`M90,${y} L110,${y}`} />)}
        </g>
      )}

      {/* Arriba */}
      <g transform={`translate(0 ${dy})`}>
        {a.rbTop === 'antenna' && (
          <g>
            <path d="M100,46 L100,22" stroke={edge} strokeWidth="3" />
            <circle cx="100" cy="18" r="5" fill={L} className="av-blink-led" filter={`url(#gl${uid})`} />
            <circle cx="100" cy="18" r="3.4" fill={shade(L, 0.4)} />
          </g>
        )}
        {a.rbTop === 'twin' && (
          <g>
            <path d="M86,48 L74,22 M114,48 L126,22" stroke={edge} strokeWidth="2.6" />
            <circle cx="74" cy="20" r="4" fill={L} className="av-blink-led" />
            <circle cx="126" cy="20" r="4" fill={L} className="av-blink-led" style={{ animationDelay: '.7s' }} />
          </g>
        )}
        {a.rbTop === 'dish' && (
          <g>
            <path d="M126,50 L134,38" stroke={edge} strokeWidth="3" />
            <path d="M122,30 C128,20 146,22 150,34 C142,40 128,40 122,30Z" fill={grad} stroke={edge} strokeWidth="1.4" />
            <circle cx="136" cy="30" r="2" fill={L} className="av-blink-led" />
          </g>
        )}
        {a.rbTop === 'siren' && (
          <g>
            <rect x="88" y="38" width="24" height="9" rx="2" fill="#1a1c20" />
            <path d="M90,38 C90,24 110,24 110,38Z" fill={L} opacity=".9" className="av-siren" filter={`url(#gl${uid})`} />
            <path d="M93,36 C93,28 99,26 101,26" fill="none" stroke="#fff" strokeWidth="1.6" opacity=".6" />
          </g>
        )}
        {a.rbTop === 'propeller' && (
          <g>
            <path d="M100,46 L100,30" stroke={edge} strokeWidth="3" />
            <g className="av-spin" style={{ transformOrigin: '100px 28px' }}>
              <ellipse cx="86" cy="28" rx="14" ry="3.4" fill={L} stroke={edge} strokeWidth=".8" />
              <ellipse cx="114" cy="28" rx="14" ry="3.4" fill={shade(L, -0.3)} stroke={edge} strokeWidth=".8" />
            </g>
            <circle cx="100" cy="28" r="3.4" fill={edge} />
          </g>
        )}
      </g>
    </g>
  )
}

// ═════════════════════════ MÍSTICO ═════════════════════════
const RUNES = [
  'M-4,-6 L4,6 M4,-6 L-4,6', 'M0,-7 L0,7 M0,-7 L5,-3 M0,-1 L5,3', 'M-5,5 L0,-6 L5,5Z',
  'M0,-7 L5,0 L0,7 L-5,0Z', 'M-5,-5 L5,-5 L-5,5 L5,5', 'M0,-7 L0,7 M-5,-2 L5,-2',
]

function Mystic({ a, uid, mood }) {
  const cloak = colorOf(MY_COLOR, a.myColor)
  const g     = colorOf(ACCENTS, a.myGlow)
  const edge  = shade(cloak, -0.55)
  const robe  = `url(#rb${uid})`
  const hood  = a.myHood ?? 'hood'
  const mask  = a.myMask ?? 'none'
  const hooded = ['hood', 'cowl', 'horns'].includes(hood)
  const voidFace = 'M72,118 C70,86 84,70 100,70 C116,70 130,86 128,118 C126,138 114,148 100,148 C86,148 74,138 72,118Z'
  const eyeY = mask === 'beak' ? 96 : mask === 'none' ? 104 : 102
  const eyeXs = mask === 'beak' ? [89, 111] : [89, 111]

  const aura = {
    flames: (
      <g filter={`url(#gl${uid})`}>
        {[[40, 150, 1.2, 0], [160, 148, 1.1, 0.3], [56, 96, 0.9, 0.6], [146, 92, 0.95, 0.15], [100, 30, 0.8, 0.45]].map(([x, y, sc, d], i) => (
          <path key={i} transform={`translate(${x} ${y}) scale(${sc})`} className="av-flicker" style={{ animationDelay: `${d}s` }}
            d="M0,18 C-12,12 -10,-2 -2,-10 C-2,-2 4,0 4,-8 C12,0 12,12 0,18Z" fill={g} opacity=".55" />
        ))}
      </g>
    ),
    runes: (
      <g className="av-orbit-slow" style={{ transformOrigin: '100px 96px' }}>
        {RUNES.map((d, i) => {
          const r = (i * 60 * Math.PI) / 180
          return <path key={i} transform={`translate(${100 + 70 * Math.cos(r)} ${96 + 70 * Math.sin(r)})`} d={d} fill="none" stroke={g} strokeWidth="1.8" strokeLinejoin="round" opacity=".85" />
        })}
      </g>
    ),
    smoke: (
      <g fill="none" stroke="#d6d0e0" strokeLinecap="round" opacity=".28">
        {[[46, 170, 0], [154, 160, 1.2], [70, 70, 2.1], [134, 60, 0.6]].map(([x, y, d], i) => (
          <path key={i} className="av-drift" style={{ animationDelay: `${d}s` }} d={`M${x},${y} c-8,-8 8,-14 0,-22 c-8,-8 8,-14 0,-22`} strokeWidth="5" />
        ))}
      </g>
    ),
    sparks: (
      <g fill={g}>
        {[[50, 170, 0], [150, 176, 0.5], [70, 120, 1.1], [132, 116, 1.6], [42, 90, 2.1], [160, 80, 0.8]].map(([x, y, d], i) => (
          <circle key={i} cx={x} cy={y} r="2.2" className="av-float" style={{ animationDelay: `${d}s` }} />
        ))}
      </g>
    ),
    orbs: (
      <g transform="translate(100 92) scale(1 .45)">
        <g className="av-orbit" style={{ animationDuration: '6s' }}>
          {[0, 120, 240].map(d => (
            <circle key={d} transform={`rotate(${d}) translate(70 0)`} r="6" fill={g} filter={`url(#gl${uid})`} />
          ))}
        </g>
      </g>
    ),
  }[a.myAura]

  let maskNode = null
  if (mask === 'porcelain') {
    maskNode = (
      <g>
        <path d="M78,104 C78,82 88,74 100,74 C112,74 122,82 122,104 C122,128 112,140 100,140 C88,140 78,128 78,104Z" fill={`url(#pc${uid})`} stroke="#9a9184" strokeWidth="1" />
        <ellipse cx="89" cy="102" rx="6.5" ry="4.2" fill="#000" /><ellipse cx="111" cy="102" rx="6.5" ry="4.2" fill="#000" />
        <path d="M88,108 L86,118 M112,108 L114,118" stroke={g} strokeWidth="1.4" opacity=".8" />
        <path d="M95,126 Q100,129 105,126" stroke="#a52a3c" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
    )
  } else if (mask === 'fox') {
    maskNode = (
      <g>
        <path d="M78,94 L74,68 L92,82Z M122,94 L126,68 L108,82Z" fill="#efe9df" stroke="#9a9184" strokeWidth="1" />
        <path d="M78,90 L77,74 L88,84Z M122,90 L123,74 L112,84Z" fill="#c0303a" />
        <path d="M76,106 C76,88 86,80 100,80 C114,80 124,88 124,106 L100,142Z" fill="#efe9df" stroke="#9a9184" strokeWidth="1" />
        <path d="M82,98 L96,104 L82,106Z M118,98 L104,104 L118,106Z" fill="#000" />
        <path d="M82,110 C88,112 92,116 94,122 M118,110 C112,112 108,116 106,122 M96,88 C98,92 102,92 104,88" stroke="#c0303a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <circle cx="100" cy="136" r="2.6" fill="#1a1a1a" />
      </g>
    )
  } else if (mask === 'skull') {
    maskNode = (
      <g>
        <path d="M78,100 C78,80 88,72 100,72 C112,72 122,80 122,100 C122,112 118,118 114,122 L114,134 L86,134 L86,122 C82,118 78,112 78,100Z" fill="#e6dfcf" stroke="#8a8270" strokeWidth="1.2" />
        <ellipse cx="89" cy="101" rx="7.5" ry="7" fill="#0c0b0a" /><ellipse cx="111" cy="101" rx="7.5" ry="7" fill="#0c0b0a" />
        <path d="M100,110 L96,118 L104,118Z" fill="#0c0b0a" />
        {[90, 95, 100, 105, 110].map(x => <path key={x} d={`M${x},124 L${x},133`} stroke="#8a8270" strokeWidth="1.2" />)}
        <path d="M84,124 L116,124" stroke="#8a8270" strokeWidth="1" />
      </g>
    )
  } else if (mask === 'beak') {
    maskNode = (
      <g>
        <path d="M78,98 C78,80 88,74 100,74 C112,74 122,80 122,98 L120,112 L80,112Z" fill="#2e2620" stroke="#120e0b" strokeWidth="1.2" />
        <path d="M86,108 C92,102 108,102 114,108 L104,148 C102,153 98,153 96,148Z" fill="#3a3028" stroke="#120e0b" strokeWidth="1.2" />
        <path d="M96,112 L99,146" stroke="#5a4a3a" strokeWidth="1" />
        {[89, 111].map(cx => <circle key={cx} cx={cx} cy="96" r="8" fill="#0c0b0a" stroke="#b08d3e" strokeWidth="2" />)}
      </g>
    )
  }

  const eyesNode = (
    <GlowEyes mood={mood} xs={eyeXs} y={eyeY}
      r={mask === 'none' ? 4.6 : mask === 'porcelain' ? 2.8 : 3.4}
      kind={mask === 'none' || mask === 'fox' ? 'slit' : 'round'} color={g} filterId={`gl${uid}`} />
  )

  return (
    <g>
      {aura}

      {/* Túnica */}
      <path d={BODY} fill={robe} stroke={edge} strokeWidth="1.4" />
      <path d="M90,150 L100,204 L110,150Z" fill={shade(cloak, -0.5)} />
      <path d="M50,190 C56,176 66,168 78,162 M150,190 C144,176 134,168 122,162" fill="none" stroke={shade(cloak, 0.2)} strokeWidth="1.4" opacity=".45" />
      <circle cx="100" cy="158" r="5" fill="#b08d3e" stroke="#5a4416" />
      <circle cx="100" cy="158" r="2.6" fill={g} className="av-glow" />

      {hood === 'crown' && (
        <path d="M50,200 L58,122 C70,136 84,142 100,142 C116,142 130,136 142,122 L150,200Z" fill={robe} stroke={edge} strokeWidth="1.4" />
      )}

      {/* Capucha */}
      {hooded && (
        <path d={hood === 'cowl'
          ? 'M46,172 C40,112 58,60 100,20 C142,60 160,112 154,172 C140,162 132,142 130,118 C128,86 116,70 100,70 C84,70 72,86 70,118 C68,142 60,162 46,172Z'
          : 'M46,172 C40,106 60,44 100,36 C140,44 160,106 154,172 C140,162 132,142 130,118 C128,86 116,70 100,70 C84,70 72,86 70,118 C68,142 60,162 46,172Z'}
          fill={robe} stroke={edge} strokeWidth="1.6" />
      )}
      {hood === 'horns' && (
        <g>
          {[0, 1].map(i => (
            <path key={i} transform={i ? MIRROR : undefined} d="M66,62 C52,52 46,34 54,12 C58,30 68,42 80,50Z" fill="#d8cfbc" stroke="#7a705c" strokeWidth="1.3" />
          ))}
        </g>
      )}

      {/* Cara en sombra */}
      <path d={voidFace} fill={`url(#vd${uid})`} />
      {maskNode}
      <g className="av-glow-pulse">{eyesNode}</g>

      {hooded && <path d="M70,118 C72,86 84,70 100,70 C116,70 128,86 130,118" fill="none" stroke={shade(cloak, 0.25)} strokeWidth="1.6" opacity=".5" />}

      {hood === 'wizard' && (
        <g>
          <path d="M66,76 C74,54 92,30 126,6 C116,30 122,54 134,76Z" fill={robe} stroke={edge} strokeWidth="1.4" />
          <path d="M70,66 C90,72 112,72 132,66 L134,76 C112,82 90,82 68,76Z" fill={g} opacity=".75" />
          {[[96, 46], [112, 32], [104, 58]].map(([x, y], i) => (
            <path key={i} transform={`translate(${x} ${y}) scale(.4)`} d="M0,-9 L2,-2 L9,0 L2,2 L0,9 L-2,2 L-9,0 L-2,-2Z" fill={g} className="av-twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
          <path d="M26,80 C46,66 154,66 174,80 C154,92 46,92 26,80Z" fill={robe} stroke={edge} strokeWidth="1.4" />
        </g>
      )}
      {hood === 'crown' && (
        <g className="av-bob">
          <path d="M70,60 L72,34 L86,48 L100,26 L114,48 L128,34 L130,60Z" fill={g} fillOpacity=".22" stroke={g} strokeWidth="2.4" strokeLinejoin="round" filter={`url(#gl${uid})`} />
          <path d="M70,60 L72,34 L86,48 L100,26 L114,48 L128,34 L130,60Z" fill="none" stroke={shade(g, 0.6)} strokeWidth="1.2" strokeLinejoin="round" />
        </g>
      )}
    </g>
  )
}

// ═════════════════════════ COMPONENTE ═════════════════════════
const BG_PATTERNS = {
  operator: (c) => (
    <g fill="none" stroke={c} strokeWidth="1.2">
      {[40, 64, 88, 112].map(r => <ellipse key={r} cx="150" cy="40" rx={r} ry={r * 0.7} />)}
      {[30, 56].map(r => <ellipse key={r} cx="30" cy="170" rx={r} ry={r * 0.8} />)}
    </g>
  ),
  armor: (c) => (
    <g fill="none" stroke={c} strokeWidth="1.2">
      {Array.from({ length: 6 }, (_, j) => Array.from({ length: 6 }, (_, i) => {
        const x = i * 36 + (j % 2) * 18, y = j * 32
        return <path key={`${i}-${j}`} d={`M${x},${y - 18} l15,9 l0,18 l-15,9 l-15,-9 l0,-18Z`} />
      }))}
    </g>
  ),
  block: (c) => (
    <g fill={c}>
      {Array.from({ length: 10 }, (_, j) => Array.from({ length: 10 }, (_, i) => ((i + j) % 2 ? null : <rect key={`${i}-${j}`} x={i * 20} y={j * 20} width="20" height="20" />)))}
    </g>
  ),
  robot: (c) => (
    <g fill="none" stroke={c} strokeWidth="1.4">
      <path d="M0,40 L40,40 L56,56 L56,90 M200,60 L160,60 L146,74 L146,120 M0,150 L30,150 L44,136 M200,170 L170,170" />
      {[[56, 92], [146, 122], [44, 134]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" />)}
    </g>
  ),
  mystic: (c) => (
    <g fill={c}>
      {[[20, 30], [170, 24], [40, 90], [182, 110], [150, 60], [16, 150], [60, 20], [130, 14], [186, 170]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 3 ? 1.2 : 2} />)}
    </g>
  ),
}

const ANCHORS = {
  operator: { eyeY: 95, eyes: [86, 114], top: 36, temple: 128 },
  armor:    { eyeY: 92, eyes: [86, 114], top: 38, temple: 132 },
  block:    { eyeY: 85, eyes: [80, 120], top: 34, temple: 132 },
  robot:    { eyeY: 95, eyes: [86, 114], top: 42, temple: 134 },
  mystic:   { eyeY: 102, eyes: [89, 111], top: 34, temple: 126 },
}

function GamerAvatar({ avatar: a, size = 64, framing = 'tight', className = '', title, mood = null, animated = false }) {
  const viewBox = FRAMING[framing] ?? FRAMING.tight
  const [, , vw, vh] = viewBox.split(' ').map(Number)
  const uid = useId().replace(/:/g, '')
  const bg = colorOf(BACKGROUNDS, a.bg)
  const style = a.style

  const skin  = colorOf(SKIN_TONES, a.skin)
  const camo  = CAMO[a.opCamo] ?? CAMO.woodland
  const arCol = colorOf(AR_COLOR, a.arColor)
  const arVis = colorOf(AR_VISOR, a.arVisor)
  const metal = colorOf(RB_METAL, a.rbMetal)
  const cloak = colorOf(MY_COLOR, a.myColor)
  const accent = colorOf(ACCENTS, a.opAccent)

  const Body = { operator: Operator, armor: Armor, block: Block, robot: Robot, mystic: Mystic }[style] ?? Operator

  return (
    <svg viewBox={viewBox} width={size} height={size * (vh / vw)} className={`${animated ? 'av-anim ' : ''}${className}`}
      preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}
      role="img" aria-label={title ?? 'Avatar'} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`bg${uid}`} cx="50%" cy="42%" r="70%">
          <stop offset="0" stopColor={shade(bg, 0.18)} />
          <stop offset=".65" stopColor={bg} />
          <stop offset="1" stopColor={shade(bg, -0.5)} />
        </radialGradient>
        <filter id={`gl${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <linearGradient id={`sd${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".25" />
          <stop offset=".35" stopColor="#000" stopOpacity="0" />
          <stop offset=".8" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".14" />
        </linearGradient>
        <radialGradient id={`sk${uid}`} cx="40%" cy="36%" r="75%">
          <stop offset="0" stopColor={shade(skin, 0.12)} />
          <stop offset=".6" stopColor={skin} />
          <stop offset="1" stopColor={shade(skin, -0.16)} />
        </radialGradient>
        {style === 'operator' && (
          <>
            <CamoPattern id={`cm${uid}`} camo={camo} />
            <linearGradient id={`hm${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={shade(camo.base, 0.12)} />
              <stop offset="1" stopColor={shade(camo.base, -0.3)} />
            </linearGradient>
            <linearGradient id={`tint${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3a4652" />
              <stop offset="1" stopColor={shade(accent, -0.7)} />
            </linearGradient>
          </>
        )}
        {style === 'armor' && (
          <>
            <linearGradient id={`ar${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={shade(arCol, 0.3)} />
              <stop offset=".5" stopColor={arCol} />
              <stop offset="1" stopColor={shade(arCol, -0.4)} />
            </linearGradient>
            <linearGradient id={`vs${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={shade(arVis, 0.45)} />
              <stop offset=".45" stopColor={arVis} />
              <stop offset="1" stopColor={shade(arVis, -0.6)} />
            </linearGradient>
            <linearGradient id={`beam${uid}`} x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor={shade(arVis, 0.6)} stopOpacity=".55" />
              <stop offset="1" stopColor={arVis} stopOpacity="0" />
            </linearGradient>
          </>
        )}
        {style === 'robot' && (
          <linearGradient id={`mt${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={shade(metal, 0.4)} />
            <stop offset=".45" stopColor={metal} />
            <stop offset="1" stopColor={shade(metal, -0.4)} />
          </linearGradient>
        )}
        {style === 'mystic' && (
          <>
            <linearGradient id={`rb${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={shade(cloak, 0.22)} />
              <stop offset=".55" stopColor={cloak} />
              <stop offset="1" stopColor={shade(cloak, -0.5)} />
            </linearGradient>
            <radialGradient id={`vd${uid}`} cx="50%" cy="45%" r="60%">
              <stop offset="0" stopColor="#000" />
              <stop offset=".75" stopColor="#050406" />
              <stop offset="1" stopColor={shade(cloak, -0.7)} />
            </radialGradient>
            <radialGradient id={`pc${uid}`} cx="40%" cy="35%" r="70%">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#d8d0c2" />
            </radialGradient>
          </>
        )}
      </defs>

      <rect width="200" height="200" fill={`url(#bg${uid})`} />
      <g opacity=".08">{BG_PATTERNS[style]?.('#e8d5a3')}</g>
      <circle cx="100" cy="88" r="64" fill="#fff" opacity=".05" />

      <g className={animated ? 'av-breathe' : undefined}>
        <Body a={a} uid={uid} mood={mood} />
      </g>

      <MoodFX mood={mood} anchor={ANCHORS[style]} />
    </svg>
  )
}

export default memo(GamerAvatar)
