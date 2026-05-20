'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { linkEventToPatient } from './actions'
import type { EnrichedEvent } from '@/lib/google/events'

type Props = {
  events: EnrichedEvent[]
  patients: { id: string; full_name: string }[]
  linkEventId?: string
}

export function CalendarClient({ events, patients, linkEventId }: Props) {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-2">
        {events.map((ev) => (
          <button
            key={ev.id}
            type="button"
            onClick={() => setSelected(ev)}
            className={`w-full text-left p-4 rounded-xl border transition-colors ${
              selected?.id === ev.id ? 'border-primary bg-primary/5' : 'bg-card hover:border-primary/30'
            }`}
          >
            <p className="font-medium text-sm">
              {new Date(ev.start).toLocaleString('pt-BR', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="mt-1">{ev.summary}</p>
            {ev.patientName && (
              <p className="text-xs text-primary mt-1">{ev.patientName}</p>
            )}
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-xl p-5 h-fit sticky top-24">
        {!selected ? (
          <p className="text-sm text-muted-foreground">Selecione um evento para ver detalhes.</p>
        ) : (
          <div className="space-y-4">
            <h3 className="font-medium">{selected.summary}</h3>
            {selected.patientId ? (
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Paciente: {selected.patientName}</p>
                <Link href={`/app/pacientes/${selected.patientId}`}>
                  <Button className="w-full" size="sm">Abrir ficha 360°</Button>
                </Link>
              </div>
            ) : (
              
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}
