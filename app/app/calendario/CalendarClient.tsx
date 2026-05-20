'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CalendarGrid } from '@/components/CalendarGrid'
import { linkEventToPatient } from './actions'
import type { EnrichedEvent } from '@/lib/google/events'

type Props = {
  events: EnrichedEvent[]
  patients: { id: string; full_name: string }[]
  view: 'week' | 'month'
  source: 'google' | 'database'
  linkEventId?: string
}

export function CalendarClient({
  events,
  patients,
  view,
  source,
  linkEventId,
}: Props) {
  const [selected, setSelected] = useState<EnrichedEvent | null>(
    linkEventId ? events.find((e) => e.id === linkEventId) ?? null : null
  )
  const [linking, setLinking] = useState(false)

  async function handleLink(patientId: string) {
    if (!selected) return
    setLinking(true)
    try {
      await linkEventToPatient(selected.id, patientId)
      setSelected(null)
    } finally {
      setLinking(false)
    }
  }

  const canLink = Boolean(
    selected && !selected.patientId && !selected.id.startsWith('db-session-')
  )

  return (
    <div className="space-y-4">
      {source === 'database' && (
        <p className="text-sm text-muted-foreground bg-muted/50 border rounded-lg px-4 py-3">
          Exibindo sessões cadastradas no sistema. Para sincronizar com o Google Agenda, use{' '}
          <Link href="/app/conta/integracoes" className="text-primary underline">
            Integrações
          </Link>
          .
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CalendarGrid
            view={view}
            events={events}
            selectedId={selected?.id ?? null}
            onSelect={setSelected}
          />
        </div>

        <aside className="bg-card border rounded-xl p-5 h-fit lg:sticky lg:top-24">
          {!selected ? (
            <p className="text-sm text-muted-foreground">
              Selecione um horário no calendário para ver detalhes.
            </p>
          ) : (
            <div className="space-y-4">
              <h3 className="font-medium">{selected.summary}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(selected.start).toLocaleString('pt-BR', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {selected.patientId ? (
                <div className="space-y-2 text-sm">
                  {selected.patientName && (
                    <p className="text-muted-foreground">Paciente: {selected.patientName}</p>
                  )}
                  <Link href={`/app/pacientes/${selected.patientId}`}>
                    <Button className="w-full" size="sm">
                      Abrir ficha 360°
                    </Button>
                  </Link>
                  {selected.id.startsWith('db-session-') && (
                    <Link
                      href={`/app/pacientes/${selected.patientId}/sessoes/${selected.id.replace('db-session-', '')}`}
                    >
                      <Button variant="outline" className="w-full" size="sm">
                        Ver sessão
                      </Button>
                    </Link>
                  )}
                </div>
              ) : canLink ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Vincular ao paciente:</p>
                  {patients.map((p) => (
                    <Button
                      key={p.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      disabled={linking}
                      onClick={() => handleLink(p.id)}
                    >
                      {p.full_name}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Evento do sistema — abra a ficha pelo menu Pacientes.
                </p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
