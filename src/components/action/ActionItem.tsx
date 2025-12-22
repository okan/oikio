import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Clock, Trash2, User, ExternalLink } from 'lucide-react'
import { ActionItem as ActionItemType } from '@/types'
import { Checkbox, Badge, Tag } from '@/components/ui'
import { getRelativeTime, isOverdue, cn } from '@/lib/utils'
interface ActionItemProps {
  action: ActionItemType
  onToggle: () => void
  onDelete: () => void
  showMeeting?: boolean
  index?: number
}
export const ActionItem = memo(function ActionItem({
  action,
  onToggle,
  onDelete,
  showMeeting = false,
  index = 0,
}: ActionItemProps) {
  const { t } = useTranslation()
  const isActionOverdue = useMemo(
    () => action.dueDate && isOverdue(action.dueDate) && !action.completed,
    [action.dueDate, action.completed]
  )
  const relativeTime = useMemo(
    () => action.dueDate ? getRelativeTime(action.dueDate) : null,
    [action.dueDate]
  )
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "card p-4 flex items-start gap-3 group transition-colors hover:bg-slate-50",
        isActionOverdue && !action.completed && "border-red-200 bg-red-50/10"
      )}
    >
      <Checkbox
        checked={action.completed}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm ${action.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}
        >
          {action.description}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider",
            action.assignedTo === 'other' ? "text-amber-600" : "text-primary-600"
          )}>
            {action.assignedTo === 'other' ? (
              <>
                <ExternalLink className="w-3 h-3" />
                {t('actions.other')}
              </>
            ) : (
              <>
                <User className="w-3 h-3" />
                {t('actions.me')}
              </>
            )}
          </div>
          {showMeeting && action.personName && (
            <span className="text-xs text-slate-500 font-medium">{action.personName}</span>
          )}
          {relativeTime && (
            <>
              <span className="text-slate-300">•</span>
              <span
                className={cn(
                  "text-xs flex items-center gap-1",
                  isActionOverdue ? 'text-red-500 font-semibold' : 'text-slate-500'
                )}
              >
                <Clock className="w-3 h-3" />
                {relativeTime}
              </span>
            </>
          )}
        </div>
        {action.tags && action.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {action.tags.map((tag) => (
              <Tag key={tag} name={tag} />
            ))}
          </div>
        )}
      </div>
      {isActionOverdue && (
        <Badge variant="error">{t('dashboard.overdue')}</Badge>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  )
})

