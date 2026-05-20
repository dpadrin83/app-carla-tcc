-- =============================================================================
-- Criar login da Carla (psicóloga) — Espaço Carla TCC
-- =============================================================================
-- RECOMENDADO (senha funciona no login):
--   No terminal do projeto: npm run fix:carla
--   (usa SUPABASE_SERVICE_ROLE_KEY do .env.local)
--
-- SQL abaixo pode criar usuário com senha que NÃO autentica no app.
-- Se aparecer "Email ou senha incorretos", use npm run fix:carla.
--
-- Login no app (campo "Email"):
--   carla@espacocarlatcc.com
-- Senha:
--   Carla@2026
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public._create_user_carla_once()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = auth, public, extensions
AS $fn$
DECLARE
  login_email text := 'carla@espacocarlatcc.com';
  login_password text := 'Carla@2026';
  display_name text := 'Carla';
  profile_role text := 'psicologa';
  uid uuid;
  pwd_hash text;
BEGIN
  pwd_hash := crypt(login_password, gen_salt('bf'));

  SELECT u.id INTO uid
  FROM auth.users AS u
  WHERE lower(u.email) = lower(login_email)
  LIMIT 1;

  IF uid IS NULL THEN
    uid := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid,
      'authenticated',
      'authenticated',
      login_email,
      pwd_hash,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', display_name),
      now(),
      now()
    );

    INSERT INTO auth.identities (
      provider_id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      login_email,
      uid,
      jsonb_build_object(
        'sub', uid::text,
        'email', login_email,
        'email_verified', true
      ),
      'email',
      now(),
      now(),
      now()
    );
  ELSE
    UPDATE auth.users AS u
    SET
      encrypted_password = pwd_hash,
      email_confirmed_at = coalesce(u.email_confirmed_at, now()),
      updated_at = now()
    WHERE u.id = uid;
  END IF;

  INSERT INTO public.profiles (id, full_name, role)
  VALUES (uid, display_name, profile_role)
  ON CONFLICT (id) DO UPDATE
  SET full_name = excluded.full_name,
      role = excluded.role;

  RETURN format('OK — e-mail: %s | id: %s', login_email, uid);
END;
$fn$;

SELECT public._create_user_carla_once() AS resultado;

DROP FUNCTION public._create_user_carla_once();
