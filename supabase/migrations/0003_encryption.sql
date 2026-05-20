-- 0003_encryption.sql

create extension if not exists pgcrypto;

-- We use a secure key from the vault or a hardcoded env var for MVP.
-- To keep it simple and secure, we'll use a current_setting.
-- Note: To use this, you must set the setting in Postgres:
-- ALTER DATABASE postgres SET app.encryption_key TO 'your-super-secret-key';

create or replace function public.encrypt_field(content text)
returns text as $$
begin
  if content is null then return null; end if;
  return pgp_sym_encrypt(content, current_setting('app.encryption_key', true));
end;
$$ language plpgsql security definer;

create or replace function public.decrypt_field(content text)
returns text as $$
begin
  if content is null then return null; end if;
  return pgp_sym_decrypt(content::bytea, current_setting('app.encryption_key', true));
end;
$$ language plpgsql security definer;
