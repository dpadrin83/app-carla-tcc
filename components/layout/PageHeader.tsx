import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-2', className)}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-1 text-[15px]">{subtitle}</p>
          )}
        </div>
        {children ? <div className="flex shrink-0 gap-2">{children}</div> : null}
      </div>
    </header>
  )
}
