import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { AppNav } from '@/components/AppNav'
import { SkipLink } from '@/components/SkipLink'
import { BrandLogo } from '@/components/BrandLogo'
import { OnboardingBanner } from '@/components/OnboardingBanner'
import { PatientAvatar } from '@/components/layout/PatientAvatar'

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
      <header className="sticky top-0 z-20 border-b border-border/70 bg-card/90 backdrop-blur-md px-4 md:px-6 py-3 flex items-center justify-between gap-4 relative shadow-sm">
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
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
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2 pr-1">
            <PatientAvatar name={profile?.full_name ?? 'U'} size="sm" />
            <span className="text-sm font-medium text-foreground max-w-[140px] truncate">
              {profile?.full_name}
            </span>
          </div>
          <form action={logout}>
            <Button variant="outline" size="sm" className="rounded-lg">
              Sair
            </Button>
          </form>
        </div>
      </header>
      <OnboardingBanner role={profile?.role ?? 'psicologa'} />
      <main id="main-content" className="flex-1 pb-12">
        {children}
      </main>
    </div>
  )
}
