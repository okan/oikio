import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Edit2, Trash2, Calendar, User } from 'lucide-react'
import { useMeetingStore, usePersonStore, useTemplateStore, useActionStore } from '@/store'
import type { Meeting, ActionItem } from '@/types'
import { Button, Avatar, Modal } from '@/components/ui'
import { MeetingForm } from '@/components/meeting'
import { ActionList, ActionForm } from '@/components/action'
import { formatDate } from '@/lib/utils'

export function MeetingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { meetings, fetchMeetings, updateMeeting, deleteMeeting } = useMeetingStore()
  const { persons, fetchPersons } = usePersonStore()
  const { templates, fetchTemplates } = useTemplateStore()
  const { fetchActionsByMeeting, createAction, toggleComplete, deleteAction } = useActionStore()

  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [actions, setActions] = useState<ActionItem[]>([])
  const [editFormOpen, setEditFormOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      if (!id) return

      await fetchMeetings()
      await fetchPersons()
      await fetchTemplates()

      const meetingActions = await fetchActionsByMeeting(parseInt(id))
      setActions(meetingActions)
    }

    loadData()
  }, [id, fetchMeetings, fetchPersons, fetchTemplates, fetchActionsByMeeting])

  useEffect(() => {
    if (id && meetings.length > 0) {
      const foundMeeting = meetings.find((m) => m.id === parseInt(id))
      setMeeting(foundMeeting || null)
    }
  }, [id, meetings])

  const refreshActions = async () => {
    if (!id) return
    const meetingActions = await fetchActionsByMeeting(parseInt(id))
    setActions(meetingActions)
  }

  if (!meeting) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">{t('common.noResults')}</p>
      </div>
    )
  }

  const handleDelete = async () => {
    await deleteMeeting(meeting.id)
    navigate('/meetings')
  }

  const handleActionCreate = async (data: {
    description: string
    assignee?: string
    dueDate?: string
  }) => {
    await createAction({
      meetingId: meeting.id,
      ...data,
      completed: false,
    })
    await refreshActions()
  }

  const handleToggle = async (actionId: number) => {
    await toggleComplete(actionId)
    await refreshActions()
  }

  const handleDeleteAction = async (actionId: number) => {
    await deleteAction(actionId)
    await refreshActions()
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('common.back')}</span>
      </button>

      {/* Meeting Header */}
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={meeting.personName || ''} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{meeting.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {meeting.personName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(meeting.date)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setEditFormOpen(true)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              {t('common.edit')}
            </Button>
            <Button
              variant="danger"
              onClick={() => setDeleteModalOpen(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      {meeting.notes && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('meetings.notes')}</h2>
          <div className="prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900">
            <ReactMarkdown>{meeting.notes}</ReactMarkdown>
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">{t('nav.actions')}</h2>

        <ActionList
          actions={actions}
          onToggle={handleToggle}
          onDelete={handleDeleteAction}
          emptyTitle={t('actions.noActions')}
          emptyDescription={t('actions.noActionsDesc')}
        />

        <ActionForm onSubmit={handleActionCreate} />
      </div>

      {/* Edit Meeting Form */}
      <MeetingForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        meeting={meeting}
        persons={persons}
        templates={templates}
        onSubmit={async (data) => {
          await updateMeeting(meeting.id, data)
        }}
      />

      {/* Delete Confirmation */}
      <Modal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title={t('meetings.deleteMeeting')}
        description={t('meetings.deleteConfirm')}
      >
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteModalOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
