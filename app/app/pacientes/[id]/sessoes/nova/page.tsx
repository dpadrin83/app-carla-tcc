'use client'

import { useActionState, useState, useEffect } from 'react'
import { createSession } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { useCurrentProfile } from '@/hooks/useCurrentProfile'
import Link from 'next/link'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import { use } from 'react'

export default function NovaSessaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { profile } = useCurrentProfile()
  const isPsicologa = profile?.role === 'psicologa'

  const [status, setStatus] = useState('occurred')
  const [agenda, setAgenda] = useState('')

  // Format current date for datetime-local input
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  const defaultDate = now.toISOString().slice(0, 16)

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await createSession(id, prevState, formData)
    },
    null
  )

  const insertTemplate = (text: string) => {
    setAgenda(prev => prev ? `${prev}\n- ${text}` : `- ${text}`)
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <Link href={`/app/pacientes/${id}/sessoes`} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para sessões
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Registrar Evolução</h1>
        <p className="text-muted-foreground">Adicione uma nova sessão ao prontuário.</p>
      </div>

      <form action={formAction} className="space-y-8">
        {state?.error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
            {state.error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dados Básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Data e Hora *</Label>
                <Input 
                  id="scheduled_at" 
                  name="scheduled_at" 
                  type="datetime-local" 
                  defaultValue={defaultDate}
                  required 
                />
              </div>
              <div className="space-y-3">
                <Label>Status da Sessão *</Label>
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
                    <Label htmlFor="scheduled" className="font-normal text-muted-foreground">Agendada (futura)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no_show" id="no_show" />
                    <Label htmlFor="no_show" className="font-normal text-amber-600">Falta</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cancelled" id="cancelled" />
                    <Label htmlFor="cancelled" className="font-normal text-red-600">Cancelada</Label>
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
                Prontuário Clínico
                <Badge variant="outline" className="text-xs font-normal border-primary/30 text-primary">Sigiloso</Badge>
              </CardTitle>
              <CardDescription>Estes dados são visíveis apenas para você.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <div className="flex justify-between items-end mb-2">
                  <Label htmlFor="agenda">Pauta da Sessão</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => insertTemplate('RPD')}>RPD</Button>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => insertTemplate('Psicoeducação')}>Psicoeducação</Button>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => insertTemplate('Exposição')}>Exposição</Button>
                  </div>
                </div>
                <Textarea 
                  id="agenda" 
                  name="agenda" 
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  className="min-h-[100px] bg-background" 
                  placeholder="O que foi discutido hoje..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interventions">Intervenções Realizadas</Label>
                <Textarea 
                  id="interventions" 
                  name="interventions" 
                  className="min-h-[100px] bg-background" 
                  placeholder="Técnicas e intervenções aplicadas..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="homework">Tarefa Combinada (Homework)</Label>
                  <Textarea 
                    id="homework" 
                    name="homework" 
                    className="bg-background" 
                    placeholder="O que o paciente vai fazer até a próxima sessão..."
                  />
                  <p className="text-xs text-muted-foreground">Isso aparecerá na Ficha 360°.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next_focus">Foco da Próxima Sessão</Label>
                  <Textarea 
                    id="next_focus" 
                    name="next_focus" 
                    className="bg-background" 
                    placeholder="Sugestão de pauta para o próximo encontro..."
                  />
                  <p className="text-xs text-muted-foreground">Isso atualizará o Foco Terapêutico na Ficha 360°.</p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-primary/10">
                <Label htmlFor="notes">Observações Livres</Label>
                <Textarea 
                  id="notes" 
                  name="notes" 
                  className="min-h-[80px] bg-background" 
                  placeholder="Anotações pessoais, impressões..."
                />
              </div>

            </CardContent>
          </Card>
        )}

        {isPsicologa && status === 'scheduled' && (
          <div className="p-4 bg-muted rounded-lg flex items-start gap-3 text-sm text-muted-foreground">
            <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" />
            <p>
              Como o status é "Agendada", os campos de evolução clínica estão ocultos. 
              Você poderá preenchê-los após a realização da sessão.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
          <Link href={`/app/pacientes/${id}`}>
            <Button variant="outline" type="button" className="w-full sm:w-auto">Cancelar</Button>
          </Link>
          <Button 
            type="submit" 
            name="action" 
            value="save" 
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? 'Salvando...' : 'Salvar e Voltar'}
          </Button>
          {status === 'occurred' && (
            <Button 
              type="submit" 
              name="action" 
              value="save_and_next" 
              variant="secondary"
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Salvar e Agendar Próxima
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
