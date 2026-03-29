import { AnimatePresence } from 'framer-motion'
import { CheckSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  onAddProgressNote?: (actionId: number, text: string) => Promise<void>
}
export function ActionList({
  actions,
  onToggle,
  onDelete,
  showMeeting = false,
  emptyTitle,
  emptyDescription,
  onAddProgressNote,
}: ActionListProps) {
  const { t } = useTranslation()
  if (actions.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare className="w-12 h-12" />}
        title={emptyTitle || t('actions.noActions')}
        description={emptyDescription || t('actions.noActionsDesc')}
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
            onAddProgressNote={onAddProgressNote}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
