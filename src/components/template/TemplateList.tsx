import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import type { Template } from '@/types'
import { EmptyState, Button } from '@/components/ui'
import { TemplateCard } from './TemplateCard'

interface TemplateListProps {
  templates: Template[]
  onAddClick: () => void
  onEdit: (template: Template) => void
  onDelete: (id: number) => void
}

export function TemplateList({ templates, onAddClick, onEdit, onDelete }: TemplateListProps) {
  const { t } = useTranslation()

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="w-12 h-12" />}
        title={t('templates.noTemplates')}
        description={t('templates.createFirst')}
        action={<Button onClick={onAddClick}>{t('templates.createFirstButton')}</Button>}
      />
    )
  }

  return (
    <div className="space-y-3">
      {templates.map((template, index) => (
        <TemplateCard
          key={template.id}
          template={template}
          onEdit={() => onEdit(template)}
          onDelete={() => onDelete(template.id)}
          index={index}
        />
      ))}
    </div>
  )
}
