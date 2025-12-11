import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTemplateStore } from '@/store'
import { Header } from '@/components/layout'
import { TemplateList, TemplateForm } from '@/components/template'
import type { Template } from '@/types'

export function Templates() {
  const { t } = useTranslation()
  const { templates, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } =
    useTemplateStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const handleAdd = () => {
    setEditingTemplate(null)
    setFormOpen(true)
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setFormOpen(true)
  }

  const handleSubmit = async (data: Omit<Template, 'id'>) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data)
    } else {
      await createTemplate(data)
    }
  }

  const handleDelete = async (id: number) => {
    await deleteTemplate(id)
  }

  return (
    <div className="space-y-6">
      <Header
        title={t('templates.title')}
        description={t('templates.description')}
        action={{ label: t('templates.newTemplate'), onClick: handleAdd }}
      />

      <TemplateList
        templates={templates}
        onAddClick={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TemplateForm
        open={formOpen}
        onOpenChange={setFormOpen}
        template={editingTemplate}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
