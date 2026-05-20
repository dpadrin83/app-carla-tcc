import Link from 'next/link'

const linksPsicologa = [
  { href: '/app/pacientes/novo', label: '+ Paciente' },
  { href: '/app/pacientes/importar', label: 'Importar CSV' },
  { href: '/app/conta/integracoes', label: 'Integrações' },
]

export function QuickActions({ role }: { role: string }) {
  if (role === 'assistente') return null

  return (
    <p className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
      {linksPsicologa.map((item, i) => (
        <span key={item.href} className="inline-flex items-center gap-4">
          {i > 0 && <span className="text-border select-none" aria-hidden>·</span>}
          <Link href={item.href} className="text-primary hover:underline font-medium">
            {item.label}
          </Link>
        </span>
      ))}
    </p>
  )
}
