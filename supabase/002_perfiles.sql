-- ═══════════════════════════════════════════════════════════
-- Blackjack de Cálculo — 002_perfiles.sql
-- Tabla de perfiles con estadísticas por jugador.
-- Ejecútalo UNA vez en el SQL Editor (no borra nada; se puede repetir).
-- ═══════════════════════════════════════════════════════════

create table if not exists player_profiles (
  profile_id    text primary key check (profile_id ~ '^p_[a-z0-9]{6,40}$'),
  nickname      text not null,
  avatar        jsonb,
  games         int  not null default 0,
  wins          int  not null default 0,
  answered      int  not null default 0,
  correct       int  not null default 0,
  best_streak   int  not null default 0,
  twentyones    int  not null default 0,   -- veces que llegó a 21 exacto
  busts         int  not null default 0,   -- veces que se pasó
  points_total  int  not null default 0,
  topic_stats   jsonb not null default '{}'::jsonb,   -- { limites: { answered, correct }, ... }
  badges        jsonb not null default '{}'::jsonb,   -- { sniper: 2, edge: 1, ... }
  last_played   timestamptz,
  created_at    timestamptz default now()
);

create index if not exists player_profiles_wins_idx on player_profiles (wins desc, correct desc);

alter table player_profiles enable row level security;
drop policy if exists "acceso_publico" on player_profiles;
create policy "acceso_publico" on player_profiles for all to anon, authenticated using (true) with check (true);
grant select, insert, update, delete on player_profiles to anon, authenticated;
