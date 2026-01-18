import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Edit2, Trash2, Calendar, User, ListTodo, Plus, Maximize2 } from 'lucide-react'
import { useMeetingStore, usePersonStore, useTemplateStore, useActionStore } from '@/store'
import type { Meeting, ActionItem } from '@/types'
import { Button, Avatar, Modal, Textarea } from '@/components/ui'
import { MeetingForm, FocusMode } from '@/components/meeting'
import { ActionList, ActionForm } from '@/components/action'
import { formatDate, formatMeetingTitle } from '@/lib/utils'
export function MeetingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t } = useTranslation()
  const { meetings, fetchMeetings, updateMeeting, deleteMeeting } = useMeetingStore()
  const { persons, fetchPersons } = usePersonStore()
  const { templates, fetchTemplates } = useTemplateStore()
  const { fetchActionsByMeeting, createAction, toggleComplete, deleteAction } = useActionStore()
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [actions, setActions] = useState<ActionItem[]>([])
  const [editFormOpen, setEditFormOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [nextTopics, setNextTopics] = useState('')
  const [isEditingNextTopics, setIsEditingNextTopics] = useState(false)
  const [isSavingNextTopics, setIsSavingNextTopics] = useState(false)
  const [focusModeOpen, setFocusModeOpen] = useState(false)
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
      if (foundMeeting) {
        setNextTopics(foundMeeting.nextTopics || '')
        if (searchParams.get('focus') === 'true') {
          setFocusModeOpen(true)
          setSearchParams({})
        }
      }
    }
  }, [id, meetings, searchParams, setSearchParams])
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
    tags?: string[]
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
  const handleSaveNextTopics = async () => {
    if (!meeting) return
    setIsSavingNextTopics(true)
    try {
      await updateMeeting(meeting.id, { nextTopics: nextTopics.trim() || undefined })
      setIsEditingNextTopics(false)
    } catch (error) {
      console.error('Error saving next topics:', error)
    } finally {
      setIsSavingNextTopics(false)
    }
  }
  const handleCancelNextTopics = () => {
    setNextTopics(meeting?.nextTopics || '')
    setIsEditingNextTopics(false)
  }
  const handleFocusModeAddAction = async (description: string) => {
    await createAction({
      meetingId: meeting!.id,
      description,
      completed: false,
    })
    await refreshActions()
  }
  const handleFocusModeSaveNotes = async (notes: string) => {
    if (!meeting) return
    await updateMeeting(meeting.id, { notes })
  }
  const handleFocusModeToggle = async (actionId: number) => {
    await toggleComplete(actionId)
    await refreshActions()
  }
  return (
    <div className="space-y-6">
      { }
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('common.back')}</span>
      </button>
      { }
      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Avatar name={meeting.personName || ''} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{formatMeetingTitle(meeting.title, meeting.date)}</h1>
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
              variant="primary"
              onClick={() => setFocusModeOpen(true)}
              leftIcon={<Maximize2 className="w-4 h-4" />}
            >
              {t('focusMode.title')}
            </Button>
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
      { }
      {meeting.notes && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('meetings.notes')}</h2>
          <div className="prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-li:text-slate-700 prose-strong:text-slate-900">
            <ReactMarkdown>{meeting.notes}</ReactMarkdown>
          </div>
        </div>
      )}
      { }
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
      { }
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-slate-900">{t('meetings.nextTopics')}</h2>
          </div>
          {!isEditingNextTopics && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingNextTopics(true)}
              leftIcon={meeting?.nextTopics ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            >
              {meeting?.nextTopics ? t('common.edit') : t('common.add')}
            </Button>
          )}
        </div>
        {isEditingNextTopics ? (
          <div className="space-y-3">
            <Textarea
              value={nextTopics}
              onChange={(e) => setNextTopics(e.target.value)}
              placeholder={t('meetings.nextTopicsPlaceholder')}
              rows={4}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" size="sm" onClick={handleCancelNextTopics}>
                {t('common.cancel')}
              </Button>
              <Button size="sm" onClick={handleSaveNextTopics} isLoading={isSavingNextTopics}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        ) : meeting?.nextTopics ? (
          <div className="prose prose-slate prose-sm max-w-none">
            <ReactMarkdown>{meeting.nextTopics}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">{t('meetings.noNextTopics')}</p>
        )}
      </div>
      { }
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
      { }
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
      { }
      {focusModeOpen && (
        <FocusMode
          meeting={meeting}
          actions={actions}
          onClose={() => setFocusModeOpen(false)}
          onSaveNotes={handleFocusModeSaveNotes}
          onAddAction={handleFocusModeAddAction}
          onToggleAction={handleFocusModeToggle}
        />
      )}
    </div>
  )
}
export default MeetingDetail
