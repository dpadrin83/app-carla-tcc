import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOAuth2Client } from '@/lib/google/calendar'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  if (error || !code) {
    return NextResponse.redirect(`${base}/app/conta/integracoes?error=auth`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || (state && state !== user.id)) {
    return NextResponse.redirect(`${base}/login`)
  }

  const client = getOAuth2Client()
  const { tokens } = await client.getToken(code)

  if (!tokens.refresh_token) {
    return NextResponse.redirect(`${base}/app/conta/integracoes?error=no_refresh`)
  }

  await supabase.from('google_integrations').upsert({
    user_id: user.id,
    refresh_token: tokens.refresh_token,
    updated_at: new Date().toISOString(),
  })

  return NextResponse.redirect(`${base}/app/conta/integracoes?connected=1`)
}
