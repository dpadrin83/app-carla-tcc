'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Calendar,
  CalendarDays,
  CheckSquare,
  Menu,
  Settings,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandLogo } from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const linksPsicologa: NavItem[] = [
  { href: '/app/hoje', label: 'Hoje', icon: CalendarDays },
  { href: '/app/calendario', label: 'Calendário', icon: Calendar },
  { href: '/app/pacientes', label: 'Pacientes', icon: Users },
  { href: '/app/tarefas', label: 'Tarefas', icon: CheckSquare },
  { href: '/app/financeiro', label: 'Financeiro', icon: Wallet },
]

const linksAssistente: NavItem[] = [
  { href: '/app/tarefas', label: 'Tarefas', icon: CheckSquare },
  { href: '/app/pacientes', label: 'Pacientes', icon: Users },
]

function SidebarNav({
  links,
  pathname,
  onNavigate,
}: {
  links: NavItem[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Menu principal">
      {links.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all',
              active
                ? 'bg-white/18 text-white shadow-sm'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            )}
          >
            <Icon
              className={cn(
                'h-[18px] w-[18px] shrink-0',
                active ? 'text-white' : 'text-white/60 group-hover:text-white/90'
              )}
              aria-hidden
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

type AppSidebarProps = {
  role: string
  fullName?: string | null
  homeHref: string
  logoutSlot: React.ReactNode
}

export function AppSidebar({ role, fullName, homeHref, logoutSlot }: AppSidebarProps) {
  const pathname = usePathname()
  const links = role === 'assistente' ? linksAssistente : linksPsicologa
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (
    <>
      <div className="px-5 pt-6 pb-5">
        <Link
          href={homeHref}
          onClick={() => setMobileOpen(false)}
          className="inline-flex text-white"
          aria-label="Espaço Carla TCC — início"
        >
          <BrandLogo size="sm" showName onDark />
        </Link>
      </div>

      <SidebarNav
        links={links}
        pathname={pathname}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className="mt-auto px-3 pb-4 space-y-1">
        <Link
          href="/app/conta/integracoes"
          onClick={() => setMobileOpen(false)}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-all',
            pathname.startsWith('/app/conta')
              ? 'bg-white/18 text-white'
              : 'text-white/75 hover:bg-white/10 hover:text-white'
          )}
        >
          <Settings className="h-[18px] w-[18px] shrink-0 text-white/60" aria-hidden />
          Conta
        </Link>
      </div>

      <div className="border-t border-white/15 px-5 py-4 space-y-3">
        {fullName && (
          <p className="text-sm text-white/80 truncate font-medium" title={fullName}>
            {fullName}
          </p>
        )}
        {logoutSlot}
      </div>
    </>
  )

  return (
    <>
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <Link href={homeHref} className="text-primary shrink-0">
          <BrandLogo size="sm" />
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {mobileOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'app-sidebar flex w-[260px] shrink-0 flex-col',
          'fixed inset-y-0 left-0 z-50 h-screen transition-transform duration-200 ease-out',
          'lg:relative lg:z-auto lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
