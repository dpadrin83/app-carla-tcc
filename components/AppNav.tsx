'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const linksPsicologa = [
  { href: '/app/hoje', label: 'Hoje' },
  { href: '/app/calendario', label: 'Calendário' },
  { href: '/app/pacientes', label: 'Pacientes' },
  { href: '/app/tarefas', label: 'Tarefas' },
  { href: '/app/financeiro', label: 'Financeiro' },
  { href: '/app/auditoria', label: 'Auditoria' },
]

const linksAssistente = [
  { href: '/app/tarefas', label: 'Tarefas' },
  { href: '/app/pacientes', label: 'Pacientes' },
]

function NavLinks({
  links,
  pathname,
  onNavigate,
  className,
}: {
  links: { href: string; label: string }[]
  pathname: string
  onNavigate?: () => void
  className?: string
}) {
  return (
    <div className={className}>
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={onNavigate}
          className={cn(
            'text-sm font-medium text-muted-foreground hover:text-foreground block py-2 md:py-0',
            pathname === l.href || pathname.startsWith(l.href + '/') ? 'text-foreground' : ''
          )}
        >
          {l.label}
        </Link>
      ))}
    </div>
  )
}

export function AppNav({ role }: { role: string }) {
  const pathname = usePathname()
  const links = role === 'assistente' ? linksAssistente : linksPsicologa
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="hidden md:flex gap-4">
        <NavLinks links={links} pathname={pathname} className="flex gap-4" />
      </nav>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div
          className="md:hidden absolute left-0 right-0 top-full border-b bg-background shadow-sm z-20 px-4 py-3 flex flex-col gap-1"
          role="navigation"
          aria-label="Menu principal"
        >
          <NavLinks links={links} pathname={pathname} onNavigate={() => setOpen(false)} />
        </div>
      )}
    </>
  )
}
