import Link from 'next/link'

const linksPsicologa = [
  { href: '/app/pacientes/novo', label: '+ Paciente' },
  { href: '/app/pacientes/importar', label: 'Importar CSV' },
  { href: '/app/conta/integracoes', label: 'Integrações' },
]

export function QuickActions({ role }: { role: string }) {
  if (role === 'assistente') return null

  return (
    <div className="flex flex-wrap gap-2">
      {linksPsicologa.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="inline-flex items-center rounded-full border border-primary/20 bg-accent/80 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          {item.label}
        </Link>
      ))}
    </div>
  )
}
