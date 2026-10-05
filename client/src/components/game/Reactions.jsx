import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSocket } from '@/hooks/useSocket'
import { useAudio } from '@/hooks/useAudio'
import AvatarRenderer from '@/components/avatar/AvatarRenderer'

// ─────────────────────────────────────────────────────────────
// Reacciones de la mesa
// - Emotes: flotan sobre tu asiento
// - Lanzables (estilo parchís): vuelan hacia otro jugador y le dejan algo encima
// Las claves deben coincidir con server/socket/reactionHandlers.js
// ─────────────────────────────────────────────────────────────

export const EMOTES = [
  { kind: 'clap',  glyph: '👏', label: 'Aplausos', mood: 'happy' },
  { kind: 'laugh', glyph: '😂', label: 'Jaja',     mood: 'happy' },
  { kind: 'fire',  glyph: '🔥', label: 'Fuego',    mood: 'smug'  },
  { kind: 'cool',  glyph: '😎', label: 'Tranqui',  mood: 'smug'  },
  { kind: 'money', glyph: '🤑', label: 'Plata',    mood: 'happy' },
  { kind: 'wow',   glyph: '😱', label: '¡Uy!',     mood: 'shock' },
  { kind: 'think', glyph: '🤔', label: 'Mmm',      mood: 'think' },
  { kind: 'eyes',  glyph: '👀', label: 'Ojo',      mood: 'think' },
  { kind: 'cold',  glyph: '🥶', label: 'Frío',     mood: 'shock' },
  { kind: 'cry',   glyph: '😭', label: 'Lloro',    mood: 'sad'   },
  { kind: 'pray',  glyph: '🙏', label: 'Porfa',    mood: 'sad'   },
  { kind: 'skull', glyph: '💀', label: 'Muerto',   mood: 'dizzy' },
]

export const CATEGORIES = [
  { key: 'burla',  label: 'Burla',  glyph: '🐔' },
  { key: 'caos',   label: 'Caos',   glyph: '💥' },
  { key: 'plata',  label: 'Plata',  glyph: '💸' },
  { key: 'carino', label: 'Cariño', glyph: '💋' },
  { key: 'gamer',  label: 'Gamer',  glyph: '🎮' },
]

// sound: sonido al impactar · ms: cuánto dura el efecto · mood: cara que pone quien lo recibe
export const THROWABLES = [
  { kind: 'tomato',    cat: 'burla',  label: 'Tomate',    sound: 'splat',   ms: 2800, mood: 'shock' },
  { kind: 'egg',       cat: 'burla',  label: 'Huevazo',   sound: 'crack',   ms: 2800, mood: 'sad'   },
  { kind: 'chicken',   cat: 'burla',  label: 'Gallina',   sound: 'cluck',   ms: 3000, mood: 'angry' },
  { kind: 'donkey',    cat: 'burla',  label: 'Burro',     sound: 'bray',    ms: 3400, mood: 'angry' },
  { kind: 'horn',      cat: 'burla',  label: 'Corneta',   sound: 'horn',    ms: 2400, mood: 'angry' },
  { kind: 'slipper',   cat: 'burla',  label: 'Chancla',   sound: 'crack',   ms: 2600, mood: 'dizzy' },
  { kind: 'fish',      cat: 'burla',  label: 'Pescado',   sound: 'splat',   ms: 2800, mood: 'shock' },
  { kind: 'clown',     cat: 'burla',  label: 'Payaso',    sound: 'horn',    ms: 3000, mood: 'angry' },
  { kind: 'bang',      cat: 'caos',   label: '¡Bang!',    sound: 'bang',    ms: 3000, mood: 'dizzy' },
  { kind: 'dynamite',  cat: 'caos',   label: 'Dinamita',  sound: 'boom',    ms: 3200, mood: 'dizzy' },
  { kind: 'pie',       cat: 'caos',   label: 'Pastelazo', sound: 'splat',   ms: 3000, mood: 'shock' },
  { kind: 'water',     cat: 'caos',   label: 'Baldado',   sound: 'splash',  ms: 2600, mood: 'shock' },
  { kind: 'lightning', cat: 'caos',   label: 'Rayo',      sound: 'zap',     ms: 2400, mood: 'dizzy' },
  { kind: 'snowball',  cat: 'caos',   label: 'Bola de nieve', sound: 'pop', ms: 2800, mood: 'shock' },
  { kind: 'bills',     cat: 'plata',  label: 'Billetes',  sound: 'cash',    ms: 2600, mood: 'happy' },
  { kind: 'jackpot',   cat: 'plata',  label: 'Jackpot',   sound: 'slot',    ms: 3000, mood: 'win'   },
  { kind: 'chip',      cat: 'plata',  label: 'Propina',   sound: 'cash',    ms: 2400, mood: 'happy' },
  { kind: 'kiss',      cat: 'carino', label: 'Beso',      sound: 'kiss',    ms: 2600, mood: 'love'  },
  { kind: 'rose',      cat: 'carino', label: 'Rosa',      sound: 'pop',     ms: 2600, mood: 'love'  },
  { kind: 'crown',     cat: 'carino', label: 'Corona',    sound: 'sparkle', ms: 3000, mood: 'win'   },
  { kind: 'clover',    cat: 'carino', label: 'Suerte',    sound: 'sparkle', ms: 2600, mood: 'happy' },
  { kind: 'confetti',  cat: 'carino', label: 'Confeti',   sound: 'pop',     ms: 2800, mood: 'happy' },
  { kind: 'flashbang', cat: 'gamer',  label: 'Aturdidora', sound: 'bang',   ms: 3000, mood: 'dizzy' },
  { kind: 'smoke',     cat: 'gamer',  label: 'Humo',      sound: 'whoosh',  ms: 3200, mood: 'think' },
  { kind: 'laser',     cat: 'gamer',  label: 'Láser',     sound: 'zap',     ms: 2600, mood: 'shock' },
  { kind: 'headshot',  cat: 'gamer',  label: 'Headshot',  sound: 'bang',    ms: 2800, mood: 'dizzy' },
  { kind: 'pixel',     cat: 'gamer',  label: 'Bloque',    sound: 'crack',   ms: 2800, mood: 'dizzy' },
  { kind: 'gg',        cat: 'gamer',  label: 'GG',        sound: 'sparkle', ms: 3000, mood: 'win'   },
]

export const COOLDOWN_MS = 2500
export const FLIGHT_MS   = 650
let lastSentAt = 0   // espera compartida entre aperturas del menú

// ── Íconos SVG (menú y proyectil) ─────────────────────────────
export function ThrowIcon({ kind, size = 32 }) {
  const svg = (children) => <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">{children}</svg>
  switch (kind) {
    case 'tomato':
      return svg(<>
        <circle cx="20" cy="22" r="14" fill="#c8312b" />
        <ellipse cx="14" cy="17" rx="4" ry="3" fill="#fff" opacity=".35" />
        <path d="M20,9 L17,4 M20,9 L24,5 M20,9 L13,9 M20,9 L27,10 M20,9 L20,13" stroke="#2d6b34" strokeWidth="2.6" strokeLinecap="round" />
      </>)
    case 'egg':
      return svg(<>
        <ellipse cx="20" cy="22" rx="11" ry="14" fill="#f6efe0" stroke="#d8ccb6" strokeWidth="1" />
        <ellipse cx="16" cy="16" rx="3" ry="4.5" fill="#fff" opacity=".8" />
      </>)
    case 'chicken':
      return svg(<>
        <circle cx="20" cy="22" r="12" fill="#f6efe0" stroke="#d8ccb6" />
        <path d="M14,10 C15,5 18,6 19,9 C20,4 24,5 23,10Z" fill="#d6363a" />
        <path d="M30,22 L37,24 L30,27Z" fill="#f2a83a" />
        <circle cx="25" cy="19" r="2" fill="#1a1714" />
        <path d="M28,28 C30,32 28,34 26,32" fill="#d6363a" />
      </>)
    case 'donkey':
      return svg(<>
        <path d="M12,14 C8,4 10,1 13,2 C16,4 17,10 17,14Z" fill="#8a8077" />
        <path d="M28,14 C32,4 30,1 27,2 C24,4 23,10 23,14Z" fill="#8a8077" />
        <path d="M13,12 C11,6 12,4 13.5,5 C15,7 15.5,10 15.5,12Z M27,12 C29,6 28,4 26.5,5 C25,7 24.5,10 24.5,12Z" fill="#e7a7a7" />
        <ellipse cx="20" cy="22" rx="10" ry="11" fill="#9a9087" />
        <ellipse cx="20" cy="30" rx="8" ry="6" fill="#d8cfc4" />
        <circle cx="16" cy="20" r="1.8" fill="#1a1714" /><circle cx="24" cy="20" r="1.8" fill="#1a1714" />
        <circle cx="17" cy="30" r="1.2" fill="#5a524b" /><circle cx="23" cy="30" r="1.2" fill="#5a524b" />
      </>)
    case 'horn':
      return svg(<>
        <path d="M6,26 L28,10 L32,16 L10,30Z" fill="#c9a84c" stroke="#7a5a1a" strokeWidth="1" />
        <path d="M12,23 L15,27 M17,19 L20,23 M22,15 L25,19" stroke="#7a2838" strokeWidth="2.2" />
        <path d="M28,10 C34,6 38,10 36,14 C35,16 33,16 32,16Z" fill="#7a2838" />
        <circle cx="7" cy="28" r="3" fill="#1a1714" />
      </>)
    case 'bang':
      return svg(<>
        <path d="M20,2 L24,12 L35,8 L29,18 L38,24 L27,26 L29,37 L20,30 L11,37 L13,26 L2,24 L11,18 L5,8 L16,12Z" fill="#f3c73a" stroke="#b5321e" strokeWidth="1.4" />
        <text x="20" y="23" textAnchor="middle" fontSize="8" fontWeight="900" fill="#b5321e" fontFamily="Arial Black, sans-serif">BANG</text>
      </>)
    case 'dynamite':
      return svg(<>
        <rect x="8" y="16" width="24" height="14" rx="3" fill="#c8312b" stroke="#7a1a14" transform="rotate(-20 20 23)" />
        <path d="M14,18 L16,30 M20,16 L22,28 M26,14 L28,26" stroke="#7a1a14" strokeWidth="1" transform="rotate(-20 20 23)" opacity=".6" />
        <path d="M28,13 C31,9 31,6 34,4" stroke="#3a3631" strokeWidth="1.6" fill="none" />
        <circle cx="34.5" cy="3.5" r="3" fill="#f3c73a" /><circle cx="34.5" cy="3.5" r="1.5" fill="#fff" />
      </>)
    case 'pie':
      return svg(<>
        <path d="M4,24 L36,24 L32,32 L8,32Z" fill="#c9893a" stroke="#7a4a1a" />
        <path d="M5,24 C6,14 34,14 35,24 C30,21 26,26 20,22 C14,26 10,21 5,24Z" fill="#fbf4e8" stroke="#d8ccb6" />
        <circle cx="20" cy="14" r="3.2" fill="#c8312b" />
      </>)
    case 'water':
      return svg(<>
        <path d="M20,4 C26,14 32,20 32,26 C32,33 26,37 20,37 C14,37 8,33 8,26 C8,20 14,14 20,4Z" fill="#4aa3d8" stroke="#1f6a96" />
        <ellipse cx="15" cy="25" rx="3" ry="5" fill="#fff" opacity=".45" />
      </>)
    case 'lightning':
      return svg(<path d="M23,2 L8,22 L18,22 L13,38 L32,15 L21,15Z" fill="#f3d23a" stroke="#b58a1a" strokeWidth="1.2" strokeLinejoin="round" />)
    case 'bills':
      return svg(<>
        <rect x="4" y="10" width="30" height="17" rx="2" fill="#4f8a4a" stroke="#2d5a2a" transform="rotate(-12 20 18)" />
        <rect x="7" y="14" width="30" height="17" rx="2" fill="#6aa864" stroke="#2d5a2a" transform="rotate(6 22 22)" />
        <circle cx="22" cy="22" r="5" fill="#2d5a2a" opacity=".5" />
        <text x="22" y="25.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#e8f4d8" fontFamily="Georgia, serif">$</text>
      </>)
    case 'jackpot':
      return svg(<>
        <rect x="6" y="6" width="28" height="30" rx="4" fill="#7a2838" stroke="#c9a84c" strokeWidth="1.5" />
        <rect x="10" y="12" width="20" height="12" rx="2" fill="#f6efe0" />
        <text x="20" y="22" textAnchor="middle" fontSize="9" fontWeight="900" fill="#c8312b" fontFamily="Arial Black, sans-serif">777</text>
        <path d="M34,14 L38,10" stroke="#c9a84c" strokeWidth="2" /><circle cx="38" cy="9" r="2" fill="#c8312b" />
      </>)
    case 'chip':
      return svg(<>
        <circle cx="20" cy="20" r="15" fill="#c9a84c" stroke="#7a5a1a" />
        <circle cx="20" cy="20" r="15" fill="none" stroke="#f6efe0" strokeWidth="4" strokeDasharray="5 5.5" />
        <circle cx="20" cy="20" r="9" fill="#e8d5a3" stroke="#7a5a1a" />
        <text x="20" y="24" textAnchor="middle" fontSize="10" fontWeight="700" fill="#7a2838" fontFamily="Georgia, serif">♠</text>
      </>)
    case 'kiss':
      return svg(<>
        <path d="M6,20 C10,12 16,13 20,16 C24,13 30,12 34,20 C28,19 24,19 20,20 C16,19 12,19 6,20Z" fill="#b3203a" />
        <path d="M6,20 C12,30 28,30 34,20 C28,22 12,22 6,20Z" fill="#d63a52" />
        <path d="M14,24 C18,26 22,26 26,24" stroke="#fff" strokeWidth="1" opacity=".4" fill="none" />
      </>)
    case 'rose':
      return svg(<>
        <path d="M20,22 L22,38" stroke="#2d6b34" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M21,30 C26,26 30,28 30,28 C27,32 23,32 21,30Z" fill="#3f8a48" />
        <circle cx="20" cy="15" r="9" fill="#9e1b30" />
        <path d="M14,14 C16,9 24,9 26,14 C23,12 17,12 14,14Z M15,17 C18,20 22,20 25,17" stroke="#6e1222" strokeWidth="1.4" fill="none" />
        <path d="M18,12 C20,10 23,11 23,14" stroke="#c9364c" strokeWidth="1.4" fill="none" />
      </>)
    case 'crown':
      return svg(<>
        <path d="M5,30 L7,11 L14,20 L20,7 L26,20 L33,11 L35,30Z" fill="#e8c35a" stroke="#7a5a1a" strokeWidth="1.2" strokeLinejoin="round" />
        <rect x="5" y="28" width="30" height="5" rx="1.5" fill="#c9a84c" stroke="#7a5a1a" />
        <circle cx="20" cy="22" r="2.4" fill="#c8312b" /><circle cx="12" cy="24" r="1.6" fill="#3f6b9a" /><circle cx="28" cy="24" r="1.6" fill="#3f6b9a" />
      </>)
    case 'clover':
      return svg(<>
        {[0, 90, 180, 270].map(a => (
          <path key={a} transform={`rotate(${a} 20 18)`} d="M20,18 C14,14 12,6 17,5 C19,4 20,7 20,8 C20,7 21,4 23,5 C28,6 26,14 20,18Z" fill="#3f9a48" stroke="#1f5a2a" strokeWidth=".8" />
        ))}
        <path d="M20,18 C22,26 22,32 26,37" stroke="#1f5a2a" strokeWidth="2" fill="none" strokeLinecap="round" />
      </>)
    case 'slipper':
      return svg(<>
        <path d="M12,4 C20,2 28,8 28,20 C28,32 24,38 18,38 C12,38 9,32 9,20 C9,10 9,5 12,4Z" fill="#2f7ac0" stroke="#1a4a7a" strokeWidth="1.2" />
        <path d="M11,16 C14,12 24,12 27,16 L26,21 C22,18 15,18 11,21Z" fill="#f2c94c" stroke="#a8872a" strokeWidth="1" />
        <ellipse cx="18" cy="30" rx="5" ry="4" fill="#5aa0e0" opacity=".6" />
      </>)
    case 'fish':
      return svg(<>
        <path d="M4,20 C10,10 26,10 32,20 C26,30 10,30 4,20Z" fill="#7fb0c8" stroke="#3a6a80" strokeWidth="1.2" />
        <path d="M30,20 L39,12 L37,20 L39,28Z" fill="#5a90a8" stroke="#3a6a80" />
        <circle cx="11" cy="18" r="2" fill="#1a1714" />
        <path d="M16,14 C18,18 18,22 16,26 M21,13 C23,18 23,22 21,27" stroke="#3a6a80" strokeWidth="1" fill="none" opacity=".7" />
      </>)
    case 'clown':
      return svg(<>
        <circle cx="20" cy="20" r="13" fill="#e0262e" stroke="#8a1018" strokeWidth="1.2" />
        <ellipse cx="15" cy="15" rx="4" ry="3" fill="#fff" opacity=".5" />
      </>)
    case 'snowball':
      return svg(<>
        <circle cx="20" cy="21" r="14" fill="#f4f8fb" stroke="#b8c8d6" strokeWidth="1.2" />
        <path d="M10,18 C14,16 16,22 20,20 M22,28 C26,26 28,30 31,27" stroke="#cdd9e3" strokeWidth="1.4" fill="none" />
        <ellipse cx="15" cy="15" rx="4" ry="3" fill="#fff" />
      </>)
    case 'confetti':
      return svg(<>
        <path d="M6,36 L16,10 L30,24Z" fill="#c9a84c" stroke="#7a5a1a" strokeWidth="1" />
        <path d="M10,26 L22,32 M13,18 L26,26" stroke="#7a2838" strokeWidth="2" />
        {[[26, 6, '#e05a70'], [34, 12, '#4aa3d8'], [30, 2, '#3f9a48'], [37, 4, '#f3c73a']].map(([x, y, c], i) => (
          <rect key={i} x={x} y={y} width="4" height="4" fill={c} transform={`rotate(${i * 30} ${x} ${y})`} />
        ))}
      </>)
    case 'flashbang':
      return svg(<>
        <rect x="13" y="10" width="14" height="26" rx="3" fill="#3a3d42" stroke="#111" />
        <rect x="13" y="16" width="14" height="3" fill="#f3d23a" /><rect x="13" y="28" width="14" height="3" fill="#f3d23a" />
        <path d="M16,10 L16,5 L26,5 L28,8" stroke="#8a9096" strokeWidth="2.2" fill="none" />
        <circle cx="30" cy="9" r="3" fill="none" stroke="#8a9096" strokeWidth="1.6" />
      </>)
    case 'smoke':
      return svg(<>
        <rect x="12" y="12" width="16" height="24" rx="4" fill="#5d6b3f" stroke="#2a3020" />
        <rect x="12" y="20" width="16" height="4" fill="#c8c8c8" />
        <path d="M16,12 L16,7 L25,7" stroke="#8a9096" strokeWidth="2" fill="none" />
        <circle cx="30" cy="6" r="4" fill="#cfd2d6" opacity=".8" /><circle cx="35" cy="3" r="3" fill="#cfd2d6" opacity=".6" />
      </>)
    case 'laser':
      return svg(<>
        <path d="M6,26 L22,26 L24,20 L34,20 L34,28 L26,28 L22,34 L16,34 L18,28 L6,28Z" fill="#5a5f68" stroke="#1f2226" strokeWidth="1.2" />
        <circle cx="34" cy="24" r="2.4" fill="#ff3b3b" />
        <path d="M36,24 L40,24" stroke="#ff3b3b" strokeWidth="2" />
        <rect x="9" y="22" width="10" height="3" rx="1" fill="#4ae3ff" />
      </>)
    case 'headshot':
      return svg(<>
        <circle cx="20" cy="20" r="13" fill="none" stroke="#ff3b3b" strokeWidth="2" />
        <circle cx="20" cy="20" r="2.4" fill="#ff3b3b" />
        <path d="M20,3 L20,12 M20,28 L20,37 M3,20 L12,20 M28,20 L37,20" stroke="#ff3b3b" strokeWidth="2.2" />
      </>)
    case 'pixel':
      return svg(<>
        <rect x="6" y="6" width="28" height="28" fill="#8a6038" />
        <rect x="6" y="6" width="28" height="8" fill="#4caf50" />
        {[[10, 18], [22, 22], [14, 28], [26, 12]].map(([x, y], i) => <rect key={i} x={x} y={y} width="4" height="4" fill={i === 3 ? '#3a8a3e' : '#6e4a2a'} />)}
        <rect x="6" y="6" width="28" height="28" fill="none" stroke="#3a2614" strokeWidth="1.4" />
      </>)
    case 'gg':
      return svg(<>
        <path d="M10,6 L30,6 L28,20 C28,26 24,28 20,28 C16,28 12,26 12,20Z" fill="#e8c35a" stroke="#7a5a1a" strokeWidth="1.2" />
        <path d="M10,9 C4,9 4,18 12,18 M30,9 C36,9 36,18 28,18" stroke="#7a5a1a" strokeWidth="1.6" fill="none" />
        <rect x="16" y="28" width="8" height="5" fill="#c9a84c" /><rect x="11" y="33" width="18" height="4" rx="1" fill="#7a2838" />
        <text x="20" y="20" textAnchor="middle" fontSize="9" fontWeight="900" fill="#7a2838" fontFamily="Arial Black, sans-serif">GG</text>
      </>)
    default:
      return null
  }
}

// ── Efectos de impacto (encima del retrato) ───────────────────
const Tag = ({ children, className = '' }) => (
  <span className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-pill bg-noir-900/90 border text-[10px] font-sans font-medium animate-fade-in ${className}`}>
    {children}
  </span>
)

function Sparkles({ color = '#f3d58a' }) {
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 av-sparkle" style={{ overflow: 'visible' }}>
      {[[10, 20, 1], [84, 14, .8], [88, 70, .7], [8, 76, .6]].map(([x, y, s], i) => (
        <path key={i} fill={color} transform={`translate(${x} ${y}) scale(${s})`} d="M0,-9 L2,-2 L9,0 L2,2 L0,9 L-2,2 L-9,0 L-2,-2Z" />
      ))}
    </svg>
  )
}

function Splat({ fill, inner, seeds, drips = true }) {
  return (
    <svg width="84" height="96" viewBox="0 0 84 96" className="animate-splat-in" style={{ overflow: 'visible' }}>
      <path d="M42,8 C52,6 56,16 64,14 C74,12 78,24 72,32 C80,38 78,50 68,52 C70,62 58,66 50,60 C46,70 32,70 30,60 C20,66 8,58 14,48 C4,44 4,30 14,28 C10,18 22,10 30,16 C32,8 38,8 42,8Z" fill={fill} opacity=".93" />
      {inner}
      {seeds?.map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx="2" ry="3" fill="#f2d16b" opacity=".85" transform={`rotate(${i * 40} ${x} ${y})`} />)}
      {drips && [[24, 58], [44, 64], [62, 56]].map(([x, y], i) => (
        <path key={i} d={`M${x},${y} q2,6 0,12 q-2,4 -4,0 q-2,-6 4,-12Z`} fill={fill} className="animate-drip" style={{ animationDelay: `${0.25 + i * 0.2}s` }} />
      ))}
    </svg>
  )
}

function Impact({ kind }) {
  switch (kind) {
    case 'tomato':
      return <Splat fill="#c8312b" seeds={[[34, 36], [46, 30], [40, 46], [52, 50], [30, 48]]}
        inner={<ellipse cx="36" cy="22" rx="6" ry="3" fill="#fff" opacity=".3" />} />
    case 'egg':
      return (
        <div className="relative">
          <Splat fill="#f6efe0" drips={false} inner={<>
            <circle cx="44" cy="38" r="13" fill="#f2b53a" /><ellipse cx="40" cy="33" rx="4" ry="2.5" fill="#fff" opacity=".5" />
          </>} />
          {[[-30, 8, 20], [26, 4, -30], [-18, 50, 60]].map(([x, y, r], i) => (
            <svg key={i} width="14" height="12" viewBox="0 0 14 12" className="absolute left-1/2 top-0 animate-drop-in"
              style={{ marginLeft: x, marginTop: y, transform: `rotate(${r}deg)`, animationDelay: `${0.1 * i}s` }}>
              <path d="M0,12 L3,2 L6,7 L9,0 L14,12Z" fill="#f6efe0" stroke="#d8ccb6" />
            </svg>
          ))}
        </div>
      )
    case 'chicken':
      return (
        <div className="relative flex flex-col items-center" style={{ marginTop: -88 }}>
          <svg width="58" height="54" viewBox="0 0 58 54" className="animate-drop-in">
            <ellipse cx="30" cy="34" rx="20" ry="16" fill="#f6efe0" stroke="#bfb29a" strokeWidth="1.2" />
            <circle cx="40" cy="20" r="11" fill="#f6efe0" stroke="#bfb29a" strokeWidth="1.2" />
            <path d="M34,10 C35,3 39,4 40,8 C42,2 47,4 45,10Z" fill="#d6363a" />
            <path d="M50,20 L57,22 L50,25Z" fill="#f2a83a" />
            <path d="M48,27 C50,31 48,33 46,31" fill="#d6363a" />
            <circle cx="43" cy="18" r="2" fill="#1a1714" />
            <path d="M14,30 C8,26 6,34 12,36 M18,40 C14,46 22,46 22,42" fill="#e6dac3" />
            <path d="M24,48 L22,54 M34,48 L36,54" stroke="#f2a83a" strokeWidth="2" />
          </svg>
          <Tag className="border-stand-text/60 text-stand-text" >¡COBARDE!</Tag>
          {[[-30, '30px', '220deg', 0], [24, '-20px', '-160deg', .3], [-6, '10px', '200deg', .6]].map(([x, x1, r, d], i) => (
            <span key={i} className="absolute top-8 left-1/2 block w-2 h-4 rounded-full bg-[#f6efe0] animate-feather"
              style={{ marginLeft: x, '--x1': x1, '--r': r, animationDelay: `${d}s` }} />
          ))}
        </div>
      )
    case 'donkey':
      return (
        <div className="relative flex flex-col items-center" style={{ marginTop: -62 }}>
          <svg width="76" height="54" viewBox="0 0 76 54" className="animate-ears" style={{ transformOrigin: '50% 100%' }}>
            <path d="M18,52 C8,30 6,6 14,2 C22,0 28,24 30,50Z" fill="#8a8077" stroke="#5a524b" strokeWidth="1.5" />
            <path d="M58,52 C68,30 70,6 62,2 C54,0 48,24 46,50Z" fill="#8a8077" stroke="#5a524b" strokeWidth="1.5" />
            <path d="M19,44 C13,28 12,12 15,8 C19,8 23,26 25,44Z M57,44 C63,28 64,12 61,8 C57,8 53,26 51,44Z" fill="#e7a7a7" />
          </svg>
          <span className="mt-1 px-2 py-0.5 rounded-pill bg-noir-900/90 border border-warm-600 text-[10px] font-sans text-cream animate-fade-in">¡Burro!</span>
        </div>
      )
    case 'horn':
      return (
        <div className="relative" style={{ marginLeft: 46 }}>
          <div className="animate-wobble origin-left"><ThrowIcon kind="horn" size={46} /></div>
          <Tag className="-top-5 border-gold-600/60 text-gold-400">¡FUUU!</Tag>
          <svg width="40" height="40" viewBox="0 0 40 40" className="absolute -left-8 top-0" style={{ overflow: 'visible' }}>
            {[8, 14, 20].map((r, i) => (
              <path key={r} d={`M0,${20 - r} A${r},${r} 0 0,0 0,${20 + r}`} fill="none" stroke="#e8d5a3" strokeWidth="1.5"
                opacity=".7" className="animate-fade-in" style={{ animationDelay: `${i * .12}s` }} />
            ))}
          </svg>
        </div>
      )
    case 'bang':
      return (
        <div className="relative" style={{ width: 92, height: 92 }}>
          {/* vidrio estrellado sobre el retrato */}
          <svg width="92" height="92" viewBox="0 0 92 92" className="absolute inset-0 animate-burst">
            <circle cx="50" cy="44" r="6" fill="#0e0c0a" stroke="#3a3631" strokeWidth="2" />
            <g stroke="#f6efe0" strokeWidth="1.2" opacity=".85" fill="none">
              {[0, 40, 85, 130, 175, 220, 265, 310].map(a => {
                const r = (a * Math.PI) / 180
                return <path key={a} d={`M${50 + 7 * Math.cos(r)},${44 + 7 * Math.sin(r)} L${50 + 22 * Math.cos(r + .2)},${44 + 22 * Math.sin(r + .2)} L${50 + 40 * Math.cos(r - .05)},${44 + 40 * Math.sin(r - .05)}`} />
              })}
              <circle cx="50" cy="44" r="16" strokeDasharray="3 5" />
            </g>
          </svg>
          {/* globo de cómic */}
          <svg width="74" height="44" viewBox="0 0 74 44" className="absolute -top-10 -left-6 animate-burst" style={{ animationDelay: '.05s' }}>
            <path d="M37,1 L44,10 L58,4 L54,15 L72,16 L58,24 L68,36 L50,32 L44,43 L36,33 L22,42 L22,30 L4,32 L14,22 L1,12 L18,12 L16,2 L28,9Z" fill="#f3c73a" stroke="#b5321e" strokeWidth="1.6" />
            <text x="37" y="27" textAnchor="middle" fontSize="13" fontWeight="900" fill="#b5321e" fontFamily="Arial Black, sans-serif">¡BANG!</text>
          </svg>
          {[0, .35, .7].map((d, i) => (
            <span key={i} className="absolute left-[55%] top-[40%] block w-5 h-5 rounded-full bg-[#cfc7bb] animate-smoke" style={{ animationDelay: `${d}s` }} />
          ))}
        </div>
      )
    case 'dynamite':
      return (
        <div className="relative" style={{ width: 96, height: 96 }}>
          {/* hollín sobre la cara */}
          <div className="absolute inset-[14px] rounded-full animate-fade-in"
            style={{ background: 'radial-gradient(circle at 50% 45%, rgba(20,16,12,.75), rgba(20,16,12,.45) 55%, transparent 72%)', animationDelay: '.25s' }} />
          <svg width="96" height="96" viewBox="0 0 96 96" className="absolute inset-0 animate-explode">
            <path d="M48,2 L56,24 L78,10 L70,34 L94,38 L72,52 L88,74 L62,66 L56,92 L44,70 L22,86 L28,62 L2,56 L24,44 L10,22 L36,30Z" fill="#f2862a" />
            <path d="M48,18 L53,32 L68,26 L60,42 L76,46 L60,54 L68,70 L52,62 L48,78 L42,62 L28,70 L34,54 L18,48 L34,42 L28,28 L42,34Z" fill="#f3d23a" />
          </svg>
          {[0, .3, .6, .9].map((d, i) => (
            <span key={i} className="absolute top-[30%] block w-6 h-6 rounded-full bg-[#5a524b] animate-smoke"
              style={{ left: `${30 + i * 12}%`, animationDelay: `${.4 + d}s` }} />
          ))}
        </div>
      )
    case 'pie':
      return (
        <div className="relative">
          <Splat fill="#fbf4e8" inner={<>
            <path d="M22,34 C30,26 52,26 62,36" stroke="#f0c8d0" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".7" />
            <circle cx="44" cy="22" r="6" fill="#c8312b" /><circle cx="42" cy="20" r="1.8" fill="#fff" opacity=".6" />
          </>} />
        </div>
      )
    case 'water':
      return (
        <div className="relative" style={{ width: 92, height: 92 }}>
          <div className="absolute inset-[12px] rounded-full animate-fade-in"
            style={{ background: 'radial-gradient(circle at 40% 30%, rgba(170,220,255,.55), rgba(74,163,216,.35) 60%, transparent 75%)' }} />
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="absolute top-1 block w-2 h-3 rounded-full bg-[#7cc4ee] animate-feather"
              style={{ left: `${12 + i * 10}%`, '--x1': `${(i - 4) * 4}px`, '--r': '0deg', animationDelay: `${i * .08}s`, animationDuration: '1.2s' }} />
          ))}
          <svg width="92" height="40" viewBox="0 0 92 40" className="absolute -top-6 left-0 animate-burst">
            {[[10, 30, -40], [26, 18, -20], [46, 12, 0], [66, 18, 20], [82, 30, 40]].map(([x, y, r], i) => (
              <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M0,-8 C3,-3 4,0 4,2 C4,5 2,6 0,6 C-2,6 -4,5 -4,2 C-4,0 -3,-3 0,-8Z" fill="#4aa3d8" />
            ))}
          </svg>
        </div>
      )
    case 'lightning':
      return (
        <div className="relative" style={{ width: 92, height: 92 }}>
          <div className="absolute inset-[12px] rounded-full bg-white animate-flashes" />
          <svg width="56" height="80" viewBox="0 0 56 80" className="absolute -top-10 left-5 animate-burst">
            <path d="M34,0 L12,36 L26,36 L16,80 L48,28 L32,28 L44,0Z" fill="#f3d23a" stroke="#b58a1a" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <Sparkles color="#f3d23a" />
        </div>
      )
    case 'bills':
      return (
        <div className="relative" style={{ width: 96, height: 96 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <svg key={i} width="26" height="14" viewBox="0 0 26 14" className="absolute top-0 animate-bill"
              style={{ left: `${8 + (i % 5) * 18}%`, '--x0': `${(i % 3 - 1) * 6}px`, '--x1': `${(i % 3 - 1) * 14}px`, '--r': `${i % 2 ? 260 : -220}deg`, animationDelay: `${i * .12}s` }}>
              <rect width="26" height="14" rx="2" fill="#6aa864" stroke="#2d5a2a" />
              <circle cx="13" cy="7" r="4" fill="#2d5a2a" opacity=".45" />
              <text x="13" y="10" textAnchor="middle" fontSize="8" fontWeight="700" fill="#e8f4d8" fontFamily="Georgia, serif">$</text>
            </svg>
          ))}
          <Tag className="-top-6 border-win-text/60 text-win-text">$ $ $</Tag>
        </div>
      )
    case 'jackpot':
      return (
        <div className="relative flex flex-col items-center" style={{ marginTop: -70 }}>
          <div className="animate-drop-in rounded-[8px] border-2 border-gold-500 bg-[#7a2838] p-1 shadow-card">
            <div className="flex gap-0.5 bg-[#f6efe0] rounded-[4px] px-1 overflow-hidden" style={{ height: 22 }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-4 overflow-hidden">
                  <div className="animate-reel flex flex-col items-center font-black text-[14px] leading-[22px] text-[#c8312b]"
                    style={{ animationDelay: `${.15 + i * .2}s`, fontFamily: 'Arial Black, sans-serif' }}>
                    <span>🍒</span><span>$</span><span>♠</span><span>🍋</span><span>7</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <span className="mt-1 whitespace-nowrap px-2 py-0.5 rounded-pill bg-noir-900/90 border border-gold-500 text-[10px] font-sans font-medium text-gold-400 animate-fade-in">JACKPOT</span>
          <Sparkles />
        </div>
      )
    case 'chip':
      return (
        <div className="relative" style={{ perspective: 300 }}>
          <div className="animate-spin-y"><ThrowIcon kind="chip" size={44} /></div>
          <Tag className="-bottom-6 border-gold-600/60 text-gold-400">+ propina</Tag>
        </div>
      )
    case 'kiss':
      return (
        <div className="relative animate-splat-in">
          <svg width="64" height="52" viewBox="0 0 40 32" style={{ transform: 'rotate(-14deg)' }}>
            <path d="M4,15 C8,6 15,7 20,10 C25,7 32,6 36,15 C29,14 25,14 20,15 C15,14 11,14 4,15Z" fill="#b3203a" opacity=".85" />
            <path d="M4,15 C11,27 29,27 36,15 C29,17 11,17 4,15Z" fill="#d63a52" opacity=".85" />
            <path d="M10,18 C14,19 18,19 20,18 M22,19 C26,20 30,19 32,18" stroke="#8e1528" strokeWidth=".8" fill="none" opacity=".6" />
          </svg>
          {[-18, 0, 18].map((dx, i) => (
            <span key={i} className="absolute left-1/2 top-0 text-sm animate-heart-up"
              style={{ marginLeft: dx, animationDelay: `${i * 0.18}s`, color: '#e05a70' }}>♥</span>
          ))}
        </div>
      )
    case 'rose':
      return (
        <div className="relative animate-splat-in">
          <ThrowIcon kind="rose" size={46} />
          {[[-20, 0], [16, 0.2], [-6, 0.4], [24, 0.55]].map(([dx, delay], i) => (
            <span key={i} className="absolute top-2 left-1/2 block w-2 h-3 rounded-full bg-[#b3203a] animate-petal"
              style={{ marginLeft: dx, animationDelay: `${delay}s` }} />
          ))}
        </div>
      )
    case 'crown':
      return (
        <div className="relative" style={{ marginTop: -64 }}>
          <div className="animate-drop-in"><ThrowIcon kind="crown" size={52} /></div>
          <Sparkles />
        </div>
      )
    case 'clover':
      return (
        <div className="relative flex flex-col items-center" style={{ perspective: 300 }}>
          <div className="animate-spin-y"><ThrowIcon kind="clover" size={46} /></div>
          <Tag className="-bottom-6 border-win-text/60 text-win-text">¡Suerte!</Tag>
          <Sparkles color="#9be0a4" />
        </div>
      )
    case 'slipper':
      return (
        <div className="relative" style={{ width: 92, height: 92 }}>
          <div className="absolute left-[38%] top-[28%] w-8 h-6 rounded-full bg-[#e0606a]/50 animate-fade-in" style={{ animationDelay: '.15s' }} />
          <div className="absolute left-4 -top-4 animate-wobble origin-bottom" style={{ transform: 'rotate(-30deg)' }}>
            <ThrowIcon kind="slipper" size={50} />
          </div>
          <Tag className="-top-8 border-stand-text/60 text-stand-text">¡PAM!</Tag>
          <svg width="92" height="40" viewBox="0 0 92 40" className="absolute -top-2 left-0 animate-burst" style={{ overflow: 'visible' }}>
            {[[60, 10], [72, 22], [64, 32]].map(([x, y], i) => <path key={i} d={`M${x},${y} l10,${(i - 1) * 5}`} stroke="#f3d58a" strokeWidth="2.4" strokeLinecap="round" />)}
          </svg>
        </div>
      )
    case 'fish':
      return (
        <div className="relative" style={{ width: 92, height: 92 }}>
          <div className="absolute left-3 top-4 animate-wobble origin-right" style={{ transform: 'rotate(18deg)' }}>
            <ThrowIcon kind="fish" size={64} />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="absolute top-6 block w-1.5 h-2.5 rounded-full bg-[#9ad8ff] animate-feather"
              style={{ left: `${20 + i * 11}%`, '--x1': `${(i - 3) * 6}px`, '--r': '0deg', animationDelay: `${i * .07}s`, animationDuration: '1.1s' }} />
          ))}
          <Tag className="-top-6 border-[#9ad8ff]/60 text-[#9ad8ff]">¡PLAF!</Tag>
        </div>
      )
    case 'clown':
      return (
        <div className="relative flex flex-col items-center" style={{ width: 92, height: 92 }}>
          <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 animate-splat-in">
            <ThrowIcon kind="clown" size={30} />
          </div>
          <svg width="92" height="30" viewBox="0 0 92 30" className="absolute -top-3 left-0 animate-burst">
            {[[8, 22, '#e05a70'], [22, 10, '#4aa3d8'], [70, 10, '#3f9a48'], [84, 22, '#f3c73a']].map(([x, y, c], i) => <circle key={i} cx={x} cy={y} r="5" fill={c} />)}
          </svg>
          <Tag className="-bottom-1 border-[#e0262e]/60 text-[#ff8a8a]">¡HONK!</Tag>
        </div>
      )
    case 'snowball':
      return (
        <div className="relative">
          <Splat fill="#f4f8fb" drips={false} inner={<>
            <ellipse cx="38" cy="26" rx="8" ry="4" fill="#fff" />
            <path d="M24,40 C30,36 34,44 40,40 M48,48 C52,44 58,50 62,46" stroke="#cdd9e3" strokeWidth="2" fill="none" />
          </>} />
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="absolute top-0 text-[11px] text-white animate-feather"
              style={{ left: `${8 + i * 15}%`, '--x1': `${(i % 2 ? 1 : -1) * 10}px`, '--r': '180deg', animationDelay: `${i * .15}s` }}>❄</span>
          ))}
        </div>
      )
    case 'confetti':
      return (
        <div className="relative" style={{ width: 96, height: 96 }}>
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="absolute top-0 block w-2 h-3 animate-bill"
              style={{ left: `${4 + (i % 7) * 14}%`, background: ['#e05a70', '#4aa3d8', '#3f9a48', '#f3c73a', '#b76bff'][i % 5],
                '--x0': `${(i % 3 - 1) * 4}px`, '--x1': `${(i % 3 - 1) * 16}px`, '--r': `${i % 2 ? 400 : -380}deg`, animationDelay: `${(i % 7) * .08}s` }} />
          ))}
          <Tag className="-top-6 border-gold-500/60 text-gold-400">¡Fiesta!</Tag>
        </div>
      )
    case 'flashbang':
      return (
        <div className="relative" style={{ width: 96, height: 96 }}>
          <div className="absolute inset-1 rounded-full bg-white animate-flash-out" />
          <svg width="96" height="96" viewBox="0 0 96 96" className="absolute inset-0" style={{ overflow: 'visible' }}>
            {[14, 22, 30].map((r, i) => (
              <g key={r} fill="none" stroke="#f6efe0" strokeWidth="1.6" opacity=".75" className="animate-fade-in" style={{ animationDelay: `${.5 + i * .15}s` }}>
                <path d={`M${2 - i * 4},${48 - r} A${r},${r} 0 0,0 ${2 - i * 4},${48 + r}`} />
                <path d={`M${94 + i * 4},${48 - r} A${r},${r} 0 0,1 ${94 + i * 4},${48 + r}`} />
              </g>
            ))}
          </svg>
          <Tag className="-top-6 border-white/60 text-white" >iiiiiiii…</Tag>
          <Sparkles color="#ffffff" />
        </div>
      )
    case 'smoke':
      return (
        <div className="relative" style={{ width: 100, height: 100 }}>
          {[[30, 40, 0], [60, 36, .15], [44, 58, .3], [20, 62, .45], [70, 62, .2], [46, 26, .4]].map(([x, y, d], i) => (
            <span key={i} className="absolute block rounded-full bg-[#c9ccd0] animate-smoke-cover"
              style={{ left: `${x}%`, top: `${y}%`, width: 46, height: 46, marginLeft: -23, marginTop: -23, animationDelay: `${d}s` }} />
          ))}
          <Tag className="-top-6 border-warm-600 text-cream">¿Dónde estoy?</Tag>
        </div>
      )
    case 'laser':
      return (
        <div className="relative" style={{ width: 96, height: 96 }}>
          <svg width="160" height="96" viewBox="0 0 160 96" className="absolute -left-16 top-0 animate-laser" style={{ overflow: 'visible' }}>
            <path d="M0,10 L112,48" stroke="#ff3b3b" strokeWidth="8" strokeLinecap="round" opacity=".35" />
            <path d="M0,10 L112,48" stroke="#ffd0d0" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <div className="absolute left-[50%] top-[46%] w-6 h-6 -ml-3 -mt-3 rounded-full animate-fade-in"
            style={{ background: 'radial-gradient(circle, #1a0c0a 30%, rgba(255,80,40,.6) 55%, transparent 72%)', animationDelay: '.3s' }} />
          {[0, .3].map((d, i) => (
            <span key={i} className="absolute left-[52%] top-[36%] block w-3 h-3 rounded-full bg-[#5a524b] animate-smoke" style={{ animationDelay: `${.4 + d}s` }} />
          ))}
          <Tag className="-top-6 border-[#ff3b3b]/60 text-[#ff8a8a]">PEW PEW</Tag>
        </div>
      )
    case 'headshot':
      return (
        <div className="relative" style={{ width: 96, height: 96 }}>
          <svg width="96" height="96" viewBox="0 0 96 96" className="absolute inset-0 animate-burst">
            <circle cx="48" cy="44" r="20" fill="none" stroke="#ff3b3b" strokeWidth="2" opacity=".9" />
            <path d="M48,16 L48,32 M48,56 L48,72 M20,44 L36,44 M60,44 L76,44" stroke="#ff3b3b" strokeWidth="2" />
            <path d="M40,36 L45,41 M56,36 L51,41 M40,52 L45,47 M56,52 L51,47" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span className="absolute left-1/2 -bottom-1 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-[4px] bg-[#b5121e] text-[10px] font-black tracking-wider text-white animate-burst"
            style={{ fontFamily: 'Arial Black, sans-serif', animationDelay: '.15s' }}>HEADSHOT</span>
        </div>
      )
    case 'pixel':
      return (
        <div className="relative flex flex-col items-center" style={{ marginTop: -60 }}>
          <div className="animate-drop-in" style={{ imageRendering: 'pixelated' }}><ThrowIcon kind="pixel" size={46} /></div>
          <div className="flex gap-1 mt-1">
            {[0, 1, 2, 3].map(i => (
              <span key={i} className="block w-2 h-2 bg-[#8a6038] animate-feather"
                style={{ '--x1': `${(i - 1.5) * 12}px`, '--r': '90deg', animationDelay: `${.35 + i * .05}s`, animationDuration: '1s' }} />
            ))}
          </div>
          <span className="mt-1 text-[11px] font-black text-[#ff5a5a] animate-fade-in" style={{ fontFamily: 'monospace', animationDelay: '.3s' }}>-1 ❤</span>
        </div>
      )
    case 'gg':
      return (
        <div className="relative flex flex-col items-center" style={{ marginTop: -50 }}>
          <div className="animate-drop-in"><ThrowIcon kind="gg" size={50} /></div>
          <span className="mt-1 whitespace-nowrap px-2 py-0.5 rounded-pill bg-noir-900/90 border border-gold-500 text-[10px] font-black tracking-widest text-gold-400 animate-fade-in"
            style={{ fontFamily: 'Arial Black, sans-serif' }}>GG WP</span>
          <Sparkles />
        </div>
      )
    default:
      return null
  }
}

// ── Proyectil que vuela de un asiento a otro ──────────────────
function Projectile({ kind, from, to }) {
  const ref = useRef(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el?.animate) return
    const midTop = Math.min(from.y, to.y) - 14
    const spin = ['bills', 'chip', 'crown', 'clover', 'horn', 'laser', 'headshot', 'gg', 'confetti', 'clown'].includes(kind) ? 0 : 520
    el.animate([
      { left: `${from.x}%`, top: `${from.y}%`, transform: 'translate(-50%,-50%) scale(.6) rotate(0deg)' },
      { left: `${(from.x + to.x) / 2}%`, top: `${midTop}%`, transform: `translate(-50%,-50%) scale(1.25) rotate(${spin / 2}deg)`, offset: 0.5 },
      { left: `${to.x}%`, top: `${to.y}%`, transform: `translate(-50%,-50%) scale(1) rotate(${spin}deg)` },
    ], { duration: FLIGHT_MS, easing: 'cubic-bezier(.3,.6,.5,1)', fill: 'forwards' })
  }, [from, to, kind])
  return (
    <div ref={ref} className="absolute z-40 pointer-events-none drop-shadow-[0_6px_8px_rgba(0,0,0,0.6)]"
      style={{ left: `${from.x}%`, top: `${from.y}%`, transform: 'translate(-50%,-50%)' }}>
      <ThrowIcon kind={kind === 'bang' ? 'bang' : kind} size={34} />
    </div>
  )
}

// ── Capa que escucha y dibuja todas las reacciones ────────────
export function ReactionLayer({ seatPos = {} }) {
  const { on } = useSocket()
  const { play } = useAudio()
  const [items, setItems] = useState([])
  const posRef = useRef(seatPos)
  posRef.current = seatPos
  const playRef = useRef(play)
  playRef.current = play

  useEffect(() => {
    const timers = []
    const sfx = (name) => playRef.current?.(name)
    const remove = (id, after) => timers.push(setTimeout(() => setItems(list => list.filter(i => i.id !== id)), after))

    const off = on('game:reaction', ({ id, kind, from, to }) => {
      const pos = posRef.current
      if (!pos[from]) return
      const emote = EMOTES.find(e => e.kind === kind)
      if (emote) {
        sfx('pop')
        setItems(list => [...list, { id, type: 'emote', glyph: emote.glyph, at: pos[from] }])
        remove(id, 1900)
        return
      }
      const t = THROWABLES.find(x => x.kind === kind)
      if (!t || !pos[to]) return
      sfx('whoosh')
      setItems(list => [...list, { id, type: 'fly', kind, from: pos[from], to: pos[to] }])
      timers.push(setTimeout(() => {
        sfx(t.sound)
        setItems(list => [
          ...list.filter(i => i.id !== id),
          { id: `${id}-hit`, type: 'hit', kind, ms: t.ms, at: posRef.current[to] ?? pos[to] },
        ])
        remove(`${id}-hit`, t.ms)
      }, FLIGHT_MS))
    })
    return () => { off?.(); timers.forEach(clearTimeout) }
  }, [on])

  return (
    <>
      {items.map(item => {
        if (item.type === 'fly') return <Projectile key={item.id} kind={item.kind} from={item.from} to={item.to} />
        if (item.type === 'emote') {
          return (
            <div key={item.id} className="absolute z-40 pointer-events-none" style={{ left: `${item.at.x}%`, top: `${item.at.y}%` }}>
              <span className="block -translate-x-1/2 text-4xl animate-emote">{item.glyph}</span>
            </div>
          )
        }
        return (
          <div key={item.id} className="absolute z-30 pointer-events-none flex justify-center"
            style={{ left: `${item.at.x}%`, top: `${item.at.y}%`, transform: 'translate(-50%,-55%)' }}>
            <div className="animate-impact-out" style={{ animationDuration: `${item.ms / 1000}s` }}>
              <Impact kind={item.kind} />
            </div>
          </div>
        )
      })}
    </>
  )
}

// ── Menú inferior (bottom sheet) al tocar un asiento ──────────
export function ReactionSheet({ target, isMe, onClose }) {
  const { emit } = useSocket()
  const [cat, setCat] = useState('burla')
  const [coolLeft, setCoolLeft] = useState(Math.max(0, COOLDOWN_MS - (Date.now() - lastSentAt)))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (coolLeft <= 0) return
    const t = setTimeout(() => setCoolLeft(0), coolLeft)
    return () => clearTimeout(t)
  }, [coolLeft])

  const send = (kind) => {
    if (coolLeft > 0) return
    lastSentAt = Date.now()
    emit('game:react', { kind, to: isMe ? null : target.id }, () => {})
    onClose()
  }

  const items = isMe ? EMOTES : THROWABLES.filter(t => t.cat === cat)
  // 5 categorías: la etiqueta se oculta en pantallas muy angostas

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md animate-sheet-in rounded-t-[22px] border border-b-0 border-gold-600/60 bg-noir-800
                      shadow-[0_-12px_40px_rgba(0,0,0,0.7)] pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="w-10 h-1 rounded-full bg-noir-500 mx-auto mt-2 mb-3" />

        {/* Encabezado */}
        <div className="flex items-center gap-3 px-4 mb-3">
          <div className="rounded-full overflow-hidden border border-gold-600/60 flex-shrink-0" style={{ width: 40, height: 40 }}>
            <AvatarRenderer nickname={target.nickname} avatar={target.avatar} size={40} framing="bust" mood={isMe ? 'smug' : 'shock'} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="label-muted">{isMe ? 'Reaccionar' : 'Lanzar a'}</p>
            <p className="font-serif text-lg text-cream truncate leading-tight">{isMe ? 'Tu mesa te escucha' : target.nickname}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="w-9 h-9 rounded-full text-warm-600 hover:text-gold-500 hover:bg-noir-700">✕</button>
        </div>

        {/* Categorías */}
        {!isMe && (
          <div className="flex gap-1 px-3 mb-3">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setCat(c.key)}
                className={`flex-1 h-9 rounded-pill text-xs font-sans transition-colors flex items-center justify-center gap-1
                  ${cat === c.key ? 'bg-gold-500 text-noir-900 font-medium' : 'bg-noir-900 text-warm-400 border border-noir-600'}`}>
                <span>{c.glyph}</span><span className="hidden min-[360px]:inline">{c.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Opciones */}
        <div key={isMe ? 'me' : cat} className={`grid ${isMe ? 'grid-cols-6' : 'grid-cols-4'} gap-2 px-3 animate-fade-in`}>
          {items.map(o => (
            <button key={o.kind} onClick={() => send(o.kind)} disabled={coolLeft > 0}
              className="flex flex-col items-center gap-1 rounded-[12px] py-2 bg-noir-900 border border-noir-600
                         hover:border-gold-600 active:scale-90 transition-all disabled:opacity-40">
              {isMe ? <span className="text-[26px] leading-none">{o.glyph}</span> : <ThrowIcon kind={o.kind} size={34} />}
              <span className="text-[10px] font-sans text-warm-400 leading-tight">{o.label}</span>
            </button>
          ))}
        </div>

        {/* Espera */}
        <div className="px-4 mt-3 h-4">
          {coolLeft > 0 && (
            <div className="h-1 rounded-full bg-noir-900 overflow-hidden">
              <div className="h-full bg-gold-500 animate-cooldown" style={{ animationDuration: `${coolLeft}ms` }} />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
