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
export function TemplateCard({ template, onEdit, onDelete, index = 0 }: TemplateCardProps) {
  const { t } = useTranslation()
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card p-4 group"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary-100 rounded-xl text-primary-600">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{template.name}</h3>
            {template.isDefault && <Badge variant="primary">{t('templates.default')}</Badge>}
          </div>
          {template.description && (
            <p className="text-sm text-slate-500 mt-1">{template.description}</p>
          )}
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 font-mono">{template.content}</p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
