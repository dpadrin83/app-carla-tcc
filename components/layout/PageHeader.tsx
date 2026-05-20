import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: string
  subtitle?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4', className)}>
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="text-base text-muted-foreground max-w-xl">{subtitle}</p>}
      </div>
      {children ? <div className="flex flex-wrap gap-2 shrink-0">{children}</div> : null}
    </div>
  )
}
