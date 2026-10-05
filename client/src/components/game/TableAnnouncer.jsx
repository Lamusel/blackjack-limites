import { useEffect, useRef, useState } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { DIFFICULTY } from '@/lib/utils'
import { penaltyFor } from '@/lib/cards'
import AvatarRenderer from '@/components/avatar/AvatarRenderer'

// ─────────────────────────────────────────────────────────────
// Avisos grandes en el centro de la mesa: lo que decidió y logró
// el jugador en turno. Los ven todos menos quien hizo la jugada
// (ese ya ve su hoja). Las vueltas las ven todos.
// ─────────────────────────────────────────────────────────────

const TONES = {
  gold:  { ring: 'border-gold-500',   text: 'text-gold-400',   glow: 'rgba(201,168,76,0.35)' },
  win:   { ring: 'border-win-text',   text: 'text-win-text',   glow: 'rgba(126,207,158,0.30)' },
  lose:  { ring: 'border-lose-text',  text: 'text-lose-text',  glow: 'rgba(207,126,126,0.30)' },
  stand: { ring: 'border-stand-text', text: 'text-stand-text', glow: 'rgba(207,176,126,0.25)' },
  ace:   { ring: 'border-[#f3d58a]',  text: 'text-[#f3d58a]',  glow: 'rgba(243,213,138,0.55)' },
  muted: { ring: 'border-noir-500',   text: 'text-warm-400',   glow: 'rgba(0,0,0,0)' },
}

function describe(a, name) {
  const d = DIFFICULTY[a.difficulty]
  switch (a.type) {
    case 'draw':
      return { icon: '🃏', title: `${name} sacó un ${a.cardPoints}`, big: `${a.cardPoints}`,
               sub: `${d ? d.label : ''} · si falla pierde ${penaltyFor(a.cardPoints)}`, tone: 'gold', ms: 2600 }
    case 'ace':
      return { icon: '✦', title: `¡${name} sacó el AS DORADO!`, big: 'A',
               sub: 'Si acierta elige si vale 1 u 11', tone: 'ace', ms: 3200 }
    case 'ace_choice':
      return { icon: '✦', title: `${name} acertó el As`, big: null, sub: 'Está decidiendo: ¿1 u 11?', tone: 'ace', ms: 2600 }
    case 'pass':
      return { icon: '✋', title: `${name} se plantó`, big: null, sub: `Se queda con ${a.points} por esta vuelta`, tone: 'stand', ms: 2200 }
    case 'timeout_pass':
      return { icon: '⏳', title: `${name} no alcanzó a decidir`, big: null, sub: 'Pasa el turno', tone: 'muted', ms: 2200 }
    case 'correct':
      if (a.ace) return {
        icon: '✦', title: `${name} usó su As como ${a.aceValue}`, big: `+${a.delta}`,
        sub: `Ahora tiene ${a.points}`, tone: 'ace', ms: 3000,
      }
      return {
        icon: '✅', title: `${name} acertó`, big: `+${a.delta}`,
        sub: a.streak >= 3 ? `🔥 En racha ×${a.streak} · ahora tiene ${a.points}` : `Ahora tiene ${a.points}`,
        tone: 'win', ms: 2800,
      }
    case 'wrong':
      return {
        icon: '❌', title: `${name} falló`, big: a.delta < 0 ? `${a.delta}` : '±0',
        sub: a.delta < 0 ? `Baja a ${a.points}` : 'Estaba en 0, no pierde nada', tone: 'lose', ms: 2800,
      }
    case 'timeout':
      return { icon: '⌛', title: `${name} se quedó sin tiempo`, big: a.delta < 0 ? `${a.delta}` : '±0', sub: `Queda con ${a.points}`, tone: 'lose', ms: 2600 }
    case 'bust':
      return { icon: '💥', title: `${name} se pasó de 21`, big: `${a.points}`, sub: 'Queda eliminado', tone: 'lose', ms: 3200 }
    case 'twentyone':
      return { icon: '♛', title: `¡${name} llegó a 21!`, big: '21', sub: 'La partida termina al cerrar la vuelta', tone: 'gold', ms: 3400 }
    case 'fifty':
      return { icon: '🎯', title: `${name} usó su 50/50`, big: null, sub: 'Quitó dos opciones', tone: 'muted', ms: 1800 }
    case 'round':
      return { icon: '♠', title: a.round === 1 ? 'Comienza la partida' : `Vuelta ${a.round}`, big: null,
               sub: a.round === 1 ? 'Que la suerte (y el cálculo) te acompañe' : 'Todos vuelven a decidir', tone: 'gold', ms: 1800 }
    default:
      return null
  }
}

export default function TableAnnouncer({ players = [], playerId }) {
  const { on } = useSocket()
  const [current, setCurrent] = useState(null)
  const queue = useRef([])
  const timer = useRef(null)
  const currentRef = useRef(null)
  const playersRef = useRef(players)
  playersRef.current = players

  useEffect(() => {
    const showNext = () => {
      const next = queue.current.shift()
      currentRef.current = next ?? null
      if (!next) { setCurrent(null); timer.current = null; return }
      setCurrent(next)
      timer.current = setTimeout(showNext, next.ms)
    }
    const push = (item) => {
      if (!item) return
      // Si llega el resultado mientras aún se ve "pidió carta", saltamos directo
      if (['draw', 'ace', 'ace_choice'].includes(currentRef.current?.type) && item.type !== 'round'
          && !(currentRef.current.type === 'ace' && item.type === 'ace_choice')) {
        clearTimeout(timer.current); timer.current = null; queue.current = []
      }
      queue.current.push(item)
      if (queue.current.length > 3) queue.current.splice(0, queue.current.length - 3)
      if (!timer.current) showNext()
    }

    const offA = on('game:announce', (a) => {
      if (a.playerId === playerId) return
      const p = playersRef.current.find(x => x.id === a.playerId)
      const info = describe(a, p?.nickname ?? 'Alguien')
      if (info) push({ ...info, type: a.type, key: `${a.type}-${a.at}`, player: p })
    })
    const offR = on('game:round_start', ({ round }) => {
      push({ ...describe({ type: 'round', round }), type: 'round', key: `round-${round}`, player: null })
    })
    return () => { offA?.(); offR?.(); clearTimeout(timer.current); timer.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, playerId])

  if (!current) return null
  const tone = TONES[current.tone] ?? TONES.gold

  return (
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-center pointer-events-none px-4">
      <div key={current.key}
        className={`animate-announce flex items-center gap-3 max-w-[280px] px-4 py-3 rounded-[16px] border ${tone.ring}
                    bg-noir-900/90 backdrop-blur-sm`}
        style={{ boxShadow: `0 10px 30px rgba(0,0,0,0.6), 0 0 28px ${tone.glow}` }}>
        {current.player ? (
          <div className="relative flex-shrink-0">
            <div className="rounded-full overflow-hidden border border-noir-500" style={{ width: 40, height: 40 }}>
              <AvatarRenderer nickname={current.player.nickname} avatar={current.player.avatar} size={40} />
            </div>
            <span className="absolute -bottom-1 -right-1 text-base leading-none drop-shadow">{current.icon}</span>
          </div>
        ) : (
          <span className={`font-serif text-2xl ${tone.text}`}>{current.icon}</span>
        )}
        <div className="min-w-0">
          <p className="font-serif text-cream text-[15px] leading-tight">{current.title}</p>
          {current.sub && <p className="text-warm-400 text-[11px] font-sans leading-snug mt-0.5">{current.sub}</p>}
        </div>
        {current.big && (
          <span className={`font-serif text-3xl leading-none pl-1 ${tone.text}`}>{current.big}</span>
        )}
      </div>
    </div>
  )
}
