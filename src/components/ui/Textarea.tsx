import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const textareaId = id || label?.toLowerCase().replace(/\s/g, '-')
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="label">
            {label}
          </label>
        )}
        <motion.div
          animate={{
            boxShadow: isFocused
              ? '0 0 0 3px rgba(14, 165, 233, 0.15)'
              : '0 0 0 0px rgba(14, 165, 233, 0)',
          }}
          transition={{ duration: 0.15 }}
          className="rounded-lg"
        >
          <textarea
            id={textareaId}
            ref={ref}
            className={cn(
              'input min-h-[100px] resize-y',
              error && 'input-error',
              className
            )}
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
        </motion.div>
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
)
Textarea.displayName = 'Textarea'
