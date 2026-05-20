'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createTask, updateTaskStatus, createQuickTask } from './actions'

type Task = {
  id: string
  title: string
  type: string | null
  status: string
  due_date: string | null
  completed_at: string | null
  assigned_to: string | null
  patient_id: string | null
  patients?: { full_name: string } | null
}

type Profile = { id: string; full_name: string }

type Birthday = { id: string; full_name: string; day: number }

const typeLabels: Record<string, string> = {
  nf: 'NF',
  receita_saude: 'Receita Saúde',
  contrato: 'Contrato',
  lembrete: 'Lembrete',
  cadastro: 'Cadastro',
  outro: 'Outro',
}

const monthName = new Date().toLocaleString('pt-BR', { month: 'long' })

export function TarefasClient({
  tasks,
  profiles,
  patients,
  currentUserId,
  birthdays,
}: {
  tasks: Task[]
  profiles: Profile[]
  patients: { id: string; full_name: string }[]
  currentUserId: string
  birthdays: Birthday[]
}) {
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState<'all' | 'mine'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const filtered = tasks.filter((t) => {
    if (filter === 'mine' && t.assigned_to !== currentUserId) return false
    if (typeFilter && t.type !== typeFilter) return false
    return true
  })

  const columns = [
    { key: 'pending', label: 'A fazer' },
    { key: 'in_progress', label: 'Em andamento' },
    { key: 'done_today', label: 'Feitas hoje' },
    { key: 'done_week', label: 'Feitas esta semana' },
  ]

  function tasksForColumn(key: string) {
    const today = new Date().toDateString()
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return filtered.filter((t) => {
      if (key === 'pending') return t.status === 'pending'
      if (key === 'in_progress') return t.status === 'in_progress'
      if (key === 'done_today') {
        if (t.status !== 'done') return false
        const doneAt = t.completed_at ? new Date(t.completed_at).toDateString() : null
        return doneAt === today
      }
      if (key === 'done_week') {
        if (t.status !== 'done') return false
        const ts = t.completed_at
          ? new Date(t.completed_at).getTime()
          : t.due_date
            ? new Date(t.due_date).getTime()
            : 0
        return ts >= weekAgo
      }
      return false
    })
  }

  const pendingCount = tasks.filter((t) =>
    ['pending', 'in_progress'].includes(t.status)
  ).length

  return (
    <div className="space-y-6">
      {pendingCount === 0 && (
        <p className="text-sm text-muted-foreground bg-card border rounded-lg px-4 py-3">
          Sem tarefas pendentes no momento.
        </p>
      )}

      {birthdays.length > 0 && (
        <section className="bg-card border rounded-xl p-4" aria-label="Aniversários do mês">
          <h2 className="text-sm font-medium mb-2">
            Aniversários em {monthName}
          </h2>
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {birthdays.map((p) => (
              <li key={p.id}>
                <Link href={`/app/pacientes/${p.id}`}>
                  <Badge variant="outline" className="font-normal">
                    {p.day}/{new Date().getMonth() + 1} — {p.full_name}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setShowNew(!showNew)}>
          Nova tarefa
        </Button>
        <Button
          size="sm"
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Todas
        </Button>
        <Button
          size="sm"
          variant={filter === 'mine' ? 'default' : 'outline'}
          onClick={() => setFilter('mine')}
        >
          Minhas
        </Button>
        {Object.entries(typeLabels).map(([k, v]) => (
          <Button
            key={k}
            size="sm"
            variant={typeFilter === k ? 'default' : 'outline'}
            onClick={() => setTypeFilter(typeFilter === k ? '' : k)}
          >
            {v}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground self-center mr-1">Rápido:</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => createQuickTask('nf', null, 'Emitir NF')}
        >
          NF pendente
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => createQuickTask('receita_saude', null, 'Receita Saúde')}
        >
          Receita Saúde
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => createQuickTask('contrato', null, 'Confirmar contrato')}
        >
          Contrato
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => createQuickTask('lembrete', null, 'Lembrete ao paciente')}
        >
          Lembrete
        </Button>
      </div>

      {showNew && (
        <form
          action={createTask}
          className="bg-card border rounded-xl p-4 space-y-3 grid md:grid-cols-2 gap-3"
        >
          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="task-title">Título</Label>
            <Input id="task-title" name="title" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="task-type">Tipo</Label>
            <select
              id="task-type"
              name="type"
              className="border rounded-lg px-3 py-2 text-sm w-full h-9"
            >
              {Object.entries(typeLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="task-patient">Paciente</Label>
            <select
              id="task-patient"
              name="patient_id"
              className="border rounded-lg px-3 py-2 text-sm w-full h-9"
            >
              <option value="">Sem paciente</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="task-due">Prazo</Label>
            <Input id="task-due" name="due_date" type="date" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="task-assignee">Responsável</Label>
            <select
              id="task-assignee"
              name="assigned_to"
              defaultValue={currentUserId}
              className="border rounded-lg px-3 py-2 text-sm w-full h-9"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="task-desc">Descrição</Label>
            <textarea
              id="task-desc"
              name="description"
              className="border rounded-lg px-3 py-2 text-sm w-full min-h-[80px]"
            />
          </div>
          <Button type="submit" size="sm">
            Criar
          </Button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.key} className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-1">{col.label}</h3>
            <div className="space-y-2 min-h-[120px]">
              {tasksForColumn(col.key).length === 0 && (
                <p className="text-xs text-muted-foreground px-1">—</p>
              )}
              {tasksForColumn(col.key).map((t) => (
                <div key={t.id} className="surface-card p-4 text-sm space-y-2 shadow-none">
                  <p className="font-medium">{t.title}</p>
                  {t.patients?.full_name && (
                    <p className="text-muted-foreground text-xs">{t.patients.full_name}</p>
                  )}
                  <div className="flex gap-1 flex-wrap">
                    {t.type && (
                      <Badge variant="secondary">{typeLabels[t.type] ?? t.type}</Badge>
                    )}
                    {t.due_date && <Badge variant="outline">{t.due_date}</Badge>}
                  </div>
                  {t.status !== 'done' && (
                    <div className="flex gap-1">
                      {t.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => updateTaskStatus(t.id, 'in_progress')}
                        >
                          Iniciar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => updateTaskStatus(t.id, 'done')}
                      >
                        Concluir
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
