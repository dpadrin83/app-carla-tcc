import { cn } from '@/lib/utils'

type SectionCardProps = {
  title: string
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'alert'
  description?: string
}

export function SectionCard({
  title,
  children,
  className,
  variant = 'default',
  description,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        'modern-card',
        variant === 'alert' && 'modern-card--alert',
        className
      )}
    >
      <div className="modern-card-header">
        <span className="modern-card-accent" aria-hidden />
        <div>
          <h2 className="modern-card-title">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="modern-card-body">{children}</div>
    </section>
  )
}
