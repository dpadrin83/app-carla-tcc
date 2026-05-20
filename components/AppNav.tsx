'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Calendar,
  ClipboardList,
  Menu,
  Shield,
  Sparkles,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'

type NavItem = { href: string; label: string; icon: LucideIcon }

const linksPsicologa: NavItem[] = [
  { href: '/app/hoje', label: 'Hoje', icon: Sparkles },
  { href: '/app/calendario', label: 'Calendário', icon: Calendar },
  { href: '/app/pacientes', label: 'Pacientes', icon: Users },
  { href: '/app/tarefas', label: 'Tarefas', icon: ClipboardList },
  { href: '/app/financeiro', label: 'Financeiro', icon: Wallet },
  { href: '/app/auditoria', label: 'Auditoria', icon: Shield },
]

const linksAssistente: NavItem[] = [
  { href: '/app/tarefas', label: 'Tarefas', icon: ClipboardList },
  { href: '/app/pacientes', label: 'Pacientes', icon: Users },
]

function NavLinks({
  links,
  pathname,
  onNavigate,
  className,
  vertical,
}: {
  links: NavItem[]
  pathname: string
  onNavigate?: () => void
  className?: string
  vertical?: boolean
}) {
  return (
    <div className={cn(vertical ? 'flex flex-col gap-1' : 'flex items-center gap-1', className)}>
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(l.href + '/')
        const Icon = l.icon
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              vertical && 'w-full',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
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
      <nav className="hidden lg:flex">
        <NavLinks links={links} pathname={pathname} />
      </nav>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div
          className="lg:hidden absolute left-0 right-0 top-full border-b bg-card/95 backdrop-blur-sm shadow-md z-20 px-4 py-4"
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
