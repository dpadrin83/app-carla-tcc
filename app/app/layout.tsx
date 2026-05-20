import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { SkipLink } from '@/components/SkipLink'
import { OnboardingBanner } from '@/components/OnboardingBanner'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = profile?.role ?? 'psicologa'
  const homeHref = role === 'assistente' ? '/app/tarefas' : '/app/hoje'

  return (
    <div className="min-h-screen flex flex-col lg:flex-row app-canvas">
      <SkipLink />
      <AppSidebar
        role={role}
        fullName={profile?.full_name}
        homeHref={homeHref}
        logoutSlot={
          <form action={logout}>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="w-full bg-white/15 text-white border-0 hover:bg-white/25"
            >
              Sair
            </Button>
          </form>
        }
      />
      <div className="flex flex-1 flex-col min-w-0 lg:min-h-screen">
        <OnboardingBanner role={role} />
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
