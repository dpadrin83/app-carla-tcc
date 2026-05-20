'use client'

import { useActionState } from 'react'
import { createPatient } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCurrentProfile } from '@/hooks/useCurrentProfile'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NovoPacientePage() {
  const { profile } = useCurrentProfile()
  const isPsicologa = profile?.role === 'psicologa'

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await createPatient(prevState, formData)
    },
    null
  )

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/app/pacientes" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para pacientes
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo Paciente</h1>
        <p className="text-muted-foreground">Cadastre um novo paciente no sistema.</p>
      </div>

      <form action={formAction} className="space-y-8">
        {state?.error && (
          <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
            {state.error}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo *</Label>
              <Input id="full_name" name="full_name" required />
              {state?.details?.full_name && (
                <p className="text-sm text-destructive">{state.details.full_name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Data de Nascimento</Label>
              <Input id="birth_date" name="birth_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone / WhatsApp</Label>
              <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contato de Emergência</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Nome</Label>
              <Input id="emergency_contact_name" name="emergency_contact_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Telefone</Label>
              <Input id="emergency_contact_phone" name="emergency_contact_phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_relation">Parentesco</Label>
              <Input id="emergency_contact_relation" name="emergency_contact_relation" placeholder="Ex: Mãe, Cônjuge" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="session_value">Valor da Sessão (R$)</Label>
              <Input id="session_value" name="session_value" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Forma de Pagamento</Label>
              <Input id="payment_method" name="payment_method" placeholder="Ex: Pix, Transferência" />
            </div>
          </CardContent>
        </Card>

        {isPsicologa && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Dados Clínicos (Sigilosos)</CardTitle>
              <CardDescription>Estes dados são visíveis apenas para você e serão criptografados no banco de dados.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="case_summary">Resumo do Caso</Label>
                <Textarea id="case_summary" name="case_summary" className="min-h-[100px] bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_focus">Foco Terapêutico Atual</Label>
                <Input id="current_focus" name="current_focus" className="bg-background" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="medication">Medicação Atual</Label>
                  <Textarea id="medication" name="medication" className="bg-background" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risks_alerts" className="text-amber-600">Riscos / Alertas</Label>
                  <Textarea id="risks_alerts" name="risks_alerts" className="bg-background border-amber-200 focus-visible:ring-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-4">
          <Link href="/app/pacientes">
            <Button variant="outline" type="button">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : 'Salvar Paciente'}
          </Button>
        </div>
      </form>
    </div>
  )
}
