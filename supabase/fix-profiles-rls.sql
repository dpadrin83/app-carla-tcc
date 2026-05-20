-- =============================================================================
-- Corrige "Perfil não configurado" com login OK
-- Causa: política RLS de SELECT em profiles ausente ou incompleta no projeto.
-- Rode no Supabase → SQL Editor (arquivo inteiro).
-- Depois: sair e entrar de novo no app.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.has_profile()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid());
END;
$$;

CREATE OR REPLACE FUNCTION public.is_psicologa()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'psicologa'
  );
END;
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Essencial: usuário sempre lê o próprio perfil (role psicóloga/assistente)
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Ver perfis da equipe (nomes na assistente, tarefas, etc.)
CREATE POLICY "Users can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_profile());

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Garante profile da Carla (se já existe no Auth)
INSERT INTO public.profiles (id, full_name, role)
SELECT id, 'Carla', 'psicologa'
FROM auth.users
WHERE lower(email) = lower('carla@espacocarlatcc.com')
ON CONFLICT (id) DO UPDATE
SET full_name = 'Carla',
    role = 'psicologa';
