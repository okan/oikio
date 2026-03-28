import { useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Edit2, Trash2, Calendar, User, ListTodo, Plus, Maximize2 } from 'lucide-react'
import { useMeetingStore, usePersonStore, useTemplateStore, useActionStore } from '@/store'
import {
  actionService,
  meetingService,
  personNoteService,
  talkingPointService,
} from '@/services'
import type { Meeting, ActionItem, PersonNote, TalkingPoint, MeetingMood } from '@/types'
import { Button, Avatar, ConfirmModal, Textarea, PageTransition } from '@/components/ui'
import { MeetingForm, FocusMode, MoodSelector } from '@/components/meeting'
import { ActionList, ActionForm } from '@/components/action'
import { formatDate, formatMeetingTitle } from '@/lib/utils'
export function MeetingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const { fetchMeetingById, updateMeeting, deleteMeeting } = useMeetingStore()
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
  const [focusPrep, setFocusPrep] = useState<{
    notes: PersonNote[]
    talkingPoints: TalkingPoint[]
    otherActions: ActionItem[]
  }>({ notes: [], talkingPoints: [], otherActions: [] })
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      setIsLoading(true)
      const [foundMeeting, meetingActions] = await Promise.all([
        fetchMeetingById(parseInt(id)),
        fetchActionsByMeeting(parseInt(id)),
      ])
      await fetchPersons()
      await fetchTemplates()
      setMeeting(foundMeeting)
      setActions(meetingActions)
      if (foundMeeting) {
        setNextTopics(foundMeeting.nextTopics || '')
        if (searchParams.get('focus') === 'true') {
          setFocusModeOpen(true)
          setSearchParams({})
        }
      }
      setIsLoading(false)
    }
    loadData()
  }, [id, fetchMeetingById, fetchPersons, fetchTemplates, fetchActionsByMeeting, searchParams, setSearchParams])
  const refreshActions = async () => {
    if (!id) return
    const meetingActions = await fetchActionsByMeeting(parseInt(id))
    setActions(meetingActions)
  }
  const loadFocusPrep = useCallback(async () => {
    if (!meeting) return
    const pid = meeting.personId
    const [notes, tps, personMeetings] = await Promise.all([
      personNoteService.getByPerson(pid),
      talkingPointService.getByPerson(pid),
      meetingService.getByPerson(pid),
    ])
    const otherIds = personMeetings.filter((m) => m.id !== meeting.id).map((m) => m.id)
    const lists = await Promise.all(
      otherIds.map(async (mid) => {
        const meetingActions = await actionService.getByMeeting(mid)
        const m = personMeetings.find((x) => x.id === mid)
        return meetingActions.map((a) => ({
          ...a,
          meetingTitle: m ? formatMeetingTitle(m.title, m.date) : a.meetingTitle,
          personName: meeting.personName ?? a.personName,
        }))
      })
    )
    const otherActions = lists.flat().filter((a) => !a.completed)
    setFocusPrep({
      notes,
      talkingPoints: tps.filter((tp) => !tp.completed),
      otherActions,
    })
  }, [meeting])
  useEffect(() => {
    if (focusModeOpen && meeting) {
      loadFocusPrep()
    }
  }, [focusModeOpen, meeting, loadFocusPrep])
  if (isLoading || !meeting) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="animate-pulse space-y-5">
          <div className="h-4 bg-stone-100 rounded w-16" />
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-4">
              <div className="h-48 bg-stone-100 rounded-xl" />
              <div className="h-32 bg-stone-100 rounded-xl" />
            </div>
            <div className="col-span-1">
              <div className="h-64 bg-stone-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  const handleDelete = async () => {
    await deleteMeeting(meeting.id)
    toast.success(t('meetings.deleted'))
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
  const refreshMeeting = async () => {
    if (!id) return
    const updated = await fetchMeetingById(parseInt(id))
    if (updated) {
      setMeeting(updated)
      setNextTopics(updated.nextTopics || '')
    }
  }
  const handleSaveNextTopics = async () => {
    if (!meeting) return
    setIsSavingNextTopics(true)
    try {
      await updateMeeting(meeting.id, { nextTopics: nextTopics.trim() || undefined })
      await refreshMeeting()
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
    await refreshMeeting()
  }
  const handleFocusModeToggle = async (actionId: number) => {
    await toggleComplete(actionId)
    await refreshActions()
  }
  const handleTogglePrepTalkingPoint = async (talkingPointId: number) => {
    await talkingPointService.toggleComplete(talkingPointId)
    await loadFocusPrep()
  }
  const handleMoodChange = async (mood: MeetingMood | undefined) => {
    await updateMeeting(meeting.id, { mood })
    await refreshMeeting()
  }
  return (
    <PageTransition className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t('common.back')}</span>
      </button>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          {meeting.notes && (
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100">
                <Edit2 className="w-3.5 h-3.5 text-stone-400" />
                <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide">{t('meetings.notes')}</h2>
              </div>
              <div className="p-5 prose prose-stone prose-sm max-w-none prose-headings:text-stone-800 prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1.5 prose-p:text-stone-600 prose-p:leading-relaxed prose-li:text-stone-600 prose-li:my-0.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-strong:text-stone-700 prose-a:text-blue-600">
                <ReactMarkdown>{meeting.notes}</ReactMarkdown>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-stone-100">
              <ListTodo className="w-3.5 h-3.5 text-stone-400" />
              <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide">{t('nav.actions')}</h2>
            </div>
            <div className="p-4">
              <ActionList
                actions={actions}
                onToggle={handleToggle}
                onDelete={handleDeleteAction}
                emptyTitle={t('actions.noActions')}
                emptyDescription={t('actions.noActionsDesc')}
              />
              <div className="mt-3">
                <ActionForm onSubmit={handleActionCreate} />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ListTodo className="w-3.5 h-3.5 text-stone-400" />
                <h2 className="text-xs font-medium text-stone-500 uppercase tracking-wide">{t('meetings.nextTopics')}</h2>
              </div>
              {!isEditingNextTopics && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingNextTopics(true)}
                  leftIcon={meeting?.nextTopics ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
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
              <div className="prose prose-stone prose-sm max-w-none">
                <ReactMarkdown>{meeting.nextTopics}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-xs text-stone-400 italic">{t('meetings.noNextTopics')}</p>
            )}
          </div>
        </div>

        <div className="col-span-1 space-y-4">
          <div className="card p-5 sticky top-6">
            <div className="flex flex-col items-center text-center mb-4">
              <Avatar name={meeting.personName || ''} size="lg" className="w-14 h-14 text-lg mb-3" />
              <h1 className="text-base font-semibold text-stone-900">
                {formatMeetingTitle(meeting.title, meeting.date)}
              </h1>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between py-2 px-3 bg-stone-50 rounded-lg">
                <span className="text-xs text-stone-500 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {t('meetings.person')}
                </span>
                <span className="text-xs font-medium text-stone-700">{meeting.personName}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 bg-stone-50 rounded-lg">
                <span className="text-xs text-stone-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t('meetings.date')}
                </span>
                <span className="text-xs font-medium text-stone-700">{formatDate(meeting.date, i18n.language)}</span>
              </div>
            </div>

            <MoodSelector value={meeting.mood} onChange={handleMoodChange} className="mb-4" />

            <div className="space-y-2">
              <Button size="sm" onClick={() => setFocusModeOpen(true)} className="w-full">
                <Maximize2 className="w-3.5 h-3.5 mr-1.5" />
                {t('focusMode.title')}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setEditFormOpen(true)} className="w-full">
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                {t('common.edit')}
              </Button>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      </div>
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
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title={t('meetings.deleteMeeting')}
        description={t('meetings.deleteConfirm')}
        onConfirm={handleDelete}
      />
      {focusModeOpen && (
        <FocusMode
          meeting={meeting}
          actions={actions}
          onClose={async () => {
            setFocusModeOpen(false)
            await refreshMeeting()
            await refreshActions()
          }}
          onSaveNotes={handleFocusModeSaveNotes}
          onAddAction={handleFocusModeAddAction}
          onToggleAction={handleFocusModeToggle}
          prepPersonNotes={focusPrep.notes}
          prepTalkingPoints={focusPrep.talkingPoints}
          prepOtherMeetingActions={focusPrep.otherActions}
          onTogglePrepTalkingPoint={handleTogglePrepTalkingPoint}
          onMoodChange={handleMoodChange}
        />
      )}
    </PageTransition>
  )
}
export default MeetingDetail
