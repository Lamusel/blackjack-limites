import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame } from '@/hooks/useGame'
import { api } from '@/lib/api'
import { BADGES } from '@/lib/badges'
import { TOPICS } from '@/lib/constants'
import AvatarRenderer from '@/components/avatar/AvatarRenderer'
import { winTier } from '@/lib/avatar'

const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0)

function StatTile({ label, value, sub, accent = false }) {
  return (
    <div className={`rounded-card border px-3 py-3 ${accent ? 'border-gold-600/70 bg-noir-700' : 'border-noir-600 bg-noir-800'}`}>
      <p className="label-muted">{label}</p>
      <p className={`font-serif text-3xl leading-none mt-1.5 ${accent ? 'text-gold-400' : 'text-cream'}`}>{value}</p>
      {sub && <p className="text-warm-600 text-[11px] font-sans mt-1">{sub}</p>}
    </div>
  )
}

function TopicBar({ label, icon, answered = 0, correct = 0 }) {
  const p = pct(correct, answered)
  const color = !answered ? 'bg-noir-600' : p >= 75 ? 'bg-win-text' : p >= 50 ? 'bg-gold-500' : 'bg-lose-text'
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-cream text-xs font-sans flex items-center gap-1.5">
          <span className="font-serif text-gold-500 w-4 text-center">{icon}</span>{label}
        </span>
        <span className="text-[11px] font-mono text-warm-400">
          {answered ? `${p}% · ${correct}/${answered}` : 'sin jugar'}
        </span>
      </div>
      <div className="h-2 rounded-full bg-noir-900 border border-noir-600 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${answered ? Math.max(p, 4) : 0}%` }} />
      </div>
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { state } = useGame()
  const [tab, setTab] = useState('me')
  const [profile, setProfile] = useState(null)
  const [top, setTop] = useState(null)
  const [status, setStatus] = useState('loading')   // loading | ok | empty | error

  useEffect(() => {
    if (!state.profileId) { setStatus('empty'); return }
    api(`/api/profiles/${state.profileId}`)
      .then(p => { setProfile(p); setStatus('ok') })
      .catch(err => setStatus(err.status === 404 ? 'empty' : 'error'))
  }, [state.profileId])

  useEffect(() => {
    if (tab !== 'top' || top) return
    api('/api/profiles/top').then(setTop).catch(() => setTop([]))
  }, [tab, top])

  const nickname = profile?.nickname || state.nickname || 'Jugador'
  const avatar = state.avatar ?? profile?.avatar ?? null

  // Tema más fuerte y más flojo (con al menos 2 respuestas)
  const topicEntries = TOPICS.map(t => ({ ...t, ...(profile?.topic_stats?.[t.key] ?? { answered: 0, correct: 0 }) }))
  const ranked = topicEntries.filter(t => t.answered >= 2).sort((a, b) => pct(b.correct, b.answered) - pct(a.correct, a.answered))
  const best = ranked[0], worst = ranked.length > 1 ? ranked[ranked.length - 1] : null

  return (
    <div className="min-h-[100dvh] bg-noir-900 px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate(-1)} className="text-warm-600 hover:text-gold-500 transition-colors">←</button>
          <h2 className="font-serif text-xl text-cream flex-1">Perfil</h2>
          <div className="flex rounded-pill border border-noir-600 bg-noir-800 p-0.5 text-xs font-sans">
            {[['me', 'Mis números'], ['top', 'Ranking']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`px-3 py-1.5 rounded-pill transition-colors ${tab === k ? 'bg-gold-500 text-noir-900 font-medium' : 'text-warm-400 hover:text-cream'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {tab === 'me' && (
          <>
            {/* Tarjeta del jugador */}
            <div className="card-noir p-4 flex items-center gap-4 mb-4 relative overflow-hidden">
              <div className="absolute -right-6 -top-6 text-[120px] leading-none text-gold-500/5 font-serif select-none">♠</div>
              <button onClick={() => navigate('/avatar')} className="rounded-full p-[3px] flex-shrink-0"
                style={{ background: winTier(profile?.wins)?.ring ?? 'linear-gradient(#e8d5a3,#a07a28)' }}>
                <div className="rounded-full overflow-hidden" style={{ width: 72, height: 72 }}>
                  <AvatarRenderer nickname={nickname} avatar={avatar} size={72} framing="bust" animated mood={profile?.wins ? 'smug' : null} />
                </div>
              </button>
              <div className="min-w-0 relative">
                <p className="font-serif text-2xl text-cream truncate">{nickname}</p>
                {winTier(profile?.wins) && (
                  <p className="text-[11px] font-sans font-medium" style={{ color: winTier(profile.wins).color }}>
                    ♦ {winTier(profile.wins).label}
                  </p>
                )}
                <p className="text-warm-600 text-xs font-sans">
                  {status === 'ok'
                    ? `${profile.games} ${profile.games === 1 ? 'partida' : 'partidas'} · mejor racha 🔥${profile.best_streak}`
                    : 'Sin partidas registradas todavía'}
                </p>
              </div>
            </div>

            {status === 'loading' && <p className="text-warm-600 text-sm font-sans text-center py-10 animate-pulse">Cargando estadísticas…</p>}

            {status === 'error' && (
              <div className="card-noir p-6 text-center">
                <p className="text-cream font-sans text-sm mb-1">No pude cargar tus estadísticas</p>
                <p className="text-warm-600 text-xs font-sans">Revisa que el servidor esté corriendo y que exista la tabla de perfiles en Supabase.</p>
              </div>
            )}

            {status === 'empty' && (
              <div className="card-noir p-6 text-center">
                <p className="text-3xl mb-2">🃏</p>
                <p className="text-cream font-sans text-sm mb-1">Aún no tienes partidas</p>
                <p className="text-warm-600 text-xs font-sans mb-4">Juega una y aquí verás tus aciertos por tema, rachas y medallas.</p>
                <button onClick={() => navigate('/rooms')} className="btn-gold">Buscar mesa</button>
              </div>
            )}

            {status === 'ok' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                {/* Números grandes */}
                <div className="grid grid-cols-2 gap-2">
                  <StatTile label="Victorias" value={profile.wins} sub={`${pct(profile.wins, profile.games)}% de ${profile.games} partidas`} accent />
                  <StatTile label="Aciertos" value={`${pct(profile.correct, profile.answered)}%`} sub={`${profile.correct} de ${profile.answered} cartas`} />
                  <StatTile label="21 exactos" value={profile.twentyones} sub="Veces en el número mágico" />
                  <StatTile label="Se pasó" value={profile.busts} sub="Veces por encima de 21" />
                </div>

                {/* Fuerte / flojo */}
                {(best || worst) && (
                  <div className="grid grid-cols-2 gap-2">
                    {best && (
                      <div className="rounded-card border border-win/80 bg-noir-800 px-3 py-2.5">
                        <p className="label-muted">Tu fuerte</p>
                        <p className="text-win-text text-sm font-sans mt-1">{best.label}</p>
                      </div>
                    )}
                    {worst && worst.key !== best?.key && (
                      <div className="rounded-card border border-lose/80 bg-noir-800 px-3 py-2.5">
                        <p className="label-muted">Para repasar</p>
                        <p className="text-lose-text text-sm font-sans mt-1">{worst.label}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Por tema */}
                <div className="card-noir p-4">
                  <p className="label-muted mb-3">Aciertos por tema</p>
                  <div className="flex flex-col gap-3">
                    {topicEntries.map(t => <TopicBar key={t.key} label={t.label} icon={t.icon} answered={t.answered} correct={t.correct} />)}
                  </div>
                </div>

                {/* Medallas */}
                <div className="card-noir p-4">
                  <p className="label-muted mb-3">Medallas</p>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(BADGES).map(([key, b]) => {
                      const count = profile.badges?.[key] ?? 0
                      return (
                        <div key={key} title={b.desc}
                          className={`relative flex flex-col items-center gap-1 rounded-btn border px-1 py-2 text-center
                                      ${count ? 'border-gold-600/60 bg-noir-800' : 'border-noir-600 bg-noir-900 opacity-40 grayscale'}`}>
                          <span className="text-2xl leading-none">{b.icon}</span>
                          <span className="text-[10px] font-sans text-cream leading-tight">{b.label}</span>
                          {count > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold-500 text-noir-900
                                             text-[10px] font-mono font-bold flex items-center justify-center">×{count}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'top' && (
          <div className="card-noir p-3 animate-fade-in">
            {!top && <p className="text-warm-600 text-sm font-sans text-center py-8 animate-pulse">Cargando ranking…</p>}
            {top && !top.length && <p className="text-warm-600 text-sm font-sans text-center py-8">Aún no hay partidas registradas.</p>}
            {top?.map((p, i) => (
              <div key={p.profile_id}
                className={`flex items-center gap-3 py-2.5 px-2 rounded-btn ${p.profile_id === state.profileId ? 'bg-noir-800 border border-gold-600/50' : ''}`}>
                <span className={`font-serif w-6 text-center ${i === 0 ? 'text-gold-400 text-lg' : 'text-warm-600'}`}>
                  {i === 0 ? '♛' : i + 1}
                </span>
                <div className="rounded-full overflow-hidden flex-shrink-0" style={{ width: 34, height: 34 }}>
                  <AvatarRenderer nickname={p.nickname} avatar={p.avatar} size={34} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-cream text-sm font-sans truncate">{p.nickname}</p>
                  <p className="text-warm-600 text-[11px] font-sans">{pct(p.correct, p.answered)}% aciertos · 🔥{p.best_streak}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-gold-400 text-lg leading-none">{p.wins}</p>
                  <p className="text-warm-600 text-[10px] font-sans">victorias</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
