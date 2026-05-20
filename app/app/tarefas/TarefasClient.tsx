'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createTask, updateTaskStatus, createQuickTask } from './actions'

type Task = {
  id: string
  title: string
  type: string | null
  status: string
  due_date: string | null
  patient_id: string | null
  patients?: { full_name: string } | null
}

type Profile = { id: string; full_name: string }

const typeLabels: Record<string, string> = {
  nf: 'NF',
  receita_saude: 'Receita Saúde',
  contrato: 'Contrato',
  lembrete: 'Lembrete',
  cadastro: 'Cadastro',
  outro: 'Outro',
}

export function TarefasClient({
  tasks,
  profiles,
  patients,
  currentUserId,
}: {
  tasks: Task[]
  profiles: Profile[]
  patients: { id: string; full_name: string }[]
  currentUserId: string
}) {
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState<'all' | 'mine'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const filtered = tasks.filter((t) => {
    if (filter === 'mine') {
      // minhas = atribuídas a mim (simplificado: todas visíveis no filtro mine por ora)
    }
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
      if (key === 'done_today') return t.status === 'done' && t.due_date && new Date(t.due_date).toDateString() === today
      if (key === 'done_week') return t.status === 'done'
      return false
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => setShowNew(!showNew)}>Nova tarefa</Button>
        <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Todas</Button>
        <Button size="sm" variant={filter === 'mine' ? 'default' : 'outline'} onClick={() => setFilter('mine')}>Minhas</Button>
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
        <form action={createTask} className="bg-card border rounded-xl p-4 space-y-3 grid md:grid-cols-2 gap-3">
          <input name="title" placeholder="Título" required className="border rounded-lg px-3 py-2 text-sm md:col-span-2" />
          <select name="type" className="border rounded-lg px-3 py-2 text-sm">
            {Object.entries(typeLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select name="patient_id" className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Sem paciente</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
          <input name="due_date" type="date" className="border rounded-lg px-3 py-2 text-sm" />
          <select name="assigned_to" defaultValue={currentUserId} className="border rounded-lg px-3 py-2 text-sm">
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
          <textarea name="description" placeholder="Descrição" className="border rounded-lg px-3 py-2 text-sm md:col-span-2" />
          <Button type="submit" size="sm">Criar</Button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.key} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">{col.label}</h3>
            <div className="space-y-2 min-h-[120px]">
              {tasksForColumn(col.key).map((t) => (
                <div key={t.id} className="bg-card border rounded-lg p-3 text-sm space-y-2">
                  <p className="font-medium">{t.title}</p>
                  {t.patients?.full_name && (
                    <p className="text-muted-foreground text-xs">{t.patients.full_name}</p>
                  )}
                  <div className="flex gap-1 flex-wrap">
                    {t.type && <Badge variant="secondary">{typeLabels[t.type] ?? t.type}</Badge>}
                    {t.due_date && <Badge variant="outline">{t.due_date}</Badge>}
                  </div>
                  {t.status !== 'done' && (
                    <div className="flex gap-1">
                      {t.status === 'pending' && (
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateTaskStatus(t.id, 'in_progress')}>
                          Iniciar
                        </Button>
                      )}
                      <Button size="sm" className="h-7 text-xs" onClick={() => updateTaskStatus(t.id, 'done')}>
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
