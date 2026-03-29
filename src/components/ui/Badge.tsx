import { cn } from '@/lib/utils'
export interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
}
export function Badge({ variant = 'default', size = 'md', children, className }: BadgeProps) {
  const variants = {
    default: 'bg-stone-100 text-stone-600',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-700',
    primary: 'bg-blue-50 text-blue-700',
  }
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
