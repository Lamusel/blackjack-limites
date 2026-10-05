// URL base del backend para las llamadas REST (/api/...)
// - Producción: VITE_API_URL o, si no está, VITE_SOCKET_URL (mismo servidor)
// - Desarrollo: mismo origen → Vite lo redirige al :3001 (proxy en vite.config.js)
function resolveApiBase() {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SOCKET_URL
  if (!envUrl) return ''
  const pointsToLocalhost = /localhost|127\.0\.0\.1/.test(envUrl)
  const browsingLocalhost = /localhost|127\.0\.0\.1/.test(window.location.hostname)
  if (pointsToLocalhost) return ''            // en local siempre por el proxy de Vite
  if (browsingLocalhost) return envUrl
  return envUrl.replace(/\/$/, '')
}

export async function api(path, options) {
  const res = await fetch(`${resolveApiBase()}${path}`, options)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `Error ${res.status}`)
    err.status = res.status
    throw err
  }
  return data
}
