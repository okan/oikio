import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { useTemplateStore } from '@/store'
import { Header } from '@/components/layout'
import { TemplateList, TemplateForm } from '@/components/template'
import { PageTransition } from '@/components/ui'
import type { Template } from '@/types'
export function Templates() {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
    <PageTransition className="space-y-6">
      <button
        onClick={() => navigate('/meetings')}
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('meetings.title')}
      </button>
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
    </PageTransition>
  )
}
export default Templates
