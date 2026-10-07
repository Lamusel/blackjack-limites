import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useSocket } from '@/hooks/useSocket'
import { useGame } from '@/hooks/useGame'
import { TOPICS, ALL_TOPIC_KEYS, MAX_PLAYERS } from '@/lib/constants'
import AvatarRenderer from '@/components/avatar/AvatarRenderer'
import { winTier } from '@/lib/avatar'
import SettingsButton from '@/components/ui/SettingsButton'

export default function Lobby() {
  const { code } = useParams()
  const location  = useLocation()
  const navigate  = useNavigate()
  const { emit, on } = useSocket()
  const { state, leaveRoom } = useGame()
  const password  = location.state?.password ?? ''
  const joined    = useRef(false)
  const [config, setConfig] = useState(null)   // { timeLimit, maxPlayers, topics }
  const [copied, setCopied] = useState(false)

  const [starting, setStarting] = useState(false)

  // 1) Unirse a la sala UNA sola vez
  useEffect(() => {
    if (!state.playerId || joined.current) return
    joined.current = true

    // El host ya está dentro: el server no lo duplica, solo devuelve la config
    emit('room:join', {
      code, password,
      nickname: state.nickname || 'Jugador',
      avatar:   state.avatar,
      profileId: state.profileId,
    }, ({ ok, error, config: cfg }) => {
      if (!ok) { alert(error ?? 'No se pudo unir'); leaveRoom(); navigate('/rooms'); return }
      if (cfg) setConfig(cfg)
    })
  }, [state.playerId])

  // 2) Escuchar el inicio de partida SIEMPRE (separado del join, para que
  //    el modo estricto de React no borre el listener y no lo vuelva a poner)
  useEffect(() => {
    const off = on('game:started', () => navigate(`/game/${code}`))
    return () => { off?.() }
  }, [code])

  const handleStart = () => {
    if (starting) return
    setStarting(true)
    emit('game:start', {}, (res) => {
      if (res && !res.ok) { alert(res.error); setStarting(false) }
    })
  }

  const handleLeave = () => {
    leaveRoom()
    navigate('/rooms')
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Fallback para navegadores sin clipboard (http en el celular)
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch { /* nada */ }
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  // Deduplicar jugadores por id por si acaso
  const players = state.players.filter(
    (p, i, arr) => arr.findIndex(x => x.id === p.id) === i
  )
  // El server marca al host con isHost; si no viene, se asume el primero
  const hostId     = (players.find(p => p.isHost) ?? players[0])?.id
  const maxPlayers = config?.maxPlayers ?? MAX_PLAYERS
  const emptySlots = Math.max(0, maxPlayers - players.length)
  const roomTopics = config?.topics ?? []
  const isMix      = roomTopics.length === ALL_TOPIC_KEYS.length

  return (
    <div className="min-h-screen bg-noir-900 px-4 py-4">
      <div className="max-w-sm mx-auto">

        {/* Barra superior */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={handleLeave} className="text-warm-600 hover:text-gold-500 transition-colors text-sm font-sans">
            ← Salir
          </button>
          <SettingsButton />
        </div>

        {/* Código */}
        <div className="text-center mb-6">
          <p className="label-muted mb-2">Código de sala</p>
          <button onClick={copyCode}
            className="group inline-flex items-center gap-3 rounded-btn px-4 py-2 hover:bg-noir-800 transition-colors"
            aria-label="Copiar código">
            <span className="font-mono text-4xl text-gold-500 font-bold tracking-widest">{code}</span>
            <span className="text-warm-600 group-hover:text-gold-500 text-lg transition-colors">{copied ? '✓' : '⧉'}</span>
          </button>
          <p className="text-warm-600 text-xs font-sans mt-1">
            {copied ? 'Código copiado' : 'Toca para copiar y compártelo con tu grupo'}
          </p>
        </div>

        {/* Jugadores */}
        <div className="card-noir p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="label-muted">Jugadores</p>
            <span className="font-mono text-xs text-warm-600">{players.length}/{maxPlayers}</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {players.map(p => {
              const isMe = p.id === state.playerId
              return (
                <div key={p.id} className="flex flex-col items-center gap-1.5 animate-fade-in">
                  <div className="relative">
                    <div className="rounded-full p-[3px]" title={winTier(p.wins)?.label}
                      style={{ background: winTier(p.wins)?.ring ?? (isMe ? '#c9a84c' : '#2e2a25') }}>
                      <div className={`rounded-full overflow-hidden ${p.away ? 'opacity-50 grayscale' : ''}`} style={{ width: 56, height: 56 }}>
                        <AvatarRenderer nickname={p.nickname} avatar={p.avatar} size={56} framing="bust" animated />
                      </div>
                    </div>
                    {p.away && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 rounded-pill bg-noir-700 border border-noir-500 text-[9px] font-sans text-warm-400 animate-pulse">
                        reconectando…
                      </span>
                    )}
                    {p.id === hostId && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-gold-500 text-sm" title="Host">♛</span>
                    )}
                  </div>
                  <span className={`text-xs font-sans truncate max-w-full ${isMe ? 'text-gold-400' : 'text-cream'}`}>
                    {isMe ? 'Tú' : p.nickname}
                  </span>
                </div>
              )
            })}

            {Array.from({ length: emptySlots }).map((_, i) => (
              <div key={`empty-${i}`} className="flex flex-col items-center gap-1.5">
                <div className="rounded-full border border-dashed border-noir-600 bg-noir-800
                                flex items-center justify-center text-warm-600 font-serif text-xl"
                  style={{ width: 60, height: 60 }}>
                  ?
                </div>
                <span className="text-xs font-sans text-warm-600">Libre</span>
              </div>
            ))}
          </div>
        </div>

        {/* Temas y tiempo */}
        {config && (
          <div className="card-noir p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="label-muted">{isMix ? 'Temas · Mix completo' : 'Temas'}</p>
              <span className="text-warm-600 text-xs font-sans">⏱ {config.timeLimit}s por turno</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TOPICS.filter(t => roomTopics.includes(t.key)).map(t => (
                <span key={t.key}
                  className="inline-flex items-center gap-1.5 rounded-btn border border-noir-600 bg-noir-800
                             px-2.5 py-1 text-xs font-sans text-cream">
                  <span className="font-serif text-gold-500">{t.icon}</span>
                  {t.short}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Acción */}
        {state.isHost ? (
          <button onClick={handleStart} disabled={players.length < 2 || starting}
            className="btn-gold w-full disabled:opacity-40 disabled:cursor-not-allowed">
            {players.length < 2 ? 'Esperando jugadores (mín. 2)'
              : starting ? 'Repartiendo cartas…'
              : '🎰 Iniciar partida'}
          </button>
        ) : (
          <p className="text-warm-600 text-sm font-sans text-center animate-pulse">
            Esperando que el host inicie la partida…
          </p>
        )}
      </div>
    </div>
  )
}
