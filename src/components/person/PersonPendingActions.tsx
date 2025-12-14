import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Zap, Clock } from 'lucide-react'
import type { ActionItem } from '@/types'
import { Checkbox, Badge } from '@/components/ui'
import { useActionStore } from '@/store'
import { isOverdue, getRelativeTime } from '@/lib/utils'
interface PersonPendingActionsProps {
  actions: ActionItem[]
  onActionToggle?: () => void
}
export function PersonPendingActions({ actions, onActionToggle }: PersonPendingActionsProps) {
  const { t } = useTranslation()
  const { toggleComplete } = useActionStore()
  const pendingActions = actions.filter((a) => !a.completed)
  const handleToggle = async (actionId: number) => {
    await toggleComplete(actionId)
    onActionToggle?.()
  }
  if (pendingActions.length === 0) {
    return null
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-4 border-b border-slate-100 bg-amber-50">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-600" />
          <h3 className="font-medium text-amber-900">
            {t('personDetail.pendingActions', { count: pendingActions.length })}
          </h3>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {pendingActions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
          >
            <Checkbox checked={false} onCheckedChange={() => handleToggle(action.id)} />
            <span className="flex-1 text-sm text-slate-900">{action.description}</span>
            {action.dueDate && (
              <span
                className={`text-xs flex items-center gap-1 ${
                  isOverdue(action.dueDate) ? 'text-red-600' : 'text-slate-500'
                }`}
              >
                <Clock className="w-3 h-3" />
                {getRelativeTime(action.dueDate)}
              </span>
            )}
            {action.dueDate && isOverdue(action.dueDate) && (
              <Badge variant="error" size="sm">
                {t('focus.overdue')}
              </Badge>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
