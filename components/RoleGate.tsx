import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface RoleGateProps {
  children: React.ReactNode
  role: 'psicologa' | 'assistente'
  fallback?: React.ReactNode
}

export async function RoleGate({ children, role, fallback = null }: RoleGateProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== role) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
