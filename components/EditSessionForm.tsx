'use client'

import { useActionState, useState } from 'react'
import { updateSession } from '@/app/app/pacientes/[id]/sessoes/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type SessionData = {
  id: string
  scheduled_at: string
  status: string
  agenda: string | null
  interventions: string | null
  homework: string | null
  next_focus: string | null
  notes: string | null
}

export function EditSessionForm({
  patientId,
  session,
  isPsicologa,
}: {
  patientId: string
  session: SessionData
  isPsicologa: boolean
}) {
  const [status, setStatus] = useState(session.status)
  const scheduledLocal = new Date(session.scheduled_at)
  scheduledLocal.setMinutes(scheduledLocal.getMinutes() - scheduledLocal.getTimezoneOffset())
  const defaultDate = scheduledLocal.toISOString().slice(0, 16)

  const [state, formAction, isPending] = useActionState(
    async (prev: unknown, formData: FormData) =>
      updateSession(session.id, patientId, prev, formData),
    null
  )

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link
        href={`/app/pacientes/${patientId}/sessoes/${session.id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar sessão</h1>
        <p className="text-muted-foreground">Atualize data, status e evolução clínica.</p>
      </div>

      <form action={formAction} className="space-y-8">
        {state?.error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
            {state.error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dados básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Data e hora</Label>
                <Input
                  id="scheduled_at"
                  name="scheduled_at"
                  type="datetime-local"
                  defaultValue={defaultDate}
                  required
                />
              </div>
              <div className="space-y-3">
                <Label>Status</Label>
                <RadioGroup
                  name="status"
                  value={status}
                  onValueChange={setStatus}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="occurred" id="occurred" />
                    <Label htmlFor="occurred" className="font-normal">Realizada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="scheduled" id="scheduled" />
                    <Label htmlFor="scheduled" className="font-normal">Agendada</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no_show" id="no_show" />
                    <Label htmlFor="no_show" className="font-normal">Falta</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cancelled" id="cancelled" />
                    <Label htmlFor="cancelled" className="font-normal">Cancelada</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {isPsicologa && status === 'occurred' && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                Prontuário clínico
                <Badge variant="outline" className="text-xs font-normal border-primary/30 text-primary">
                  Sigiloso
                </Badge>
              </CardTitle>
              <CardDescription>Visível apenas para a psicóloga.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agenda">Pauta</Label>
                <Textarea id="agenda" name="agenda" defaultValue={session.agenda ?? ''} className="min-h-[100px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interventions">Intervenções</Label>
                <Textarea
                  id="interventions"
                  name="interventions"
                  defaultValue={session.interventions ?? ''}
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="homework">Tarefa combinada</Label>
                  <Textarea id="homework" name="homework" defaultValue={session.homework ?? ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next_focus">Foco da próxima</Label>
                  <Textarea id="next_focus" name="next_focus" defaultValue={session.next_focus ?? ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" name="notes" defaultValue={session.notes ?? ''} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-3">
          <Link href={`/app/pacientes/${patientId}/sessoes/${session.id}`}>
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando…' : 'Salvar alterações'}
          </Button>
        </div>
      </form>
    </div>
  )
}
