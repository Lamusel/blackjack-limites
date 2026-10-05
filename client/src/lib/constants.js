export const TARGET_SCORE = 21

export const MIN_PLAYERS  = 2
export const MAX_PLAYERS  = 6

export const TIME_OPTIONS = [
  { value: 60,  label: '1 minuto' },
  { value: 90,  label: '1:30 min' },
  { value: 120, label: '2 minutos' },
]

// Deben coincidir con server/lib/topics.js y con supabase/schema.sql
export const TOPICS = [
  { key: 'limites',               label: 'Límites',              short: 'Límites',     icon: '→' },
  { key: 'continuidad',           label: 'Continuidad',          short: 'Continuidad', icon: '∿' },
  { key: 'derivadas_basicas',     label: 'Derivación directa',   short: 'Derivadas',   icon: "f'" },
  { key: 'regla_cadena',          label: 'Regla de la cadena',   short: 'Cadena',      icon: '∘' },
  { key: 'derivadas_parciales',   label: 'Derivadas parciales',  short: 'Parciales',   icon: '∂' },
  { key: 'aplicaciones_derivada', label: 'Aplicaciones',         short: 'Aplicaciones',icon: '↗' },
]

export const ALL_TOPIC_KEYS = TOPICS.map(t => t.key)

export const topicLabel = (key) => TOPICS.find(t => t.key === key)?.label ?? key

export const PLAYER_STATUS = {
  ACTIVE:     'active',
  STANDING:   'standing',
  ELIMINATED: 'eliminated',
}

export const GAME_PHASE = {
  IDLE:     'idle',
  LOBBY:    'lobby',
  PLAYING:  'playing',
  RESULT:   'result',
  FINISHED: 'finished',
}

export const SOCKET_EVENTS = {
  // Cliente → Servidor
  ROOM_CREATE:    'room:create',
  ROOM_JOIN:      'room:join',
  ROOM_LEAVE:     'room:leave',
  ROOM_LIST:      'room:list',
  GAME_START:     'game:start',
  PLAYER_ACTION:  'game:action',   // { type: 'draw' | 'stand' }
  SUBMIT_ANSWER:  'game:answer',   // { exerciseId, answer }

  // Servidor → Cliente
  ROOM_JOINED:        'room:joined',          // { code, config: { timeLimit, maxPlayers, topics }, isHost }
  ROOM_PLAYERS_UPDATE:'room:players_update',
  ROOM_HOST_ASSIGNED: 'room:host_assigned',
  ROOM_ERROR:         'room:error',
  GAME_STARTED:       'game:started',
  TURN_START:         'game:turn_start',
  TURN_RESULT:        'game:turn_result',
  POINTS_UPDATE:      'game:points_update',
  TURN_END:           'game:turn_end',
  GAME_FINISHED:      'game:finished',
}