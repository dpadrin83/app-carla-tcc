import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED_PREFIX = '/app'
const PUBLIC_PATHS = ['/login', '/preview']
const SESSION_MAX_MS = 30 * 60 * 1000

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtected = pathname.startsWith(PROTECTED_PREFIX)
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const lastActivity = request.cookies.get('atena_last_activity')?.value
    const now = Date.now()
    if (lastActivity && now - Number(lastActivity) > SESSION_MAX_MS && isProtected) {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('expired', '1')
      const res = NextResponse.redirect(url)
      res.cookies.delete('atena_last_activity')
      return res
    }

    supabaseResponse.cookies.set('atena_last_activity', String(now), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_MS / 1000,
    })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const homePath =
      profile?.role === 'assistente'
        ? '/app/tarefas'
        : profile?.role === 'psicologa'
          ? '/app/hoje'
          : '/app/perfil-pendente'

    if (pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = homePath
      return NextResponse.redirect(url)
    }

    if (
      isProtected &&
      !profile?.role &&
      pathname !== '/app/perfil-pendente'
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/app/perfil-pendente'
      return NextResponse.redirect(url)
    }

    if (isProtected && profileNeedsClinicalBlock(pathname)) {
      if (profile?.role === 'assistente' && isClinicalOnlyPath(pathname)) {
        const url = request.nextUrl.clone()
        url.pathname = '/app/sem-acesso'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

function isClinicalOnlyPath(pathname: string): boolean {
  return (
    pathname.includes('/sessoes/nova') ||
    (pathname.includes('/sessoes/') && !pathname.endsWith('/sessoes'))
  )
}

function profileNeedsClinicalBlock(pathname: string): boolean {
  return pathname.includes('/sessoes')
}
