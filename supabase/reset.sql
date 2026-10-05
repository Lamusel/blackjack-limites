-- ═══════════════════════════════════════════════════════════
-- Blackjack de Cálculo — reset.sql
-- ⚠️ BORRA TODAS LAS TABLAS Y SUS DATOS.
-- Úsalo solo si ya habías ejecutado un schema viejo.
-- Después de esto, ejecuta schema.sql.
-- ═══════════════════════════════════════════════════════════

drop table if exists player_states cascade;
drop table if exists game_sessions cascade;
drop table if exists rooms         cascade;
drop table if exists exercises     cascade;
drop table if exists player_profiles cascade;
