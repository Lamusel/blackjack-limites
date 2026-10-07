import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGame } from '@/hooks/useGame'
import { useSocket } from '@/hooks/useSocket'

// ─────────────────────────────────────────────────────────────
// 1) Al reconectar (refrescaste o volviste a la app), te lleva de vuelta
//    a tu sala o a tu partida.
// 2) Muestra un aviso "Reconectando…" si se cae la conexión.
// ─────────────────────────────────────────────────────────────
export default function SessionKeeper() {
  const { state } = useGame()
  const { connected } = useSocket()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const r = state.resume
    if (!r || r.status !== 'ok') return
    const target = r.phase === 'lobby' ? `/lobby/${r.code}` : `/game/${r.code}`
    // Solo redirigimos desde pantallas de "entrada" (no te sacamos del estudio o del perfil)
    const auto = pathname === '/' || pathname.startsWith('/game') || pathname.startsWith('/lobby') || pathname.startsWith('/rooms')
    if (auto && pathname !== target) navigate(target, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.resume?.at])

  // Aviso de conexión (con un pequeño retraso para no parpadear)
  const [showBanner, setShowBanner] = useState(false)
  useEffect(() => {
    if (connected) { setShowBanner(false); return }
    const t = setTimeout(() => setShowBanner(true), 1200)
    return () => clearTimeout(t)
  }, [connected])

  const inRoom = pathname.startsWith('/game') || pathname.startsWith('/lobby')
  if (!showBanner && !(state.resume?.status === 'pending' && inRoom)) return null

  return (
    <div className="fixed top-2 inset-x-0 z-[60] flex justify-center pointer-events-none px-4">
      <div className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-pill border border-gold-600/60
                      bg-noir-900/95 backdrop-blur shadow-[0_8px_24px_rgba(0,0,0,0.6)] animate-fade-in">
        <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
        <span className="text-xs font-sans text-cream">
          {showBanner ? 'Reconectando… no cierres la página' : 'Volviendo a tu mesa…'}
        </span>
      </div>
    </div>
  )
}
