'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFinancialEntry } from './actions'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Entry = {
  id: string
  type: string
  amount: number
  occurred_at: string
  description: string | null
  patient_id: string | null
  patients?: { full_name: string } | null
}

type Patient = { id: string; full_name: string }

export function FinanceiroClient({
  mes,
  entries,
  patients,
  totals,
  indicators,
  prevTotals,
}: {
  mes: string
  entries: Entry[]
  patients: Patient[]
  totals: { in: number; out: number }
  indicators: {
    sessionsDone: number
    sessionsNoShow: number
    sessionsScheduled: number
    activePatients: number
    newPatients: number
    adherence: number | null
  }
  prevTotals: { in: number; out: number }
}) {
  const [showForm, setShowForm] = useState<'entrada' | 'saida' | null>(null)
  const [patientFilter, setPatientFilter] = useState('')

  const [state, formAction, pending] = useActionState(
    async (prev: unknown, fd: FormData) => createFinancialEntry(prev, fd),
    null
  )

  const ref = new Date(mes + '-01')
  const prevMes = format(subMonths(ref, 1), 'yyyy-MM')
  const nextMes = format(addMonths(ref, 1), 'yyyy-MM')

  const filtered = patientFilter
    ? entries.filter((e) => e.patient_id === patientFilter)
    : entries

  const saldo = totals.in - totals.out
  const prevSaldo = prevTotals.in - prevTotals.out

  return (
    <div className="page-shell space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-muted-foreground capitalize">
            {format(ref, 'MMMM yyyy', { locale: ptBR })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/financeiro?mes=${prevMes}`}>
            <Button variant="outline" size="sm">← Mês anterior</Button>
          </Link>
          <Link href={`/app/financeiro?mes=${nextMes}`}>
            <Button variant="outline" size="sm">Próximo mês →</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Entradas</p>
          <p className="text-lg font-semibold text-green-700">R$ {totals.in.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Mês anterior: R$ {prevTotals.in.toFixed(2)}
          </p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Saídas</p>
          <p className="text-lg font-semibold text-red-700">R$ {totals.out.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Mês anterior: R$ {prevTotals.out.toFixed(2)}
          </p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Saldo</p>
          <p className="text-lg font-semibold">R$ {saldo.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Mês anterior: R$ {prevSaldo.toFixed(2)}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Indicadores do mês</h2>
        <div className="bg-card border rounded-xl p-4 text-sm grid sm:grid-cols-2 gap-2">
          <p>Sessões realizadas: <strong>{indicators.sessionsDone}</strong></p>
          <p>Faltas: <strong>{indicators.sessionsNoShow}</strong></p>
          <p>Sessões agendadas: <strong>{indicators.sessionsScheduled}</strong></p>
          <p>
            Taxa de adesão:{' '}
            <strong>
              {indicators.adherence !== null ? `${indicators.adherence}%` : '—'}
            </strong>
          </p>
          <p>Pacientes ativos: <strong>{indicators.activePatients}</strong></p>
          <p>Novos pacientes no mês: <strong>{indicators.newPatients}</strong></p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setShowForm(showForm === 'entrada' ? null : 'entrada')}>
          Nova entrada
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowForm(showForm === 'saida' ? null : 'saida')}>
          Nova saída
        </Button>
        <a
          href={`/api/financeiro/export?mes=${mes}`}
          className="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-muted/50"
        >
          Exportar CSV
        </a>
      </div>

      {showForm && (
        <form action={formAction} className="bg-card border rounded-xl p-4 space-y-3 max-w-md">
          <input type="hidden" name="type" value={showForm} />
          <h3 className="font-medium text-sm">
            {showForm === 'entrada' ? 'Nova entrada' : 'Nova saída'}
          </h3>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          {state?.success && <p className="text-sm text-green-700">Salvo.</p>}
          <div className="space-y-1">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="occurred_at">Data</Label>
            <Input
              id="occurred_at"
              name="occurred_at"
              type="date"
              defaultValue={format(new Date(), 'yyyy-MM-dd')}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="patient_id">Paciente (opcional)</Label>
            <select
              id="patient_id"
              name="patient_id"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" name="description" placeholder="Ex.: Pix sessão" />
          </div>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? 'Salvando…' : 'Salvar'}
          </Button>
        </form>
      )}

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h2 className="text-sm font-medium text-muted-foreground">Movimentações</h2>
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="border rounded-lg px-3 py-1.5 text-sm max-w-xs"
            aria-label="Filtrar por paciente"
          >
            <option value="">Todos os pacientes</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>
        <div className="bg-card border rounded-xl divide-y">
          {!filtered.length ? (
            <p className="p-6 text-center text-muted-foreground text-sm">
              Nenhuma movimentação neste mês.
            </p>
          ) : (
            filtered.map((e) => (
              <div key={e.id} className="flex justify-between p-4 text-sm gap-4">
                <span>
                  {e.occurred_at} — {e.description ?? e.patients?.full_name ?? '—'}
                </span>
                <span className={e.type === 'entrada' ? 'text-green-700 shrink-0' : 'text-red-700 shrink-0'}>
                  {e.type === 'entrada' ? '+' : '-'} R$ {Number(e.amount).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      <Link href="/app/hoje">
        <Button variant="outline">Voltar</Button>
      </Link>
    </div>
  )
}
