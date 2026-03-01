import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, leftIcon, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <motion.div
          animate={{
            boxShadow: isFocused
              ? '0 0 0 3px rgba(120, 113, 108, 0.12)'
              : '0 0 0 0px rgba(120, 113, 108, 0)',
          }}
          transition={{ duration: 0.2 }}
          className="rounded-lg"
        >
          <div className="relative">
            {leftIcon && (
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400">
                {leftIcon}
              </div>
            )}
            <input
              id={inputId}
              ref={ref}
              className={cn('input', error && 'input-error', leftIcon && 'pl-11', className)}
              onFocus={(e) => {
                setIsFocused(true)
                props.onFocus?.(e)
              }}
              onBlur={(e) => {
                setIsFocused(false)
                props.onBlur?.(e)
              }}
              {...props}
            />
          </div>
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'
