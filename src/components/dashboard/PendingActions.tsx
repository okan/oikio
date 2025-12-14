import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { CheckSquare, Clock } from 'lucide-react'
import type { ActionItem } from '@/types'
import { Checkbox, Badge, EmptyState } from '@/components/ui'
import { getRelativeTime, isOverdue } from '@/lib/utils'
import { useActionStore } from '@/store'
interface PendingActionsProps {
  actions: ActionItem[]
}
export function PendingActions({ actions }: PendingActionsProps) {
  const { toggleComplete } = useActionStore()
  const { t } = useTranslation()
  return (
    <div className="card">
      <div className="p-4 border-b border-slate-200">
        <h2 className="font-semibold text-slate-900">{t('dashboard.openActions')}</h2>
        <p className="text-sm text-slate-500">{t('dashboard.tasksToComplete')}</p>
      </div>
      <div className="divide-y divide-slate-100">
        {actions.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="w-10 h-10" />}
            title={t('dashboard.allActionsCompleted')}
            description={t('dashboard.noPendingActions')}
            className="py-8"
          />
        ) : (
          actions.slice(0, 5).map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-4"
            >
              <Checkbox
                checked={action.completed}
                onCheckedChange={() => toggleComplete(action.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900">{action.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">{action.personName}</span>
                  {action.dueDate && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span
                        className={`text-xs flex items-center gap-1 ${
                          isOverdue(action.dueDate) ? 'text-red-500' : 'text-slate-500'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(action.dueDate)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              {action.dueDate && isOverdue(action.dueDate) && (
                <Badge variant="error">{t('dashboard.overdue')}</Badge>
              )}
            </motion.div>
          ))
        )}
      </div>
      {actions.length > 5 && (
        <div className="p-4 border-t border-slate-200 text-center">
          <a href="/actions" className="text-sm text-primary-600 hover:text-primary-700">
            {t('dashboard.viewAll')} ({t('dashboard.actions_count', { count: actions.length })})
          </a>
        </div>
      )}
    </div>
  )
}
