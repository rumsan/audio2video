import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  className?: string
  animated?: boolean
}

export function Progress({ value, className, animated = true }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value))
  return (
    <div className={cn('w-full h-3 bg-blue-100 rounded-full overflow-hidden', className)}>
      <div
        className={cn(
          'h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500',
          animated && pct > 0 && pct < 100 && 'relative overflow-hidden',
        )}
        style={{ width: `${pct}%` }}
      >
        {animated && pct > 0 && pct < 100 && (
          <span className="absolute inset-0 bg-white/30 animate-[shimmer_1.5s_infinite]" />
        )}
      </div>
    </div>
  )
}
