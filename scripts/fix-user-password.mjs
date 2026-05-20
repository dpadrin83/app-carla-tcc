/**
 * Corrige senha de usuário criado via SQL (hash incompatível com GoTrue).
 * Uso: npm run fix:carla
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.SEED_EMAIL ?? 'carla@espacocarlatcc.com'
const password = process.env.SEED_PASSWORD ?? 'Carla@2026'
const fullName = process.env.SEED_NAME ?? 'Carla'
const role = process.env.SEED_ROLE ?? 'psicologa'

if (!url || !serviceKey) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function findUserIdByEmail(targetEmail) {
  let page = 1
  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const found = data.users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase())
    if (found) return found.id
    if (data.users.length < 200) break
    page += 1
  }
  return null
}

let userId = null
try {
  userId = await findUserIdByEmail(email)
} catch (e) {
  console.warn('Listagem de usuários falhou (Auth corrompido por SQL).')
  console.warn('Rode no Supabase SQL Editor: supabase/delete-user-carla.sql')
  console.warn('Depois: Authentication → Add user, ou rode este script de novo.')
}

if (userId) {
  console.log('Usuário encontrado, removendo registro antigo…')
  const { error: delError } = await supabase.auth.admin.deleteUser(userId)
  if (delError) {
    console.error('Não foi possível remover:', delError.message)
    console.error('Rode: supabase/delete-user-carla.sql no SQL Editor')
    process.exit(1)
  }
}

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
})

if (createError) {
  console.error('Erro ao recriar usuário:', createError.message)
  process.exit(1)
}

userId = created.user.id
console.log('Usuário recriado no Auth com senha válida.')

const { error: profileError } = await supabase.from('profiles').upsert(
  { id: userId, full_name: fullName, role },
  { onConflict: 'id' }
)

if (profileError) {
  console.error('Erro no profile:', profileError.message)
  process.exit(1)
}

console.log('')
console.log('Login corrigido:')
console.log(`  E-mail: ${email}`)
console.log(`  Senha:  ${password}`)
console.log('')
