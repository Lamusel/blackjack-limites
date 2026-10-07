// ─────────────────────────────────────────────────────────────
// Sesión del jugador en este navegador
//
// - pid: identidad FIJA de esta pestaña (sessionStorage). Sobrevive a
//   refrescar la página y a que el celular corte la conexión al cambiar
//   de app. Cada pestaña nueva es un jugador distinto.
// - Sala activa: para volver solo a tu sala/partida al reconectar.
// - Jugadores guardados por NOMBRE: cada nickname tiene su propio perfil
//   (estadísticas) y su propio avatar. Así no se mezclan las pruebas.
// ─────────────────────────────────────────────────────────────

const mem = {}   // respaldo si el navegador bloquea el almacenamiento (modo privado)

function ss(op, key, val) {
  try {
    if (op === 'get') return sessionStorage.getItem(key)
    if (op === 'set') return sessionStorage.setItem(key, val)
    return sessionStorage.removeItem(key)
  } catch {
    if (op === 'get') return mem[key] ?? null
    if (op === 'set') { mem[key] = val; return }
    delete mem[key]
  }
}
function ls(op, key, val) {
  try {
    if (op === 'get') return localStorage.getItem(key)
    if (op === 'set') return localStorage.setItem(key, val)
    return localStorage.removeItem(key)
  } catch {
    return op === 'get' ? null : undefined
  }
}
const readJSON = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback } catch { return fallback } }
const randomId = (prefix) => prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 10)

// ── Identidad de la pestaña ──────────────────────────────────
export function getPid() {
  let pid = ss('get', 'bl_pid')
  if (!pid || !/^[a-z0-9_-]{8,48}$/i.test(pid)) {
    pid = randomId('t_')
    ss('set', 'bl_pid', pid)
  }
  return pid
}

// ── Sala activa (para reconectar) ────────────────────────────
export function getActiveRoom() {
  return ss('get', 'bl_room')
}
export function setActiveRoom(code) {
  if (code) ss('set', 'bl_room', String(code).toUpperCase())
}
export function clearActiveRoom() {
  ss('del', 'bl_room')
}

// ── Nombre actual ────────────────────────────────────────────
// La pestaña recuerda su nombre; una pestaña nueva arranca con el último usado.
export function loadNickname() {
  return ss('get', 'bl_nick') ?? ls('get', 'bl_nickname') ?? ''
}
export function saveNickname(nick) {
  const n = String(nick ?? '').trim()
  ss('set', 'bl_nick', n)
  if (n) ls('set', 'bl_nickname', n)
}

// ── Jugadores guardados por nombre ───────────────────────────
// bl_players = { "joel": { profileId, avatar }, "prueba1": { ... } }
const keyOf = (nick) => String(nick ?? '').trim().toLowerCase()

function readPlayers() {
  const players = readJSON(ls('get', 'bl_players'), {})
  // Migración: antes había UN perfil y UN avatar para todo el navegador.
  // Se le asignan al último nombre usado, una sola vez.
  if (!ls('get', 'bl_players_migrated')) {
    const oldNick = keyOf(ls('get', 'bl_nickname'))
    const oldId = ls('get', 'bl_profile_id')
    const oldAvatar = readJSON(ls('get', 'bl_avatar'), null)
    if (oldNick && !players[oldNick] && (oldId || oldAvatar)) {
      players[oldNick] = { profileId: oldId ?? randomId('p_'), avatar: oldAvatar }
      ls('set', 'bl_players', JSON.stringify(players))
    }
    ls('set', 'bl_players_migrated', '1')
  }
  return players
}
function writePlayers(players) {
  ls('set', 'bl_players', JSON.stringify(players))
}

/** Perfil (estadísticas) de este nombre. Cada nombre nuevo tiene el suyo. */
export function profileIdFor(nick) {
  const k = keyOf(nick)
  if (!k) return null
  const players = readPlayers()
  if (!players[k]?.profileId) {
    players[k] = { ...players[k], profileId: randomId('p_') }
    writePlayers(players)
  }
  return players[k].profileId
}

/** Avatar guardado para este nombre (null = automático según el nombre). */
export function avatarFor(nick) {
  const k = keyOf(nick)
  if (!k) return null
  return readPlayers()[k]?.avatar ?? null
}

export function saveAvatarFor(nick, avatar) {
  const k = keyOf(nick)
  if (!k) return
  const players = readPlayers()
  players[k] = { ...players[k], profileId: players[k]?.profileId ?? randomId('p_'), avatar }
  writePlayers(players)
}

/** Nombres usados antes en este navegador (para elegir rápido) */
export function savedNicknames() {
  return Object.keys(readPlayers())
}
