import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
interface CheckboxProps {
  id?: string
  label?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  lineThrough?: boolean
}
export function Checkbox({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
  className,
  lineThrough = false,
}: CheckboxProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <CheckboxPrimitive.Root
        id={id}
        disabled={disabled}
        checked={checked}
        onCheckedChange={(checked) => onCheckedChange?.(checked === true)}
        className={cn(
          'w-5 h-5 rounded border-2 border-stone-300 transition-colors duration-150',
          'hover:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500/20',
          'data-[state=checked]:bg-stone-800 data-[state=checked]:border-stone-800',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <CheckboxPrimitive.Indicator asChild>
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center justify-center text-white"
          >
            <Check className="w-3 h-3" strokeWidth={3} />
          </motion.span>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={id}
          className={cn(
            'text-sm text-stone-700 cursor-pointer select-none',
            checked && lineThrough && 'line-through text-stone-400',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {label}
        </label>
      )}
    </div>
  )
}
