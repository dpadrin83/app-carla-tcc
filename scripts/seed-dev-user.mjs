/**
 * Cria usuário de teste + profile (usa service_role — só dev local).
 * Uso: npm run seed:dev
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local')
  process.exit(1)
}

const email = process.env.SEED_EMAIL ?? 'carla@atena.dev'
const password = process.env.SEED_PASSWORD ?? 'AtenaDev2026!'
const role = process.env.SEED_ROLE ?? 'psicologa'
const fullName = process.env.SEED_NAME ?? 'Carla (dev)'

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

let userId

const { data: created, error: createError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
})

if (createError) {
  userId = await findUserIdByEmail(email)
  if (!userId) {
    console.error('Erro ao criar usuário:', createError.message)
    console.error('Se criou via SQL, rode: npm run fix:carla')
    process.exit(1)
  }
  console.log('Usuário já existe — atualizando senha…')
  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  })
  if (updateError) {
    console.error('Erro ao atualizar senha:', updateError.message)
    console.error('Rode: npm run fix:carla (recria o usuário corretamente)')
    process.exit(1)
  }
} else {
  userId = created.user.id
  console.log('Usuário criado no Auth.')
}

const { error: profileError } = await supabase.from('profiles').upsert(
  { id: userId, full_name: fullName, role },
  { onConflict: 'id' }
)

if (profileError) {
  console.error('Erro ao criar profile:', profileError.message)
  console.error('Confira se as migrations 0001–0003 foram aplicadas no Supabase.')
  process.exit(1)
}

console.log('')
console.log('Pronto — use no login:')
console.log(`  E-mail:  ${email}`)
console.log(`  Senha:   ${password}`)
console.log(`  Perfil:  ${role}`)
console.log('')
console.log('http://localhost:3000/login')
