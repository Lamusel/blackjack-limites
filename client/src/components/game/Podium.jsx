import AvatarRenderer from '@/components/avatar/AvatarRenderer'
import ReviewList from './ReviewList'
import { BADGES } from '@/lib/badges'
import { winTier } from '@/lib/avatar'

// Confeti dorado/vino cuando ganas
function Confetti() {
  const colors = ['#c9a84c', '#e8d5a3', '#7a2838', '#f0e6d3', '#a07a28']
  return (
    <>
      {Array.from({ length: 46 }).map((_, i) => (
        <span key={i} className="confetti-piece"
          style={{
            left: `${(i * 37) % 100}%`,
            background: colors[i % colors.length],
            animationDuration: `${2.4 + (i % 7) * 0.35}s`,
            animationDelay: `${(i % 10) * 0.12}s`,
            '--dx': `${((i * 53) % 120) - 60}px`,
            '--rot': `${360 + (i % 5) * 120}deg`,
            width: i % 3 ? 8 : 6, height: i % 3 ? 14 : 10,
          }} />
      ))}
    </>
  )
}

// Íconos de logros pequeños debajo de cada jugador
function BadgeRow({ badges = [], catalog }) {
  if (!badges.length) return null
  return (
    <div className="flex flex-wrap justify-center gap-0.5 mt-0.5 mb-1">
      {badges.map(b => (
        <span key={b} title={`${catalog[b]?.label ?? b}: ${catalog[b]?.desc ?? ''}`} className="text-sm leading-none">
          {catalog[b]?.icon ?? '★'}
        </span>
      ))}
    </div>
  )
}

// Pantalla final: podio con los 3 primeros + resto de la clasificación + repaso privado
const REASON_TEXT = {
  twentyone:  'Alguien llegó a 21 exacto',
  all_passed: 'Todos se plantaron en la misma vuelta',
  no_players: 'No quedaron jugadores en juego',
}

export default function Podium({
  ranking = [], playerId, winners = [], endReason, rounds, review = [], badgeCatalog, onHome, onRooms, onProfile,
}) {
  const catalog = badgeCatalog ?? BADGES
  const myBadges = ranking.find(p => p.id === playerId)?.badges ?? []
  const [first, second, third] = ranking
  const rest   = ranking.slice(3)
  const myRank = ranking.findIndex(p => p.id === playerId) + 1
  const winnerList = ranking.filter(p => winners.includes(p.id))
  const iWon   = winners.includes(playerId)
  const tie    = winnerList.length > 1

  const title =
    !winnerList.length ? 'Nadie ganó esta vez'
    : iWon && tie      ? '¡Empate en la mesa!'
    : iWon             ? '¡Ganaste la mesa!'
    : tie              ? `Empate: ${winnerList.map(w => w.nickname).join(' y ')}`
    : `Gana ${winnerList[0].nickname}`

  // Orden visual: 2º · 1º · 3º
  const slots = [
    { p: second, place: 2, h: 'h-12', size: 56 },
    { p: first,  place: 1, h: 'h-20', size: 74 },
    { p: third,  place: 3, h: 'h-8',  size: 52 },
  ]

  return (
    <div className="min-h-screen bg-noir-900 px-4 py-8">
      <div className="max-w-sm mx-auto flex flex-col items-center">
        {iWon && <Confetti />}
        <p className="label-muted mb-2">♠ Fin de la partida ♠</p>
        <h2 className="font-serif text-3xl text-cream text-center leading-tight">{title}</h2>
        {endReason && (
          <p className="text-warm-600 text-xs font-sans mt-2 text-center">
            {REASON_TEXT[endReason]}{rounds ? ` · ${rounds} ${rounds === 1 ? 'vuelta' : 'vueltas'}` : ''}
          </p>
        )}
        {myRank > 0 && !iWon && (
          <p className="text-warm-400 text-sm font-sans mt-1">Quedaste en el puesto {myRank}</p>
        )}

        {/* Podio */}
        <div className="w-full flex items-end justify-center gap-2 mt-8 mb-6">
          {slots.map(({ p, place, h, size }) => (
            <div key={place} className="flex-1 flex flex-col items-center">
              {p ? (
                <>
                  {winners.includes(p.id) && <span className="text-gold-500 text-xl mb-1">♛</span>}
                  <div className={`rounded-full p-[3px] mb-2 ${p.status === 'eliminated' ? 'opacity-70' : ''}`}
                    style={{ background: winners.includes(p.id) ? '#c9a84c' : (winTier(p.wins)?.ring ?? '#2e2a25') }}>
                    <div className="rounded-full overflow-hidden" style={{ width: size, height: size }}>
                      <AvatarRenderer nickname={p.nickname} avatar={p.avatar} size={size} framing="bust" animated
                        mood={winners.includes(p.id) ? 'win' : p.status === 'eliminated' ? 'dizzy' : 'sad'} />
                    </div>
                  </div>
                  <span className={`text-xs font-sans truncate max-w-full px-1 ${
                    p.id === playerId ? 'text-gold-400' : 'text-cream'}`}>
                    {p.id === playerId ? 'Tú' : p.nickname}
                  </span>
                  <span className={`font-mono text-xs ${
                    p.status === 'eliminated' ? 'text-lose-text line-through' : 'text-warm-400'}`}>
                    {p.points} pts
                  </span>
                  <BadgeRow badges={p.badges} catalog={catalog} />
                  <div className="mb-1" />
                </>
              ) : <div className="h-16" />}
              <div className={`w-full ${h} rounded-t-[10px] border border-b-0 flex items-start justify-center pt-2
                               ${place === 1 ? 'bg-noir-700 border-gold-600' : 'bg-noir-800 border-noir-600'}`}>
                <span className={`font-serif text-xl ${place === 1 ? 'text-gold-500' : 'text-warm-600'}`}>{place}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Resto */}
        {rest.length > 0 && (
          <div className="card-noir p-3 w-full mb-6">
            {rest.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-noir-600 last:border-0">
                <span className="font-serif text-warm-600 w-5 text-center">{i + 4}</span>
                <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 28, height: 28 }}>
                  <AvatarRenderer nickname={p.nickname} avatar={p.avatar} size={28} />
                </div>
                <span className={`text-sm font-sans flex-1 truncate ${p.id === playerId ? 'text-gold-400' : 'text-cream'}`}>
                  {p.id === playerId ? 'Tú' : p.nickname}
                  <span className="ml-1.5">{(p.badges ?? []).map(b => catalog[b]?.icon).join('')}</span>
                </span>
                <span className={`font-mono text-xs ${p.status === 'eliminated' ? 'text-lose-text line-through' : 'text-warm-400'}`}>
                  {p.points} pts
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Mis logros */}
        <div className="card-noir p-4 w-full mb-4">
          <p className="label-muted mb-3">Tus logros en esta partida</p>
          {myBadges.length ? (
            <div className="grid grid-cols-2 gap-2">
              {myBadges.map(b => (
                <div key={b} className="flex items-center gap-2 rounded-btn border border-gold-600/50 bg-noir-800 px-2.5 py-2 animate-fade-in">
                  <span className="text-xl">{catalog[b]?.icon}</span>
                  <div className="min-w-0">
                    <p className="text-cream text-xs font-sans font-medium leading-tight">{catalog[b]?.label}</p>
                    <p className="text-warm-600 text-[10px] font-sans leading-tight">{catalog[b]?.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-warm-600 text-xs font-sans">Esta vez no hubo medallas. ¡La próxima!</p>
          )}
        </div>

        {/* Repaso privado */}
        <div className="card-noir p-4 w-full mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="label-muted">Tu repaso</p>
            <span className="text-warm-600 text-[10px] font-sans">🔒 Solo lo ves tú</span>
          </div>
          <ReviewList review={review} />
        </div>

        <div className="w-full flex flex-col gap-3">
          {onRooms && <button onClick={onRooms} className="btn-gold w-full">🎰 Jugar otra</button>}
          {onProfile && <button onClick={onProfile} className="btn-outline w-full">📊 Ver mis estadísticas</button>}
          <button onClick={onHome} className="btn-outline w-full">Volver al inicio</button>
        </div>
      </div>
    </div>
  )
}
