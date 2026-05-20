import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { endOfMonth, format, startOfMonth } from 'date-fns'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'psicologa') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const mes = searchParams.get('mes')
  const ref = mes ? new Date(mes + '-01') : new Date()
  const start = startOfMonth(ref)
  const end = endOfMonth(ref)

  const { data: entries } = await supabase
    .from('financial_entries')
    .select('occurred_at, type, amount, description, patients(full_name)')
    .gte('occurred_at', format(start, 'yyyy-MM-dd'))
    .lte('occurred_at', format(end, 'yyyy-MM-dd'))
    .order('occurred_at', { ascending: true })

  const header = 'data,tipo,valor,descricao,paciente'
  const rows =
    entries?.map((e) => {
      const name = (e.patients as { full_name?: string } | null)?.full_name ?? ''
      const desc = (e.description ?? '').replace(/"/g, '""')
      return `${e.occurred_at},${e.type},${e.amount},"${desc}","${name}"`
    }) ?? []

  const csv = [header, ...rows].join('\n')
  const filename = `financeiro-${format(ref, 'yyyy-MM')}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
