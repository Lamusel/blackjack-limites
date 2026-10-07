import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { useSocket } from './useSocket'
import {
  getPid, getActiveRoom, setActiveRoom, clearActiveRoom,
  loadNickname, saveNickname, profileIdFor, avatarFor,
} from '@/lib/session'

const GameContext = createContext(null)

// ── Estado inicial ──────────────────────────────────────────
const INITIAL_STATE = {
  // sala
  roomCode:    null,
  roomConfig:  { timeLimit: 90, maxPlayers: 6, topics: [] },
  isHost:      false,

  // jugador local (playerId = pid fijo de esta pestaña: sobrevive a refrescar)
  playerId:    null,
  nickname:    '',
  avatar:      null,   // config del estudio (null = automático por nickname)
  profileId:   null,   // id persistente para estadísticas

  // jugadores en la mesa
  players: [],   // { id, nickname, avatar, points, status, turnOrder, isHost }

  // turno actual
  currentTurn:    null,    // playerId de quien tiene el turno
  myTurn:         false,
  exercise:       null,    // { id, topic, difficulty, points, question, options } — SIN respuesta
  timeRemaining:  0,
  turnTotal:      90,      // duración total del turno (para el timer circular)
  cardDrawn:      false,   // el jugador del turno ya pidió carta
  forecast:       null,    // pronóstico del turno: { cards: [{ value, p }], ace }
  card:           null,    // carta sacada (pública): { value, isAce, difficulty, penalty }
  aceChoice:      null,    // { points, timeLimit } cuando debo elegir 1 u 11
  removedOptions: [],      // opciones quitadas por el 50/50 (solo en mi turno)
  fiftyUsedBy:    [],      // ids de quienes ya gastaron su 50/50

  // fase
  phase: 'idle',  // 'idle' | 'lobby' | 'playing' | 'result' | 'finished'

  // resultado del turno (privado al jugador local)
  lastResult: null, // { correct, pointsDelta, explanation, correctAnswer, newPoints }

  // vuelta actual (1, 2, 3…)
  round: 1,

  // fin de partida
  finalRanking: [],
  winner:       null,
  winners:      [],     // ids de los ganadores (puede haber empate)
  endReason:    null,   // 'twentyone' | 'all_passed' | 'no_players'
  badgeCatalog: null,   // { clave: { icon, label, desc } } (viene del server)
  review:       [],   // MI repaso privado: ejercicios que respondí

  // reconexión: { status: 'pending' | 'ok' | 'failed' | 'none', phase, code, at }
  resume: null,
}

// ── Reducer ─────────────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {

    case 'SET_PLAYER_INFO':
      return { ...state, ...action.payload }

    case 'RESUME_STATUS':
      return { ...state, resume: { ...action.payload, at: Date.now() } }

    // ── Volví a la sala de espera ──
    case 'RESUME_LOBBY':
      return {
        ...state,
        roomCode:   action.payload.code,
        roomConfig: action.payload.config ?? state.roomConfig,
        isHost:     !!action.payload.isHost,
        players:    action.payload.players ?? state.players,
        phase:      'lobby',
      }

    // ── Volví a una partida en curso: se restaura TODO ──
    case 'RESUME_GAME': {
      const sn = action.payload.snapshot
      return {
        ...state,
        roomCode:       action.payload.code,
        roomConfig:     action.payload.config ?? state.roomConfig,
        isHost:         !!action.payload.isHost,
        phase:          'playing',
        players:        sn.players,
        round:          sn.round,
        currentTurn:    sn.currentTurn,
        myTurn:         sn.currentTurn === state.playerId,
        turnTotal:      sn.timeLimit,
        timeRemaining:  sn.timeRemaining,
        forecast:       sn.forecast,
        cardDrawn:      sn.cardDrawn,
        card:           sn.card,
        exercise:       sn.exercise,
        removedOptions: sn.removedOptions ?? [],
        aceChoice:      sn.aceChoice,
        fiftyUsedBy:    sn.fiftyUsedBy ?? [],
        lastResult:     null,
        finalRanking:   [],
        winners:        [],
      }
    }

    // ── La partida terminó mientras no estaba: ver el podio igual ──
    case 'RESUME_FINISHED': {
      const f = action.payload.finished
      return {
        ...state,
        roomCode:     action.payload.code,
        roomConfig:   action.payload.config ?? state.roomConfig,
        isHost:       !!action.payload.isHost,
        players:      action.payload.players ?? state.players,
        phase:        'finished',
        finalRanking: f.ranking ?? [],
        winner:       f.winner ?? null,
        winners:      f.winners ?? [],
        endReason:    f.reason ?? null,
        badgeCatalog: f.badges ?? state.badgeCatalog,
        round:        f.rounds ?? state.round,
        review:       action.payload.review ?? [],
        myTurn:       false,
        exercise:     null,
      }
    }

    case 'JOIN_ROOM':
      return {
        ...state,
        roomCode:     action.payload.code,
        roomConfig:   action.payload.config ?? state.roomConfig,
        isHost:       !!action.payload.isHost,
        phase:        'lobby',
        finalRanking: [],
        winner:       null,
        review:       [],
        lastResult:   null,
        fiftyUsedBy:  [],
      }

    case 'HOST_ASSIGNED':
      return { ...state, isHost: true }

    case 'PLAYERS_UPDATE':
      return { ...state, players: action.payload }

    case 'GAME_STARTED':
      return {
        ...state,
        phase:        'playing',
        players:      action.payload.players,
        round:        1,
        finalRanking: [],
        winner:       null,
        winners:      [],
        endReason:    null,
        review:       [],
        lastResult:   null,
        fiftyUsedBy:  [],
        currentTurn:  null,
        myTurn:       false,
        exercise:     null,
      }

    case 'TURN_START':
      return {
        ...state,
        phase:          'playing',
        currentTurn:    action.payload.playerId,
        myTurn:         action.payload.playerId === state.playerId,
        exercise:       action.payload.exercise ?? null,
        timeRemaining:  action.payload.timeLimit,
        turnTotal:      action.payload.timeLimit,
        round:          action.payload.round ?? state.round,
        forecast:       action.payload.forecast ?? state.forecast,
        card:           null,
        aceChoice:      null,
        cardDrawn:      false,
        removedOptions: [],
        lastResult:     null,   // ← el resultado del turno anterior NO se arrastra
      }

    case 'EXERCISE':
      return { ...state, exercise: action.payload.exercise, card: action.payload.card ?? state.card }

    case 'ACE_CHOICE':
      return { ...state, aceChoice: action.payload }

    case 'ROUND_START':
      return {
        ...state,
        round:   action.payload.round,
        players: state.players.map(p => ({ ...p, passed: false })),
      }

    case 'CARD_DRAWN':
      return { ...state, cardDrawn: true, card: action.payload?.card ?? state.card }

    case 'FIFTY_USED':
      return {
        ...state,
        fiftyUsedBy: state.fiftyUsedBy.includes(action.payload.playerId)
          ? state.fiftyUsedBy
          : [...state.fiftyUsedBy, action.payload.playerId],
      }

    case 'REMOVE_OPTIONS':
      return { ...state, removedOptions: action.payload }

    case 'TICK':
      return { ...state, timeRemaining: Math.max(0, state.timeRemaining - 1) }

    case 'TURN_RESULT':
      return { ...state, phase: 'result', lastResult: action.payload, aceChoice: null }

    case 'PLAYER_POINTS_UPDATE':
      return {
        ...state,
        players: state.players.map(p => {
          if (p.id !== action.payload.playerId) return p
          const { points, status, passed, left, streak, away } = action.payload
          return {
            ...p,
            points,
            status,
            ...(passed !== undefined && { passed }),
            ...(left   !== undefined && { left }),
            ...(streak !== undefined && { streak }),
            ...(away   !== undefined && { away }),
          }
        }),
      }

    case 'TURN_END':
      return { ...state, phase: 'playing', myTurn: false, exercise: null, cardDrawn: false, removedOptions: [], card: null, aceChoice: null }

    case 'GAME_FINISHED':
      return {
        ...state,
        phase:        'finished',
        finalRanking: action.payload.ranking ?? [],
        winner:       action.payload.winner ?? null,
        winners:      action.payload.winners ?? (action.payload.winner ? [action.payload.winner.id] : []),
        endReason:    action.payload.reason ?? null,
        badgeCatalog: action.payload.badges ?? state.badgeCatalog,
        round:        action.payload.rounds ?? state.round,
        myTurn:       false,
        exercise:     null,
      }

    case 'REVIEW':
      return { ...state, review: action.payload.history ?? [] }

    case 'RESET':
      return { ...INITIAL_STATE, playerId: state.playerId, nickname: state.nickname, avatar: state.avatar, profileId: state.profileId, resume: { status: 'none' } }

    default:
      return state
  }
}

// ── Provider ────────────────────────────────────────────────
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE, (init) => {
    const nickname = loadNickname()
    return {
      ...init,
      playerId:  getPid(),
      nickname,
      avatar:    avatarFor(nickname),
      profileId: profileIdFor(nickname),
    }
  })
  const { on, emit, connected } = useSocket()

  // Cada NOMBRE es un jugador distinto en este navegador:
  // al cambiar el nombre cambian el perfil (estadísticas) y el avatar guardado.
  useEffect(() => {
    saveNickname(state.nickname)
    const profileId = profileIdFor(state.nickname)
    const avatar    = avatarFor(state.nickname)
    if (profileId !== state.profileId || JSON.stringify(avatar) !== JSON.stringify(state.avatar)) {
      dispatch({ type: 'SET_PLAYER_INFO', payload: { profileId, avatar } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.nickname])

  // ── Reconexión: cada vez que el socket (re)conecta, volver a mi sala ──
  useEffect(() => {
    if (!connected) return
    const code = getActiveRoom()
    if (!code) { dispatch({ type: 'RESUME_STATUS', payload: { status: 'none' } }); return }

    dispatch({ type: 'RESUME_STATUS', payload: { status: 'pending', code } })
    emit('session:resume', { code }, (res) => {
      if (!res?.ok) {
        clearActiveRoom()
        dispatch({ type: 'RESUME_STATUS', payload: { status: 'failed', code } })
        return
      }
      setActiveRoom(res.code)
      if (res.phase === 'playing')       dispatch({ type: 'RESUME_GAME',     payload: res })
      else if (res.phase === 'finished') dispatch({ type: 'RESUME_FINISHED', payload: res })
      else                               dispatch({ type: 'RESUME_LOBBY',    payload: res })
      dispatch({ type: 'RESUME_STATUS', payload: { status: 'ok', phase: res.phase, code: res.code } })
    })
  }, [connected, emit])

  // Listeners de socket → reducer (on es estable, se registran una vez)
  useEffect(() => {
    const offs = [
      on('room:joined',          p => { setActiveRoom(p.code); dispatch({ type: 'JOIN_ROOM', payload: p }) }),
      on('room:host_assigned',   ()=> dispatch({ type: 'HOST_ASSIGNED' })),
      on('room:players_update',  p => dispatch({ type: 'PLAYERS_UPDATE',       payload: p })),
      on('game:started',         p => dispatch({ type: 'GAME_STARTED',         payload: p })),
      on('game:turn_start',      p => dispatch({ type: 'TURN_START',           payload: p })),
      on('game:round_start',     p => dispatch({ type: 'ROUND_START',          payload: p })),
      on('game:card_drawn',      p => dispatch({ type: 'CARD_DRAWN',           payload: p })),
      on('game:exercise',        p => dispatch({ type: 'EXERCISE',             payload: p })),
      on('game:ace_choice',      p => dispatch({ type: 'ACE_CHOICE',           payload: p })),
      on('game:fifty_used',      p => dispatch({ type: 'FIFTY_USED',           payload: p })),
      on('game:turn_result',     p => dispatch({ type: 'TURN_RESULT',          payload: p })),
      on('game:points_update',   p => dispatch({ type: 'PLAYER_POINTS_UPDATE', payload: p })),
      on('game:turn_end',        ()=> dispatch({ type: 'TURN_END' })),
      on('game:finished',        p => dispatch({ type: 'GAME_FINISHED',        payload: p })),
      on('game:review',          p => dispatch({ type: 'REVIEW',               payload: p })),
    ]
    return () => offs.forEach(off => off?.())
  }, [on])

  // Tick del temporizador local (el server manda el tiempo real al iniciar cada turno)
  useEffect(() => {
    if (!state.currentTurn || state.phase === 'finished' || state.timeRemaining <= 0) return
    const t = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(t)
  }, [state.currentTurn, state.phase, state.timeRemaining > 0])

  // Salir de la sala a propósito (no es una desconexión): se olvida la sala activa
  const leaveRoom = useCallback(() => {
    emit('room:leave')
    clearActiveRoom()
    dispatch({ type: 'RESET' })
  }, [emit])

  return (
    <GameContext.Provider value={{ state, dispatch, leaveRoom }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame debe usarse dentro de GameProvider')
  return ctx
}
