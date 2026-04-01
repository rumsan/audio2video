import { cn } from '@/lib/utils'

interface SwitchProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  description?: string
  className?: string
}

export function Switch({ checked, onChange, label, description, className }: SwitchProps) {
  return (
    <label className={cn('flex items-start gap-3 cursor-pointer select-none', className)}>
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={cn(
            'w-10 h-6 rounded-full transition-colors duration-200',
            checked ? 'bg-blue-600' : 'bg-gray-300',
          )}
        />
        <div
          className={cn(
            'absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
            checked && 'translate-x-4',
          )}
        />
      </div>
      {(label || description) && (
        <div>
          {label && <p className="text-sm font-medium text-gray-800">{label}</p>}
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      )}
    </label>
  )
}
