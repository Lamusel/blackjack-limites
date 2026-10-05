import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '@/hooks/useSocket'
import { useGame } from '@/hooks/useGame'
import { TIME_OPTIONS, TOPICS, ALL_TOPIC_KEYS } from '@/lib/constants'

export default function CreateRoom() {
  const navigate = useNavigate()
  const { emit } = useSocket()
  const { state } = useGame()
  const [password, setPassword]     = useState('')
  const [timeLimit, setTimeLimit]   = useState(90)
  const [maxPlayers, setMaxPlayers] = useState(6)
  const [topics, setTopics]         = useState(ALL_TOPIC_KEYS)   // por defecto: mix de todo
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const allSelected = topics.length === ALL_TOPIC_KEYS.length

  const toggleTopic = (key) => {
    setError('')
    setTopics(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const toggleAll = () => {
    setError('')
    setTopics(allSelected ? [] : ALL_TOPIC_KEYS)
  }

  const handleCreate = () => {
    if (!state.nickname?.trim()) return setError('Pon tu nickname primero en la pantalla principal')
    if (topics.length === 0)     return setError('Elige al menos un tema')
    setLoading(true)
    emit('room:create', {
      nickname: state.nickname,
      avatar:   state.avatar,
      profileId: state.profileId,
      password: password.trim() || null,
      config:   { timeLimit, maxPlayers, topics },
    }, ({ ok, code, error: err }) => {
      setLoading(false)
      if (!ok) return setError(err ?? 'Error creando sala')
      navigate(`/lobby/${code}`)
    })
  }

  return (
    <div className="min-h-screen bg-noir-900 px-4 py-8">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-warm-600 hover:text-gold-500 transition-colors">←</button>
          <h2 className="font-serif text-xl text-cream">Crear sala</h2>
        </div>

        <div className="flex flex-col gap-4">

          {/* Temas */}
          <div className="card-noir p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="label-muted">Temas de la partida</p>
              <button onClick={toggleAll}
                className="text-xs font-sans text-warm-600 hover:text-gold-500 transition-colors">
                {allSelected ? 'Quitar todos' : 'Mix (todos)'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {TOPICS.map(t => {
                const active = topics.includes(t.key)
                return (
                  <button key={t.key} onClick={() => toggleTopic(t.key)}
                    aria-pressed={active}
                    className={`flex items-center gap-2 rounded-btn px-3 py-2.5 text-left text-xs font-sans
                                border transition-colors ${
                      active
                        ? 'bg-noir-700 border-gold-600 text-cream'
                        : 'bg-noir-800 border-noir-600 text-warm-600 hover:border-noir-500'
                    }`}>
                    <span className={`font-serif text-base w-5 text-center flex-shrink-0 ${active ? 'text-gold-500' : 'text-warm-600'}`}>
                      {t.icon}
                    </span>
                    <span className="leading-tight">{t.label}</span>
                  </button>
                )
              })}
            </div>

            <p className="text-warm-600 text-xs font-sans mt-3">
              {topics.length === 0
                ? 'Elige al menos uno'
                : allSelected
                  ? 'Mix: salen ejercicios de todos los temas'
                  : `${topics.length} ${topics.length === 1 ? 'tema' : 'temas'} seleccionados`}
            </p>
          </div>

          {/* Tiempo */}
          <div className="card-noir p-4">
            <p className="label-muted mb-3">Tiempo por turno</p>
            <div className="flex gap-2">
              {TIME_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setTimeLimit(opt.value)}
                  className={`flex-1 rounded-btn py-2 text-sm font-sans transition-colors ${
                    timeLimit === opt.value
                      ? 'bg-gold-500 text-noir-900 font-medium'
                      : 'bg-noir-800 text-warm-400 border border-noir-600 hover:border-noir-500'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Jugadores */}
          <div className="card-noir p-4">
            <p className="label-muted mb-3">Máximo de jugadores</p>
            <div className="flex gap-2">
              {[2,3,4,5,6].map(n => (
                <button key={n} onClick={() => setMaxPlayers(n)}
                  className={`flex-1 rounded-btn py-2 text-sm font-sans transition-colors ${
                    maxPlayers === n
                      ? 'bg-gold-500 text-noir-900 font-medium'
                      : 'bg-noir-800 text-warm-400 border border-noir-600 hover:border-noir-500'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Contraseña */}
          <div className="card-noir p-4">
            <p className="label-muted mb-3">Contraseña (opcional)</p>
            <input type="text" placeholder="Dejar vacío = sala pública"
              value={password} onChange={e => setPassword(e.target.value)} maxLength={20}
              className="w-full bg-noir-800 border border-noir-600 rounded-btn px-4 py-3
                         text-cream font-sans text-sm placeholder-warm-600
                         focus:outline-none focus:border-gold-600 transition-colors" />
          </div>

          {error && <p className="text-lose-text text-xs font-sans px-1">{error}</p>}

          <button onClick={handleCreate} disabled={loading || topics.length === 0}
            className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creando...' : '🎰 Crear sala'}
          </button>
        </div>
      </div>
    </div>
  )
}
