import Image from 'next/image'
import { APP_NAME, LOGO_SRC, LOGO_SRC_ON_DARK } from '@/lib/brand'
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
  const logoSrc = onDark ? LOGO_SRC_ON_DARK : LOGO_SRC

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src={logoSrc}
        alt={APP_NAME}
        width={s.px}
        height={s.px}
        priority={priority}
        className={cn(
          s.className,
          'object-contain',
          onDark && 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]'
        )}
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
