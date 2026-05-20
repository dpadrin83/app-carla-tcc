-- =============================================================================
-- Remove usuário Carla criado via SQL (corrige "Database error" no Auth)
-- Rode TODO este arquivo no SQL Editor, depois crie o usuário pelo painel:
--   Authentication → Users → Add user → Invite / Create
--   Email: carla@espacocarlatcc.com
--   Password: Carla@2026
--   Auto Confirm User: ON
-- Depois rode: supabase/link-profile-carla.sql
-- =============================================================================

DELETE FROM public.profiles
WHERE id IN (
  SELECT id FROM auth.users WHERE lower(email) = lower('carla@espacocarlatcc.com')
);

DELETE FROM auth.identities
WHERE user_id IN (
  SELECT id FROM auth.users WHERE lower(email) = lower('carla@espacocarlatcc.com')
);

DELETE FROM auth.users
WHERE lower(email) = lower('carla@espacocarlatcc.com');
