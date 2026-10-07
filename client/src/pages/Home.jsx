import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '@/hooks/useSettings'
import { useGame } from '@/hooks/useGame'
import { useAudio } from '@/hooks/useAudio'
import AvatarRenderer from '@/components/avatar/AvatarRenderer'
import SettingsButton from '@/components/ui/SettingsButton'
import { avatarFor, savedNicknames } from '@/lib/session'

export default function Home() {
  const navigate = useNavigate()
  const { settings, toggle } = useSettings()
  const { state, dispatch }  = useGame()
  const [nick, setNick] = useState(state.nickname || '')
  const [needNick, setNeedNick] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  // Cada nombre es un jugador distinto (su propio avatar y sus estadísticas)
  const typed = nick.trim()
  const previewAvatar = typed.toLowerCase() === (state.nickname || '').toLowerCase() ? state.avatar : avatarFor(typed)
  const others = savedNicknames().filter(n => n !== typed.toLowerCase())

  // Arranca la música de fondo (o la deja sonando si ya venía de otra página)
  useAudio()

  const saveNick = (value = nick) => {
    const trimmed = String(value).trim()
    if (trimmed && trimmed !== state.nickname) dispatch({ type: 'SET_PLAYER_INFO', payload: { nickname: trimmed } })
    return trimmed
  }

  const pickSaved = (name) => {
    setNick(name)
    saveNick(name)
    setShowSaved(false)
    setNeedNick(false)
  }

  const newPlayer = () => {
    setNick('')
    dispatch({ type: 'SET_PLAYER_INFO', payload: { nickname: '', avatar: null, profileId: null } })
    setShowSaved(false)
  }

  // Para entrar a salas hace falta nombre
  const go = (path, requireNick = true) => {
    const trimmed = saveNick()
    if (requireNick && !trimmed) { setNeedNick(true); return }
    navigate(path)
  }

  return (
    <div className="min-h-[100dvh] bg-noir-900 flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-5">

        {/* Top bar */}
        <div className="w-full flex justify-between items-center">
          <button onClick={() => navigate('/how-to-play')}
            className="text-warm-600 hover:text-gold-500 transition-colors text-sm font-sans">
            ¿Cómo jugar?
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => toggle('music')} aria-label={settings.music ? 'Silenciar música' : 'Activar música'}
              className="w-9 h-9 rounded-full flex items-center justify-center text-warm-600
                         hover:text-gold-500 hover:bg-noir-800 transition-colors">
              {settings.music ? '🔊' : '🔇'}
            </button>
            <SettingsButton />
          </div>
        </div>

        {/* Logo */}
        <div className="text-center">
          <div className="text-warm-600 text-xs tracking-widest uppercase font-sans mb-3">♠ ♥ ♦ ♣</div>
          <h1 className="font-serif text-4xl text-cream leading-tight">Blackjack</h1>
          <h1 className="font-serif text-2xl italic text-gold-500 leading-tight">de Cálculo</h1>
          <p className="text-warm-600 text-xs tracking-widest uppercase font-sans mt-2">
            Apoyo de estudio · Corte 2
          </p>
        </div>

        <div className="w-32 h-px bg-noir-600"/>

        {/* Personaje + nombre */}
        <div className="w-full card-noir p-4">
          <div className="flex items-center gap-4">
            <button onClick={() => go('/avatar')} aria-label="Personalizar avatar"
              className="relative flex-shrink-0 group">
              <div className="rounded-full p-[3px] bg-gradient-to-b from-gold-400 to-gold-600 shadow-glow-gold">
                <div className="rounded-full overflow-hidden" style={{ width: 76, height: 76 }}>
                  <AvatarRenderer nickname={typed || 'Jugador'} avatar={previewAvatar} size={76} />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-noir-900 border border-gold-500
                               flex items-center justify-center text-gold-400 text-xs
                               group-hover:bg-gold-500 group-hover:text-noir-900 transition-colors">✎</span>
            </button>

            <div className="flex-1 min-w-0">
              <p className="label-muted mb-1.5">Tu nombre en la mesa</p>
              <input
                type="text"
                placeholder="Escribe tu nickname..."
                maxLength={16}
                value={nick}
                onChange={e => { setNick(e.target.value); setNeedNick(false) }}
                onBlur={saveNick}
                className={`w-full bg-noir-800 border rounded-btn px-3 py-2
                           text-cream font-sans text-sm placeholder-warm-600
                           focus:outline-none focus:border-gold-600 transition-colors
                           ${needNick ? 'border-lose-text' : 'border-noir-600'}`}
              />
              <p className={`text-xs mt-1 font-sans ${needNick ? 'text-lose-text' : 'text-warm-600'}`}>
                {needNick ? 'Primero escribe tu nombre' : 'Cada nombre tiene su personaje y sus estadísticas'}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {others.length > 0 && (
                  <button onClick={() => setShowSaved(v => !v)} className="text-[11px] font-sans text-gold-500 hover:text-gold-400">
                    ⇄ Cambiar de jugador
                  </button>
                )}
                {typed && (
                  <button onClick={newPlayer} className="text-[11px] font-sans text-warm-600 hover:text-gold-400">
                    + Nuevo
                  </button>
                )}
              </div>
            </div>
          </div>

          {showSaved && others.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 animate-fade-in">
              {others.map(n => (
                <button key={n} onClick={() => pickSaved(n)}
                  className="flex items-center gap-1.5 pl-1 pr-2.5 py-1 rounded-pill border border-noir-600 bg-noir-800 hover:border-gold-600">
                  <span className="rounded-full overflow-hidden" style={{ width: 22, height: 22 }}>
                    <AvatarRenderer nickname={n} avatar={avatarFor(n)} size={22} />
                  </span>
                  <span className="text-xs font-sans text-cream">{n}</span>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => go('/avatar')}
              className="h-10 rounded-btn border border-noir-500 text-warm-400 hover:border-gold-600 hover:text-gold-400
                         font-sans text-sm transition-colors">
              🎩 Personaje
            </button>
            <button onClick={() => go('/profile')}
              className="h-10 rounded-btn border border-noir-500 text-warm-400 hover:border-gold-600 hover:text-gold-400
                         font-sans text-sm transition-colors">
              📊 Mi perfil
            </button>
          </div>
        </div>

        {/* Dificultades */}
        <div className="flex gap-2 flex-wrap justify-center">
          <span className="badge-difficulty badge-easy">🟢 2–3</span>
          <span className="badge-difficulty badge-medium">🔵 4–5</span>
          <span className="badge-difficulty badge-hard">🟠 6–7</span>
          <span className="badge-difficulty badge-advanced">🔴 8–9</span>
        </div>

        {/* Botones */}
        <div className="w-full flex flex-col gap-3">
          <button onClick={() => go('/rooms')} className="btn-gold w-full text-center">
            🎮 Ver salas disponibles
          </button>
          <button onClick={() => go('/rooms/new')} className="btn-outline w-full text-center">
            ➕ Crear sala
          </button>
        </div>

        <p className="text-warm-600 text-xs font-sans tracking-widest uppercase">
          Alcanza 21 · Resuelve · Gana
        </p>
      </div>
    </div>
  )
}
