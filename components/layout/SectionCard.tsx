import { cn } from '@/lib/utils'

type SectionCardProps = {
  title: string
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'alert'
}

export function SectionCard({ title, children, className, variant = 'default' }: SectionCardProps) {
  return (
    <section
      className={cn(
        'panel',
        variant === 'alert' && 'bg-[#fffbeb] border-[#fde68a]',
        className
      )}
    >
      <h2 className="block-title">{title}</h2>
      {children}
    </section>
  )
}
