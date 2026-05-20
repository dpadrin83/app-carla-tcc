import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { AppNav } from '@/components/AppNav'
import { SkipLink } from '@/components/SkipLink'
import { BrandLogo } from '@/components/BrandLogo'
import { OnboardingBanner } from '@/components/OnboardingBanner'

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
    <div className="min-h-screen flex flex-col app-canvas">
      <SkipLink />
      <header className="sticky top-0 z-20 bg-card border-b border-border px-5 md:px-8 py-3.5 flex items-center justify-between gap-4 relative">
        <div className="flex items-center gap-6 md:gap-10 min-w-0">
          <Link
            href={profile?.role === 'assistente' ? '/app/tarefas' : '/app/hoje'}
            className="shrink-0 text-primary"
            aria-label="Espaço Carla TCC — início"
          >
            <BrandLogo size="sm" showName className="hidden sm:inline-flex" />
            <BrandLogo size="sm" className="sm:hidden" />
          </Link>
          <AppNav role={profile?.role ?? 'psicologa'} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-muted-foreground hidden sm:block max-w-[120px] truncate">
            {profile?.full_name}
          </span>
          <form action={logout}>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Sair
            </Button>
          </form>
        </div>
      </header>
      <OnboardingBanner role={profile?.role ?? 'psicologa'} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
    </div>
  )
}
