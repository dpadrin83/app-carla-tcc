'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const STORAGE_KEY = 'espaco_carla_onboarding_v1'

const stepsPsicologa = [
  { label: 'Comece em Hoje', href: '/app/hoje', desc: 'Veja agenda e pendências do dia.' },
  { label: 'Cadastre pacientes', href: '/app/pacientes', desc: 'Ou importe CSV do Consultório Psi.' },
  { label: 'Antes de cada sessão', href: '/app/pacientes', desc: 'Abra a ficha 360° do paciente.' },
  { label: 'Delegue à assistente', href: '/app/tarefas', desc: 'Tarefas e comentários por paciente.' },
]

const stepsAssistente = [
  { label: 'Painel de tarefas', href: '/app/tarefas', desc: 'Organize NFs, contratos e lembretes.' },
  { label: 'Pacientes', href: '/app/pacientes', desc: 'Dados administrativos (sem prontuário clínico).' },
  { label: 'Comentários', href: '/app/pacientes', desc: 'Comunique-se com a psicóloga na ficha do paciente.' },
]

export function OnboardingBanner({ role }: { role: string }) {
  const [visible, setVisible] = useState(false)
  const steps = role === 'assistente' ? stepsAssistente : stepsPsicologa

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) !== 'done') setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, 'done')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <section
      className="mx-4 md:mx-6 mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 md:p-5"
      aria-label="Primeiros passos"
    >
      <div className="flex justify-between items-start gap-4 mb-3">
        <div>
          <h2 className="font-medium text-primary">Primeiros passos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Guia rápido — feche quando não precisar mais.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={dismiss}
          aria-label="Fechar guia de primeiros passos"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ol className="grid sm:grid-cols-2 gap-3 list-none p-0 m-0">
        {steps.map((step, i) => (
          <li key={step.href + step.label} className="text-sm">
            <span className="font-medium text-foreground">
              {i + 1}.{' '}
              <Link href={step.href} className="text-primary hover:underline">
                {step.label}
              </Link>
            </span>
            <span className="text-muted-foreground block">{step.desc}</span>
          </li>
        ))}
      </ol>
      <Button type="button" variant="outline" size="sm" className="mt-4" onClick={dismiss}>
        Entendi, não mostrar de novo
      </Button>
    </section>
  )
}
