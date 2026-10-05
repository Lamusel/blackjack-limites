import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'

const SocketContext = createContext(null)

// ─────────────────────────────────────────────────────────────
// URL del servidor de sockets
// - En producción: VITE_SOCKET_URL (ej. https://tu-backend.railway.app)
// - En desarrollo: mismo origen → Vite lo redirige al :3001 (proxy en vite.config.js).
//   Así funciona igual en el PC (localhost) y en el celular (192.168.x.x).
// ─────────────────────────────────────────────────────────────
function resolveSocketUrl() {
  const envUrl = import.meta.env.VITE_SOCKET_URL
  if (!envUrl) return undefined                       // mismo origen
  const pointsToLocalhost = /localhost|127\.0\.0\.1/.test(envUrl)
  const browsingLocalhost = /localhost|127\.0\.0\.1/.test(window.location.hostname)
  // Si el .env dice localhost pero estamos en el celular → usar el proxy
  if (pointsToLocalhost && !browsingLocalhost) return undefined
  return envUrl
}

// Un solo socket para toda la app (fuera de React → el modo estricto no crea dos)
let socketSingleton = null
function getSocket() {
  if (!socketSingleton) {
    socketSingleton = io(resolveSocketUrl(), {
      autoConnect:          false,
      reconnection:         true,
      reconnectionAttempts: 10,
      reconnectionDelay:    1000,
      transports:           ['websocket', 'polling'],
    })
  }
  return socketSingleton
}

export function SocketProvider({ children }) {
  const socket = getSocket()
  const [connected, setConnected] = useState(socket.connected)
  const [socketId,  setSocketId]  = useState(socket.id ?? null)

  useEffect(() => {
    const onConnect    = () => { setConnected(true);  setSocketId(socket.id) }
    const onDisconnect = () => { setConnected(false) }
    const onError      = (err) => console.warn('[socket] error de conexión:', err.message)

    socket.on('connect',       onConnect)
    socket.on('disconnect',    onDisconnect)
    socket.on('connect_error', onError)
    if (!socket.connected) socket.connect()
    else onConnect()

    return () => {
      socket.off('connect',       onConnect)
      socket.off('disconnect',    onDisconnect)
      socket.off('connect_error', onError)
      // No desconectamos: el socket vive mientras la pestaña esté abierta
    }
  }, [socket])

  // Funciones estables (no cambian entre renders)
  const emit = useCallback((event, data, cb) => {
    // socket.io guarda los emits en cola si aún no conecta
    if (cb) socket.emit(event, data, cb)
    else    socket.emit(event, data)
  }, [socket])

  const on = useCallback((event, handler) => {
    socket.on(event, handler)
    return () => socket.off(event, handler)
  }, [socket])

  const off = useCallback((event, handler) => {
    socket.off(event, handler)
  }, [socket])

  const value = useMemo(
    () => ({ socket, socketId, connected, emit, on, off }),
    [socket, socketId, connected, emit, on, off]
  )

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket debe usarse dentro de SocketProvider')
  return ctx
}