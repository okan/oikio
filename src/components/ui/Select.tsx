import * as SelectPrimitive from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useId } from 'react'
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
  disabled?: boolean
}
export function Select({
  label,
  placeholder,
  value,
  onValueChange,
  options,
  error,
  disabled,
}: SelectProps) {
  const { t } = useTranslation()
  const autoId = useId()
  const triggerId = `select-${autoId}`
  const validOptions = options.filter((opt) => opt.value !== '')
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={triggerId} className="label">{label}</label>}
      <SelectPrimitive.Root value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
        <SelectPrimitive.Trigger
          id={triggerId}
          className={cn(
            'input flex items-center justify-between gap-2',
            error && 'input-error',
            !value && 'text-stone-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder || t('common.select')} />
          <SelectPrimitive.Icon>
            <ChevronDown className="w-4 h-4 text-stone-400 flex-shrink-0" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className="bg-white rounded-lg border border-stone-200 shadow-xl overflow-hidden z-[100] min-w-[var(--radix-select-trigger-width)]"
            position="popper"
            sideOffset={4}
            align="start"
          >
            <SelectPrimitive.Viewport className="p-1">
              {validOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-stone-500">{t('common.noOptions')}</div>
              ) : (
                validOptions.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 rounded-md text-sm cursor-pointer outline-none transition-colors',
                      'text-stone-700',
                      'data-[highlighted]:bg-stone-100',
                      'data-[state=checked]:text-stone-900 data-[state=checked]:font-medium'
                    )}
                  >
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator className="ml-auto">
                      <Check className="w-4 h-4 text-stone-600" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))
              )}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
