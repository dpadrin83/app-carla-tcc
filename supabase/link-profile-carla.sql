-- =============================================================================
-- Vincula perfil psicóloga à Carla (rode DEPOIS de criar o usuário no painel Auth)
-- =============================================================================

INSERT INTO public.profiles (id, full_name, role)
SELECT id, 'Carla', 'psicologa'
FROM auth.users
WHERE lower(email) = lower('carla@espacocarlatcc.com')
ON CONFLICT (id) DO UPDATE
SET full_name = 'Carla',
    role = 'psicologa';
