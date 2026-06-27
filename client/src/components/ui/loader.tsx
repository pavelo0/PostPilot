import { cn } from '@/lib/utils'

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg'

type LoaderProps = {
  size?: LoaderSize
  text?: string
  className?: string
  centered?: boolean
}

const sizeConfig: Record<LoaderSize, { outer: string; ring: string; dot: string }> = {
  xs: { outer: 'h-4 w-4', ring: 'border-2', dot: 'h-1 w-1' },
  sm: { outer: 'h-6 w-6', ring: 'border-2', dot: 'h-1.5 w-1.5' },
  md: { outer: 'h-9 w-9', ring: 'border-[3px]', dot: 'h-2 w-2' },
  lg: { outer: 'h-12 w-12', ring: 'border-[3px]', dot: 'h-2.5 w-2.5' },
}

const textSizeConfig: Record<LoaderSize, string> = {
  xs: 'text-[11px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
}

/**
 * Reusable animated spinner with optional label text.
 * Supports xs/sm/md/lg sizes and centered layout.
 */
export function Loader({ size = 'md', text, className, centered = false }: LoaderProps) {
  const config = sizeConfig[size]
  const textSize = textSizeConfig[size]

  const spinner = (
    <div className={cn('relative shrink-0', config.outer, className)}>
      <div
        className={cn(
          'absolute inset-0 rounded-full border-transparent animate-spin',
          config.ring,
        )}
        style={{
          borderTopColor: 'oklch(0.420 0.095 200)',
          borderRightColor: 'oklch(0.420 0.095 200 / 0.3)',
          borderBottomColor: 'oklch(0.420 0.095 200 / 0.1)',
        }}
      />
      <div
        className={cn(
          'absolute inset-0 m-auto rounded-full',
          config.dot,
        )}
        style={{ background: 'oklch(0.420 0.095 200 / 0.5)' }}
      />
    </div>
  )

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center gap-3">
        {spinner}
        {text ? (
          <p className={cn('text-muted-foreground', textSize)}>{text}</p>
        ) : null}
      </div>
    )
  }

  if (text) {
    return (
      <div className="flex items-center gap-2.5">
        {spinner}
        <p className={cn('text-muted-foreground', textSize)}>{text}</p>
      </div>
    )
  }

  return spinner
}
