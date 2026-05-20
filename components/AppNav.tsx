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
  vertical,
}: {
  links: { href: string; label: string }[]
  pathname: string
  onNavigate?: () => void
  className?: string
  vertical?: boolean
}) {
  return (
    <div className={cn(vertical ? 'flex flex-col gap-0.5' : 'flex items-center gap-6', className)}>
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + '/')
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={cn(
              'text-sm font-medium transition-colors py-2',
              vertical && 'px-2 rounded-lg',
              active
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {l.label}
          </Link>
        )
      })}
    </div>
  )
}

export function AppNav({ role }: { role: string }) {
  const pathname = usePathname()
  const links = role === 'assistente' ? linksAssistente : linksPsicologa
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="hidden md:flex">
        <NavLinks links={links} pathname={pathname} />
      </nav>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden -mr-1"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div
          className="md:hidden absolute left-0 right-0 top-full border-b bg-card z-20 px-4 py-3 shadow-sm"
          role="navigation"
          aria-label="Menu principal"
        >
          <NavLinks
            links={links}
            pathname={pathname}
            onNavigate={() => setOpen(false)}
            vertical
          />
        </div>
      )}
    </>
  )
}
