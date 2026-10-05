import { supabase } from './supabase.js'

// ─────────────────────────────────────────────────────────────
// Perfiles y estadísticas (tabla player_profiles)
// Si Supabase falla, el juego sigue normal: solo se pierde la estadística.
// ─────────────────────────────────────────────────────────────

const EMPTY = {
  games: 0, wins: 0, answered: 0, correct: 0, best_streak: 0,
  twentyones: 0, busts: 0, points_total: 0, topic_stats: {}, badges: {},
}

export const isValidProfileId = (id) => typeof id === 'string' && /^p_[a-z0-9]{6,40}$/i.test(id)

export async function getProfile(profileId) {
  const { data, error } = await supabase
    .from('player_profiles').select('*').eq('profile_id', profileId).maybeSingle()
  if (error) throw error
  return data
}

export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('player_profiles')
    .select('profile_id, nickname, avatar, games, wins, answered, correct, best_streak')
    .gt('games', 0)
    .order('wins', { ascending: false })
    .order('correct', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

/**
 * Guarda el resultado de una partida para cada jugador con profileId.
 * results: [{ profileId, nickname, avatar, won, points, status, history, maxStreak, badges }]
 */
export async function recordGame(results) {
  for (const r of results) {
    if (!isValidProfileId(r.profileId)) continue
    try {
      const prev = (await getProfile(r.profileId)) ?? { ...EMPTY }

      const topic_stats = { ...(prev.topic_stats ?? {}) }
      for (const h of r.history) {
        const t = topic_stats[h.topic] ?? { answered: 0, correct: 0 }
        topic_stats[h.topic] = { answered: t.answered + 1, correct: t.correct + (h.correct ? 1 : 0) }
      }

      const badges = { ...(prev.badges ?? {}) }
      for (const b of r.badges) badges[b] = (badges[b] ?? 0) + 1

      const row = {
        profile_id:   r.profileId,
        nickname:     r.nickname,
        avatar:       r.avatar ?? prev.avatar ?? null,
        games:        (prev.games ?? 0) + 1,
        wins:         (prev.wins ?? 0) + (r.won ? 1 : 0),
        answered:     (prev.answered ?? 0) + r.history.length,
        correct:      (prev.correct ?? 0) + r.history.filter(h => h.correct).length,
        best_streak:  Math.max(prev.best_streak ?? 0, r.maxStreak ?? 0),
        twentyones:   (prev.twentyones ?? 0) + (r.points === 21 ? 1 : 0),
        busts:        (prev.busts ?? 0) + (r.status === 'eliminated' ? 1 : 0),
        points_total: (prev.points_total ?? 0) + Math.min(r.points ?? 0, 21),
        topic_stats,
        badges,
        last_played:  new Date().toISOString(),
      }

      const { error } = await supabase.from('player_profiles').upsert(row, { onConflict: 'profile_id' })
      if (error) throw error
    } catch (err) {
      console.warn(`[perfil] no se guardó ${r.nickname}:`, err.message)
    }
  }
}
