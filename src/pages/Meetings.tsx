import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import { useMeetingStore, usePersonStore, useTemplateStore } from '@/store'
import { Header } from '@/components/layout'
import { MeetingList, MeetingForm } from '@/components/meeting'
import { TemplateList, TemplateForm } from '@/components/template'
import { Modal } from '@/components/ui'
import type { Meeting, Template } from '@/types'
export function Meetings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { meetings, fetchMeetings, createMeeting, updateMeeting } = useMeetingStore()
  const { persons, fetchPersons } = usePersonStore()
  const { templates, fetchTemplates, createTemplate, updateTemplate, deleteTemplate } = useTemplateStore()
  const [meetingFormOpen, setMeetingFormOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [templateFormOpen, setTemplateFormOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [templateManagerOpen, setTemplateManagerOpen] = useState(false)
  useEffect(() => {
    fetchMeetings()
    fetchPersons()
    fetchTemplates()
  }, [fetchMeetings, fetchPersons, fetchTemplates])
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setMeetingFormOpen(true)
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])
  const handleAddMeeting = () => {
    setEditingMeeting(null)
    setMeetingFormOpen(true)
  }
  const handleMeetingSubmit = async (data: Omit<Meeting, 'id' | 'createdAt'>) => {
    if (editingMeeting) {
      await updateMeeting(editingMeeting.id, data)
    } else {
      const newMeeting = await createMeeting(data)
      navigate(`/meetings/${newMeeting.id}`)
      return newMeeting
    }
  }
  const handleAddTemplate = () => {
    setEditingTemplate(null)
    setTemplateFormOpen(true)
  }
  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setTemplateFormOpen(true)
  }
  const handleTemplateSubmit = async (data: Omit<Template, 'id'>) => {
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, data)
    } else {
      await createTemplate(data)
    }
  }
  const handleDeleteTemplate = async (id: number) => {
    await deleteTemplate(id)
  }
  return (
    <div className="space-y-6">
      <Header
        title={t('meetings.title')}
        description={t('meetings.description')}
        action={{ label: t('meetings.newMeeting'), onClick: handleAddMeeting }}
        secondaryAction={{
          label: t('nav.templates'),
          onClick: () => setTemplateManagerOpen(true),
          icon: <FileText className="w-4 h-4" />,
        }}
      />
      <MeetingList meetings={meetings} onAddClick={handleAddMeeting} />
      <MeetingForm
        open={meetingFormOpen}
        onOpenChange={setMeetingFormOpen}
        meeting={editingMeeting}
        persons={persons}
        templates={templates}
        onSubmit={handleMeetingSubmit}
      />
      { }
      <Modal
        open={templateManagerOpen}
        onOpenChange={setTemplateManagerOpen}
        title={t('templates.title')}
        className="max-w-3xl"
      >
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleAddTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('templates.newTemplate')}
            </button>
          </div>
          <TemplateList
            templates={templates}
            onAddClick={handleAddTemplate}
            onEdit={handleEditTemplate}
            onDelete={handleDeleteTemplate}
          />
        </div>
      </Modal>
      <TemplateForm
        open={templateFormOpen}
        onOpenChange={setTemplateFormOpen}
        template={editingTemplate}
        onSubmit={handleTemplateSubmit}
      />
    </div>
  )
}
export default Meetings
