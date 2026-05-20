import Link from 'next/link'
import {
  Calendar,
  ClipboardList,
  Plus,
  Settings,
  Upload,
  Users,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const actionsPsicologa = [
  { href: '/app/pacientes', label: 'Pacientes', icon: Users, desc: 'Fichas e cadastro' },
  { href: '/app/calendario', label: 'Calendário', icon: Calendar, desc: 'Semana e mês' },
  { href: '/app/tarefas', label: 'Tarefas', icon: ClipboardList, desc: 'Painel admin' },
  { href: '/app/financeiro', label: 'Financeiro', icon: Wallet, desc: 'Mês e entradas' },
  { href: '/app/pacientes/novo', label: 'Novo paciente', icon: Plus, desc: 'Cadastro rápido' },
  { href: '/app/pacientes/importar', label: 'Importar CSV', icon: Upload, desc: 'Consultório Psi' },
  { href: '/app/conta/integracoes', label: 'Integrações', icon: Settings, desc: 'Google Agenda' },
]

const actionsAssistente = [
  { href: '/app/tarefas', label: 'Tarefas', icon: ClipboardList, desc: 'Seu painel' },
  { href: '/app/pacientes', label: 'Pacientes', icon: Users, desc: 'Dados admin' },
  { href: '/app/pacientes/importar', label: 'Importar CSV', icon: Upload, desc: 'Lista inicial' },
]

export function QuickActions({ role }: { role: string }) {
  const items = role === 'assistente' ? actionsAssistente : actionsPsicologa

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'group flex flex-col gap-2 rounded-xl border border-border/80 bg-card p-4',
            'shadow-sm hover:border-primary/35 hover:bg-primary/[0.03] transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15">
            <item.icon className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block font-medium text-sm text-foreground">{item.label}</span>
            <span className="block text-xs text-muted-foreground mt-0.5">{item.desc}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
