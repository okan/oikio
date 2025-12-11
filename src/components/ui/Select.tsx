import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label?: string
  placeholder?: string
  value?: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  error?: string
}

export function Select({
  label,
  placeholder = 'Seçiniz',
  value,
  onValueChange,
  options,
  error,
}: SelectProps) {
  // Filter out empty values - Radix doesn't support them
  const validOptions = options.filter((opt) => opt.value !== '')

  return (
    <div className="space-y-1.5">
      {label && <label className="label">{label}</label>}
      <SelectPrimitive.Root value={value || undefined} onValueChange={onValueChange}>
        <SelectPrimitive.Trigger
          className={cn(
            'input flex items-center justify-between gap-2',
            error && 'input-error',
            !value && 'text-slate-400'
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon>
            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden z-[100] min-w-[var(--radix-select-trigger-width)]"
            position="popper"
            sideOffset={4}
            align="start"
          >
            <SelectPrimitive.Viewport className="p-1">
              {validOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-slate-500">Seçenek yok</div>
              ) : (
                validOptions.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-md text-sm cursor-pointer outline-none transition-colors',
                      'text-slate-700',
                      'data-[highlighted]:bg-slate-100',
                      'data-[state=checked]:text-primary-600 data-[state=checked]:font-medium'
                    )}
                  >
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="ml-auto">
                      <Check className="w-4 h-4 text-primary-500" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))
              )}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
