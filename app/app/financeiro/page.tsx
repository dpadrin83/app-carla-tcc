import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FinanceiroClient } from './FinanceiroClient'
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns'

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role === 'assistente') redirect('/app/sem-acesso')

  const params = await searchParams
  const ref = params.mes ? new Date(params.mes + '-01') : new Date()
  const start = startOfMonth(ref)
  const end = endOfMonth(ref)
  const mes = format(ref, 'yyyy-MM')

  const prevStart = startOfMonth(subMonths(ref, 1))
  const prevEnd = endOfMonth(subMonths(ref, 1))

  const { data: entries } = await supabase
    .from('financial_entries')
    .select('*, patients(full_name)')
    .gte('occurred_at', format(start, 'yyyy-MM-dd'))
    .lte('occurred_at', format(end, 'yyyy-MM-dd'))
    .order('occurred_at', { ascending: false })

  const { data: prevEntries } = await supabase
    .from('financial_entries')
    .select('type, amount')
    .gte('occurred_at', format(prevStart, 'yyyy-MM-dd'))
    .lte('occurred_at', format(prevEnd, 'yyyy-MM-dd'))

  const entradas = entries?.filter((e) => e.type === 'entrada') ?? []
  const saidas = entries?.filter((e) => e.type === 'saida') ?? []
  const totalIn = entradas.reduce((s, e) => s + Number(e.amount), 0)
  const totalOut = saidas.reduce((s, e) => s + Number(e.amount), 0)

  const prevIn =
    prevEntries?.filter((e) => e.type === 'entrada').reduce((s, e) => s + Number(e.amount), 0) ?? 0
  const prevOut =
    prevEntries?.filter((e) => e.type === 'saida').reduce((s, e) => s + Number(e.amount), 0) ?? 0

  const { count: sessionsDone } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'occurred')
    .gte('scheduled_at', start.toISOString())
    .lte('scheduled_at', end.toISOString())

  const { count: sessionsNoShow } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'no_show')
    .gte('scheduled_at', start.toISOString())
    .lte('scheduled_at', end.toISOString())

  const { count: sessionsScheduled } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'scheduled')
    .gte('scheduled_at', start.toISOString())
    .lte('scheduled_at', end.toISOString())

  const { count: activePatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)

  const { count: newPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  const done = sessionsDone ?? 0
  const noShow = sessionsNoShow ?? 0
  const denom = done + noShow
  const adherence = denom > 0 ? Math.round((done / denom) * 100) : null

  const { data: patients } = await supabase
    .from('patients')
    .select('id, full_name')
    .eq('active', true)
    .order('full_name')

  return (
    <FinanceiroClient
      mes={mes}
      entries={entries ?? []}
      patients={patients ?? []}
      totals={{ in: totalIn, out: totalOut }}
      prevTotals={{ in: prevIn, out: prevOut }}
      indicators={{
        sessionsDone: done,
        sessionsNoShow: noShow,
        sessionsScheduled: sessionsScheduled ?? 0,
        activePatients: activePatients ?? 0,
        newPatients: newPatients ?? 0,
        adherence,
      }}
    />
  )
}
