import Image from 'next/image'
import { APP_NAME, LOGO_SRC } from '@/lib/brand'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  priority?: boolean
  className?: string
  /** Logo sobre fundo escuro (menu lateral) */
  onDark?: boolean
}

const sizes = {
  sm: { px: 36, className: 'h-9 w-9' },
  md: { px: 120, className: 'h-auto w-[min(120px,40vw)]' },
  lg: { px: 200, className: 'h-auto w-[min(200px,70vw)]' },
}

export function BrandLogo({
  size = 'md',
  showName = false,
  priority = false,
  className,
  onDark = false,
}: BrandLogoProps) {
  const s = sizes[size]

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Image
        src={LOGO_SRC}
        alt={APP_NAME}
        width={s.px}
        height={s.px}
        priority={priority}
        className={cn(s.className, 'object-contain')}
      />
      {showName && (
        <span
          className={cn(
            'font-semibold tracking-tight text-sm sm:text-base',
            onDark ? 'text-white' : 'text-primary'
          )}
        >
          {APP_NAME}
        </span>
      )}
    </span>
  )
}
