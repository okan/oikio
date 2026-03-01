import { cn } from '@/lib/utils'
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      {icon && <div className="mb-5 text-stone-300">{icon}</div>}
      <h3 className="text-lg font-medium text-stone-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-stone-500 mb-5 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
