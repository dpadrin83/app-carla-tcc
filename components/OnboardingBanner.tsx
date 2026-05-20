'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react'

const STORAGE_KEY = 'espaco_carla_onboarding_v1'

const stepsPsicologa = [
  { label: 'Comece em Hoje', href: '/app/hoje', desc: 'Agenda e pendências do dia.' },
  { label: 'Cadastre pacientes', href: '/app/pacientes', desc: 'Ou importe CSV do Consultório Psi.' },
  { label: 'Ficha 360°', href: '/app/pacientes', desc: 'Antes de cada sessão, abra a ficha.' },
  { label: 'Delegue à assistente', href: '/app/tarefas', desc: 'Tarefas e comentários por paciente.' },
]

const stepsAssistente = [
  { label: 'Painel de tarefas', href: '/app/tarefas', desc: 'NFs, contratos e lembretes.' },
  { label: 'Pacientes', href: '/app/pacientes', desc: 'Dados administrativos.' },
  { label: 'Comentários', href: '/app/pacientes', desc: 'Fale com a psicóloga na ficha.' },
]

export function OnboardingBanner({ role }: { role: string }) {
  const [visible, setVisible] = useState(false)
  const [expanded, setExpanded] = useState(true)
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
      className="mx-4 md:mx-6 mt-4 surface-card border-primary/15 overflow-hidden"
      aria-label="Primeiros passos"
    >
      <div className="flex items-center justify-between gap-3 px-5 py-3 bg-primary/[0.05] border-b border-border/60">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          <h2 className="font-medium text-sm text-foreground">Primeiros passos</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Recolher' : 'Expandir'}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={dismiss}
            aria-label="Fechar guia"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {expanded && (
        <div className="px-5 py-4">
          <ol className="grid sm:grid-cols-2 gap-3 list-none p-0 m-0 mb-4">
            {steps.map((step, i) => (
              <li key={step.href + step.label} className="text-sm rounded-lg bg-muted/40 px-3 py-2.5">
                <span className="font-medium text-foreground">
                  {i + 1}.{' '}
                  <Link href={step.href} className="text-primary hover:underline">
                    {step.label}
                  </Link>
                </span>
                <span className="text-muted-foreground block mt-0.5 text-xs">{step.desc}</span>
              </li>
            ))}
          </ol>
          <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={dismiss}>
            Entendi, não mostrar de novo
          </Button>
        </div>
      )}
    </section>
  )
}
