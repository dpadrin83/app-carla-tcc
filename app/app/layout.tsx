import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { AppNav } from '@/components/AppNav'
import { SkipLink } from '@/components/SkipLink'
import { BrandLogo } from '@/components/BrandLogo'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <SkipLink />
      <header className="sticky top-0 z-10 bg-background border-b px-4 md:px-6 py-3 flex items-center justify-between gap-4 relative">
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href={profile?.role === 'assistente' ? '/app/tarefas' : '/app/hoje'}
            className="shrink-0"
            aria-label="Espaço Carla TCC — início"
          >
            <BrandLogo size="sm" showName className="hidden sm:inline-flex" />
            <BrandLogo size="sm" className="sm:hidden" />
          </Link>
          <AppNav role={profile?.role ?? 'psicologa'} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline-block">
            {profile?.full_name}
          </span>
          <form action={logout}>
            <Button variant="ghost" size="sm">Sair</Button>
          </form>
        </div>
      </header>
      <main id="main-content" className="flex-1">{children}</main>
    </div>
  )
}
