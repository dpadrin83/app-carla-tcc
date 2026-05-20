'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

const STORAGE_KEY = 'espaco_carla_onboarding_v1'

const stepsPsicologa = [
  { label: 'Hoje', href: '/app/hoje' },
  { label: 'Pacientes', href: '/app/pacientes' },
  { label: 'Calendário', href: '/app/calendario' },
  { label: 'Tarefas', href: '/app/tarefas' },
]

export function OnboardingBanner({ role }: { role: string }) {
  const [visible, setVisible] = useState(false)

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

  if (!visible || role === 'assistente') return null

  return (
    <div
      className="border-b border-border bg-accent/50 px-5 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm"
      role="note"
    >
      <p className="text-muted-foreground">
        <span className="text-foreground font-medium">Primeiros passos:</span>{' '}
        {stepsPsicologa.map((s, i) => (
          <span key={s.href}>
            {i > 0 && ' · '}
            <Link href={s.href} className="text-primary hover:underline">
              {s.label}
            </Link>
          </span>
        ))}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground"
          onClick={dismiss}
        >
          Ok
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={dismiss}
          aria-label="Fechar"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
