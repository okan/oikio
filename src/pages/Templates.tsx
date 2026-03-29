import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { useTemplateStore } from '@/store'
import { Header } from '@/components/layout'
import { TemplateList, TemplateForm } from '@/components/template'
import { ConfirmModal, PageTransition } from '@/components/ui'
import type { Template } from '@/types'
export function Templates() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { templates, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } =
    useTemplateStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null)
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
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, data)
        toast.success(t('templates.updated'))
      } else {
        await createTemplate(data)
        toast.success(t('templates.created'))
      }
    } catch {
      toast.error(t('common.error'))
    }
  }
  const handleDeleteClick = (id: number) => {
    setDeletingTemplateId(id)
    setDeleteModalOpen(true)
  }
  const handleDeleteConfirm = async () => {
    if (deletingTemplateId === null) return
    try {
      await deleteTemplate(deletingTemplateId)
      toast.success(t('templates.deleted'))
    } catch {
      toast.error(t('common.error'))
    } finally {
      setDeleteModalOpen(false)
      setDeletingTemplateId(null)
    }
  }
  return (
    <PageTransition className="space-y-6">
      <button
        onClick={() => navigate('/meetings')}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('nav.meetings')}
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
        onDelete={handleDeleteClick}
      />
      <TemplateForm
        open={formOpen}
        onOpenChange={setFormOpen}
        template={editingTemplate}
        onSubmit={handleSubmit}
      />
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={(open) => {
          setDeleteModalOpen(open)
          if (!open) setDeletingTemplateId(null)
        }}
        title={t('common.delete')}
        description={t('templates.deleteConfirm')}
        onConfirm={handleDeleteConfirm}
      />
    </PageTransition>
  )
}
export default Templates
