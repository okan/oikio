import { Plus } from 'lucide-react'
import { Button } from '@/components/ui'

interface HeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="flex items-center justify-between pb-6 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {action && (
        <Button onClick={action.onClick} leftIcon={<Plus className="w-4 h-4" />}>
          {action.label}
        </Button>
      )}
    </header>
  )
}
