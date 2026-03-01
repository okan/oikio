import { Plus } from 'lucide-react'
import { Button } from '@/components/ui'
interface HeaderAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: React.ReactNode
}
interface HeaderProps {
  title: string
  description?: string
  action?: HeaderAction
  secondaryAction?: HeaderAction
}
export function Header({ title, description, action, secondaryAction }: HeaderProps) {
  return (
    <header className="flex items-center justify-between pb-5 mb-1">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
        {description && <p className="text-[13px] text-stone-500 mt-0.5">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {secondaryAction && (
          <Button
            variant={secondaryAction.variant || 'secondary'}
            onClick={secondaryAction.onClick}
            leftIcon={secondaryAction.icon}
          >
            {secondaryAction.label}
          </Button>
        )}
        {action && (
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
            leftIcon={action.icon || <Plus className="w-4 h-4" />}
          >
            {action.label}
          </Button>
        )}
      </div>
    </header>
  )
}
