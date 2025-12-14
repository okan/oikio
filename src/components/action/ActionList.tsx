import { AnimatePresence } from 'framer-motion'
import { CheckSquare } from 'lucide-react'
import type { ActionItem as ActionItemType } from '@/types'
import { EmptyState } from '@/components/ui'
import { ActionItem } from './ActionItem'
interface ActionListProps {
  actions: ActionItemType[]
  onToggle: (id: number) => void
  onDelete: (id: number) => void
  showMeeting?: boolean
  emptyTitle?: string
  emptyDescription?: string
}
export function ActionList({
  actions,
  onToggle,
  onDelete,
  showMeeting = false,
  emptyTitle = 'No actions',
  emptyDescription = 'No action items added yet.',
}: ActionListProps) {
  if (actions.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare className="w-12 h-12" />}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }
  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {actions.map((action, index) => (
          <ActionItem
            key={action.id}
            action={action}
            onToggle={() => onToggle(action.id)}
            onDelete={() => onDelete(action.id)}
            showMeeting={showMeeting}
            index={index}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
