import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { FileText, Edit2, Trash2 } from 'lucide-react'
import type { Template } from '@/types'
import { Badge } from '@/components/ui'
interface TemplateCardProps {
  template: Template
  onEdit: () => void
  onDelete: () => void
  index?: number
}
const CATEGORY_COLORS: Record<string, string> = {
  manager: 'bg-purple-50 text-purple-700 border-purple-200',
  teammate: 'bg-blue-50 text-blue-700 border-blue-200',
  general: 'bg-stone-50 text-stone-600 border-stone-200',
}
export function TemplateCard({ template, onEdit, onDelete, index = 0 }: TemplateCardProps) {
  const { t } = useTranslation()
  const getCategoryColor = (category?: string) => CATEGORY_COLORS[category || 'general'] || CATEGORY_COLORS.general
  const getCategoryLabel = (category?: string) => {
    const labels: Record<string, string> = {
      manager: t('templates.categoryManager'),
      teammate: t('templates.categoryTeammate'),
      general: t('templates.categoryGeneral'),
    }
    return labels[category || 'general'] || labels.general
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card p-4 group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-stone-100 rounded-xl text-stone-600">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-stone-900">{template.name}</h3>
            {template.isDefault && <Badge variant="primary">{t('templates.default')}</Badge>}
            <Badge variant="default" size="sm" className={getCategoryColor(template.category)}>
              {getCategoryLabel(template.category)}
            </Badge>
          </div>
          {template.description && (
            <p className="text-sm text-stone-500 mt-1">{template.description}</p>
          )}
          <p className="text-xs text-stone-400 mt-2 line-clamp-2 font-mono">{template.content}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            aria-label={t('common.edit')}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            aria-label={t('common.delete')}
            className="p-2 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
