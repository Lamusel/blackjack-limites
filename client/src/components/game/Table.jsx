import { useEffect, useState } from 'react'
import Seat from './Seat'
import ChipStack from './ChipStack'
import PlayingCard, { CardBack } from './PlayingCard'
import TableAnnouncer from './TableAnnouncer'
import { ReactionLayer, ReactionSheet } from './Reactions'
import { useSocket } from '@/hooks/useSocket'
import { useTableMoods } from '@/hooks/useTableMoods'

// Ángulos de los asientos (grados, 90 = abajo). Yo siempre abajo al centro;
// los demás se reparten por los lados y arriba, en orden de turno (sentido horario).
function seatAngles(othersCount) {
  if (othersCount <= 0) return []
  if (othersCount === 1) return [270]
  const start = 150, span = 240
  return Array.from({ length: othersCount }, (_, i) => start + (i * span) / (othersCount - 1))
}

const rad = (deg) => (deg * Math.PI) / 180
const pos = (angle, rx, ry) => ({
  left: `${50 + rx * Math.cos(rad(angle))}%`,
  top:  `${50 + ry * Math.sin(rad(angle))}%`,
})
// Fichas: misma posición del asiento pero corridas hacia el centro (px en x / y)
const chipPos = (angle, rx, ry, pxX, pxY) => ({
  left: `calc(${50 + rx * Math.cos(rad(angle))}% - ${pxX * Math.cos(rad(angle))}px)`,
  top:  `calc(${50 + ry * Math.sin(rad(angle))}% - ${pxY * Math.sin(rad(angle))}px)`,
})

// ¿Pantalla bajita? (celular girado en horizontal)
function useShortScreen() {
  const query = '(max-height: 500px)'
  const [short, setShort] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setShort(mq.matches)
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return short
}

export default function Table({
  players = [],
  playerId,
  currentTurn,
  timeRemaining,
  turnTotal,
  deltas = {},
  fiftyUsedBy = [],
  card,
  cardDrawn,
  myTurn,
}) {
  // Rotar la lista para que yo quede abajo y los demás sigan el orden de turno
  const meIdx   = Math.max(0, players.findIndex(p => p.id === playerId))
  const ordered = players.length ? [...players.slice(meIdx), ...players.slice(0, meIdx)] : []
  const me      = ordered[0]?.id === playerId ? ordered[0] : null
  const others  = me ? ordered.slice(1) : ordered
  const angles  = seatAngles(others.length)

  const seats = [
    ...(me ? [{ p: me, angle: 90, isMe: true }] : []),
    ...others.map((p, i) => ({ p, angle: angles[i], isMe: false })),
  ]

  const turnPlayer = players.find(p => p.id === currentTurn)
  const short      = useShortScreen()
  const [menuFor, setMenuFor] = useState(null)   // id del asiento con el menú de reacciones abierto

  // Posición numérica (%) de cada asiento → para animar reacciones entre asientos
  const seatPos = Object.fromEntries(seats.map(({ p, angle }) => [p.id, {
    x: 50 + 48 * Math.cos(rad(angle)),
    y: 50 + 47 * Math.sin(rad(angle)),
  }]))
  const menuSeat = seats.find(s => s.p.id === menuFor)
  const moods = useTableMoods({ players, currentTurn, cardDrawn })

  // Efectos de mesa: sacudida si alguien se pasa, destello dorado si alguien llega a 21
  const { on } = useSocket()
  const [fx, setFx] = useState(null)   // { type, key }
  useEffect(() => {
    const off = on('game:announce', (a) => {
      if (a.type === 'bust') setFx({ type: 'shake', key: a.at })
      if (a.type === 'twentyone') setFx({ type: 'flash', key: a.at })
    })
    return () => off?.()
  }, [on])

  return (
    <div className="relative w-full px-8 pt-10 pb-14 landscape:px-12 [@media(max-height:500px)]:pt-8 [@media(max-height:500px)]:pb-10">
      {/* Mesa */}
      <div key={fx?.type === 'shake' ? fx.key : 'mesa'}
        className={`relative mx-auto aspect-[4/5] w-[min(100%,55vh)] landscape:aspect-[2/1] landscape:w-[min(100%,120vh)]
                    ${fx?.type === 'shake' ? 'animate-table-shake' : ''}`}>
        <div key={fx?.type === 'flash' ? fx.key : 'pano'}
          className={`absolute inset-0 rounded-[48%] table-rail felt-burgundy overflow-hidden ${fx?.type === 'flash' ? 'animate-gold-flash' : ''}`}>
          {/* Línea interior dorada */}
          <div className="absolute inset-[9%] rounded-[48%] table-betline" />
        </div>

        {/* Centro: título + mazo + carta del turno */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="flex items-center gap-3">
            {/* Mazo */}
            <div className="relative opacity-90 scale-75 -mr-2">
              <div className="absolute translate-x-1 -translate-y-1"><CardBack /></div>
              <div className="absolute translate-x-0.5 -translate-y-0.5"><CardBack /></div>
              <CardBack />
            </div>

            {/* Carta del turno */}
            {currentTurn ? (
              <div key={currentTurn} className="relative animate-deal">
                <PlayingCard
                  card={card}
                  faceUp={cardDrawn && !!card}
                  glow={cardDrawn}
                />
              </div>
            ) : (
              <div className="playing-card rounded-[8px] border border-dashed border-gold-500/25" />
            )}
          </div>
          {turnPlayer && (
            <p className="mt-2 max-w-[160px] truncate text-center text-[11px] font-sans text-cream/70 [@media(max-height:500px)]:hidden">
              {card?.isAce ? '✦ ¡As dorado! ✦' : turnPlayer.id === playerId ? 'Tu carta' : turnPlayer.nickname}
            </p>
          )}
        </div>

        {/* Fichas de cada jugador (entre su asiento y el centro) */}
        {seats.map(({ p, angle }) => (
          <div key={`chips-${p.id}`}
            className="absolute -translate-x-1/2 -translate-y-1/2 [@media(max-height:500px)]:scale-75"
            style={short ? chipPos(angle, 48, 47, 54, 36) : chipPos(angle, 48, 47, 66, 62)}>
            <ChipStack points={p.points ?? 0} dim={p.status === 'eliminated'} />
          </div>
        ))}

        {/* Asientos (sobre el borde) */}
        {seats.map(({ p, angle, isMe }) => (
          <div key={p.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 [@media(max-height:500px)]:scale-[0.8]"
            style={pos(angle, 48, 47)}>
            <Seat
              onClick={() => setMenuFor(id => (id === p.id ? null : p.id))}
              player={p}
              isMe={isMe}
              isTurn={currentTurn === p.id}
              timeRemaining={timeRemaining}
              turnTotal={turnTotal}
              delta={deltas[p.id] ?? null}
              fiftyUsed={fiftyUsedBy.includes(p.id)}
              mood={moods[p.id]}
            />
          </div>
        ))}

        {/* Avisos de jugadas, reacciones y menú */}
        <TableAnnouncer players={players} playerId={playerId} />
        <ReactionLayer seatPos={seatPos} />
      </div>

      {menuSeat && (
        <ReactionSheet target={menuSeat.p} isMe={menuSeat.isMe} onClose={() => setMenuFor(null)} />
      )}

      <p className="mt-10 text-center text-[11px] font-sans text-warm-600 [@media(max-height:500px)]:hidden">
        Toca un retrato para reaccionar o lanzarle algo 🍅
      </p>
    </div>
  )
}
