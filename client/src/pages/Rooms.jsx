import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '@/hooks/useSocket'
import { useGame } from '@/hooks/useGame'
import { TOPICS, ALL_TOPIC_KEYS } from '@/lib/constants'
import AvatarRenderer from '@/components/avatar/AvatarRenderer'
import Modal from '@/components/ui/Modal'

// Avatares encimados de los jugadores de una sala
function SeatStack({ seats = [], max }) {
  const shown = seats.slice(0, 5)
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2.5">
        {shown.map((s, i) => (
          <div key={i} className="rounded-full overflow-hidden border-2 border-noir-700" style={{ width: 30, height: 30, zIndex: 10 - i }}>
            <AvatarRenderer nickname={s.nickname} avatar={s.avatar} size={26} />
          </div>
        ))}
        {Array.from({ length: Math.max(0, Math.min(max, 5) - shown.length) }).map((_, i) => (
          <div key={`e${i}`} className="rounded-full border-2 border-dashed border-noir-500 bg-noir-800" style={{ width: 30, height: 30 }} />
        ))}
      </div>
    </div>
  )
}

function RoomCard({ room, onJoin }) {
  const playing = room.phase !== 'lobby'
  const full = room.players >= room.maxPlayers
  const isMix = room.topics?.length === ALL_TOPIC_KEYS.length
  const disabled = playing || full

  return (
    <div className={`card-noir p-4 transition-colors ${disabled ? 'opacity-60' : 'hover:border-noir-500'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-gold-500 text-base font-medium tracking-wider">{room.code}</span>
            {room.hasPassword && <span className="text-warm-600 text-xs" title="Con contraseña">🔒</span>}
            {playing && (
              <span className="px-2 py-0.5 rounded-pill bg-stand text-stand-text text-[10px] font-sans tracking-wider">EN JUEGO</span>
            )}
          </div>
          <p className="text-warm-600 text-xs font-sans mt-0.5 truncate">
            Mesa de <span className="text-cream">{room.host}</span> · ⏱ {room.timeLimit}s
          </p>
        </div>
        <button onClick={() => onJoin(room)} disabled={disabled}
          className="btn-gold !px-4 !py-2 text-sm flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed">
          {playing ? 'Jugando' : full ? 'Llena' : 'Unirse'}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 mt-3">
        <SeatStack seats={room.seats} max={room.maxPlayers} />
        <span className="font-mono text-xs text-warm-400">{room.players}/{room.maxPlayers}</span>
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {isMix ? (
          <span className="inline-flex items-center gap-1 rounded-pill border border-gold-600/50 bg-noir-800 px-2 py-0.5 text-[11px] font-sans text-gold-400">
            ✦ Mix completo
          </span>
        ) : TOPICS.filter(t => room.topics?.includes(t.key)).map(t => (
          <span key={t.key} className="inline-flex items-center gap-1 rounded-pill border border-noir-600 bg-noir-800 px-2 py-0.5 text-[11px] font-sans text-cream">
            <span className="font-serif text-gold-500">{t.icon}</span>{t.short}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Rooms() {
  const navigate = useNavigate()
  const { emit, on, connected } = useSocket()
  const { state } = useGame()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [modal, setModal] = useState(null)         // { code } sala que pide contraseña
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [checking, setChecking] = useState(false)
  const refreshTimer = useRef(null)

  const fetchRooms = useCallback(() => {
    emit('room:list', {}, ({ rooms: list } = {}) => {
      setRooms(list ?? [])
      setLoading(false)
    })
  }, [emit])

  // Carga inicial + lista en vivo (el server avisa cada vez que algo cambia)
  useEffect(() => {
    fetchRooms()
    const off = on('rooms:changed', () => {
      clearTimeout(refreshTimer.current)
      refreshTimer.current = setTimeout(fetchRooms, 150)
    })
    const poll = setInterval(fetchRooms, 15000)   // respaldo por si se pierde un aviso
    return () => { off?.(); clearInterval(poll); clearTimeout(refreshTimer.current) }
  }, [fetchRooms, on])

  useEffect(() => { if (connected) fetchRooms() }, [connected, fetchRooms])

  // Verifica en el server antes de entrar (así el error sale aquí y no en el lobby)
  const tryJoin = (code, pw = '') => {
    setChecking(true)
    emit('room:check', { code, password: pw }, (res = {}) => {
      setChecking(false)
      if (res.ok) {
        setModal(null); setPassword('')
        navigate(`/lobby/${res.code}`, { state: { password: pw } })
        return
      }
      if (res.needsPassword) {
        setModal({ code })
        setPwError(pw ? res.error : '')
        return
      }
      if (modal) setPwError(res.error)
      else setCodeError(res.error ?? 'No se pudo entrar')
      fetchRooms()
    })
  }

  const joinByCode = (e) => {
    e.preventDefault()
    const code = codeInput.trim().toUpperCase()
    if (code.length !== 6) return setCodeError('El código tiene 6 caracteres')
    setCodeError('')
    tryJoin(code)
  }

  const waiting = rooms.filter(r => r.phase === 'lobby')
  const playing = rooms.filter(r => r.phase !== 'lobby')

  return (
    <div className="min-h-[100dvh] bg-noir-900 px-4 py-6">
      <div className="max-w-md mx-auto">
        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate('/')} className="text-warm-600 hover:text-gold-500 transition-colors">←</button>
          <div className="flex-1">
            <h2 className="font-serif text-xl text-cream leading-tight">Salas</h2>
            <p className="text-warm-600 text-[11px] font-sans flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-win-text animate-pulse' : 'bg-lose-text'}`} />
              {connected ? 'En vivo' : 'Conectando…'}
            </p>
          </div>
          <button onClick={fetchRooms} aria-label="Actualizar"
            className="w-9 h-9 rounded-full text-warm-600 hover:text-gold-500 hover:bg-noir-800 transition-colors">↻</button>
          <button onClick={() => navigate('/rooms/new')}
            className="text-xs text-gold-500 border border-gold-600 rounded-btn px-3 py-2 hover:bg-noir-700 transition-colors font-sans">
            + Crear
          </button>
        </div>

        {/* Sin nombre */}
        {!state.nickname && (
          <div className="card-noir border-stand-text/40 p-3 mb-4 flex items-center gap-3">
            <span className="text-lg">✍️</span>
            <p className="flex-1 text-xs font-sans text-stand-text">Primero escribe tu nombre para sentarte en una mesa.</p>
            <button onClick={() => navigate('/')} className="btn-outline !px-3 !py-1.5 text-xs">Ir</button>
          </div>
        )}

        {/* Unirse con código */}
        <form onSubmit={joinByCode} className="card-noir p-3 mb-5">
          <p className="label-muted mb-2">¿Te pasaron un código?</p>
          <div className="flex gap-2">
            <input value={codeInput} maxLength={6} placeholder="ABC123"
              onChange={e => { setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setCodeError('') }}
              className="flex-1 min-w-0 bg-noir-800 border border-noir-600 rounded-btn px-3 py-2.5
                         font-mono text-lg tracking-[0.3em] text-gold-400 placeholder-warm-600/50 uppercase
                         focus:outline-none focus:border-gold-600 transition-colors" />
            <button type="submit" disabled={checking || !state.nickname}
              className="btn-gold !px-4 !py-2 text-sm disabled:opacity-40">Entrar</button>
          </div>
          {codeError && <p className="text-lose-text text-xs font-sans mt-2">{codeError}</p>}
        </form>

        {/* Lista */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1].map(i => <div key={i} className="card-noir h-32 animate-pulse" />)}
          </div>
        ) : rooms.length === 0 ? (
          <div className="card-noir p-8 text-center">
            <p className="text-4xl mb-3">♠</p>
            <p className="text-cream font-sans text-sm mb-1">No hay mesas abiertas</p>
            <p className="text-warm-600 font-sans text-xs mb-5">Crea una y comparte el código con tu grupo.</p>
            <button onClick={() => navigate('/rooms/new')} className="btn-gold">Crear la primera</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {waiting.length > 0 && <p className="label-muted">Esperando jugadores · {waiting.length}</p>}
            {waiting.map(room => (
              <RoomCard key={room.code} room={room}
                onJoin={(r) => (state.nickname ? tryJoin(r.code) : navigate('/'))} />
            ))}
            {playing.length > 0 && <p className="label-muted mt-3">En juego · {playing.length}</p>}
            {playing.map(room => <RoomCard key={room.code} room={room} onJoin={() => {}} />)}
          </div>
        )}
      </div>

      {/* Contraseña */}
      <Modal open={!!modal} onClose={() => { setModal(null); setPassword(''); setPwError('') }} title="Mesa privada">
        <form onSubmit={(e) => { e.preventDefault(); tryJoin(modal.code, password) }}>
          <p className="text-warm-600 text-xs font-sans mb-3">
            La sala <span className="font-mono text-gold-400">{modal?.code}</span> tiene contraseña.
          </p>
          <input type="text" autoFocus placeholder="Contraseña…" value={password}
            onChange={e => { setPassword(e.target.value); setPwError('') }}
            className={`w-full bg-noir-800 border rounded-btn px-4 py-3 text-cream font-sans text-sm placeholder-warm-600
                       focus:outline-none focus:border-gold-600 transition-colors ${pwError ? 'border-lose-text' : 'border-noir-600'}`} />
          {pwError && <p className="text-lose-text text-xs font-sans mt-2">{pwError}</p>}
          <button type="submit" disabled={checking || !password}
            className="btn-gold w-full mt-4 disabled:opacity-40">{checking ? 'Verificando…' : 'Entrar'}</button>
        </form>
      </Modal>
    </div>
  )
}
