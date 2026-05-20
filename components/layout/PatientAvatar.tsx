import { cn } from '@/lib/utils'

export function PatientAvatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const letter = name.trim().charAt(0).toUpperCase() || '?'
  const sizes = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-11 w-11 text-base',
    lg: 'h-14 w-14 text-lg',
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        'bg-primary/10 text-primary ring-2 ring-primary/10',
        sizes[size],
        className
      )}
      aria-hidden
    >
      {letter}
    </span>
  )
}
