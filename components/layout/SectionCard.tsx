import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type SectionCardProps = {
  title: string
  icon?: LucideIcon
  variant?: 'default' | 'alert' | 'calm'
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}

export function SectionCard({
  title,
  icon: Icon,
  variant = 'default',
  children,
  className,
  action,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'surface-card overflow-hidden',
        variant === 'alert' && 'border-amber-200/70 bg-amber-50/40',
        variant === 'calm' && 'border-primary/15 bg-primary/[0.04]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg',
                variant === 'alert' ? 'bg-amber-100 text-amber-800' : 'bg-primary/10 text-primary'
              )}
              aria-hidden
            >
              <Icon className="h-4 w-4" />
            </span>
          )}
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}
