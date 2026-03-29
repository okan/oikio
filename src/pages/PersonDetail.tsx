import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { usePersonStore, useMeetingStore, useTemplateStore } from '@/store'
import { actionService, meetingService, meetingSkipService } from '@/services'
import type { Person, Meeting, ActionItem, MeetingSkip } from '@/types'
import { calculateNextMeetingDate, pickDefaultTemplateForPerson } from '@/lib/meetingSchedule'
import { Button, ConfirmModal, PageTransition } from '@/components/ui'
import { MeetingForm } from '@/components/meeting'
import {
  PersonForm,
  PersonDetailHeader,
  PersonPendingActions,
  PersonNotes,
  PersonTalkingPoints,
  PersonMeetingTimeline,
  PersonReportExport,
} from '@/components/person'
export function PersonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { persons, fetchPersons, updatePerson, deletePerson } = usePersonStore()
  const { fetchMeetingsByPerson, createMeeting, updateMeeting } = useMeetingStore()
  const { templates, fetchTemplates } = useTemplateStore()
  const [person, setPerson] = useState<Person | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [actions, setActions] = useState<ActionItem[]>([])
  const [editFormOpen, setEditFormOpen] = useState(false)
  const [meetingFormOpen, setMeetingFormOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [meetingFormDefaults, setMeetingFormDefaults] = useState<{
    date?: string
    templateId?: number
  }>({})
  const [futureMeetings, setFutureMeetings] = useState<Meeting[]>([])
  const [skipHistory, setSkipHistory] = useState<MeetingSkip[]>([])
  const loadActions = useCallback(async () => {
    if (!id || meetings.length === 0) {
      setActions([])
      return
    }
    const lists = await Promise.all(meetings.map((m) => actionService.getByMeeting(m.id)))
    setActions(lists.flat())
  }, [id, meetings])
  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      await fetchPersons()
      await fetchTemplates()
      const [personMeetings, futureMeetingsData] = await Promise.all([
        fetchMeetingsByPerson(parseInt(id)),
        meetingService.getUpcoming(365),
      ])
      setMeetings(personMeetings)
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const personFutureMeetings = futureMeetingsData.filter(m => {
        const meetingDate = new Date(m.date)
        meetingDate.setHours(0, 0, 0, 0)
        return m.personId === parseInt(id) && meetingDate > now
      })
      setFutureMeetings(personFutureMeetings)
      const skips = await meetingSkipService.getByPerson(parseInt(id))
      setSkipHistory(skips)
    }
    loadData()
  }, [id, fetchPersons, fetchMeetingsByPerson, fetchTemplates])
  useEffect(() => {
    if (meetings.length > 0) {
      loadActions()
    }
  }, [meetings, loadActions])
  useEffect(() => {
    if (id && persons.length > 0) {
      const foundPerson = persons.find((p) => p.id === parseInt(id))
      setPerson(foundPerson || null)
    }
  }, [id, persons])
  if (!person) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-500">{t('common.loading')}</p>
      </div>
    )
  }
  const handleDelete = async () => {
    await deletePerson(person.id)
    toast.success(t('persons.deleted'))
    navigate('/persons')
  }
  const handleMeetingSubmit = async (data: Omit<Meeting, 'id' | 'createdAt'>) => {
    if (editingMeeting) {
      await updateMeeting(editingMeeting.id, data)
      const updatedMeetings = await fetchMeetingsByPerson(person.id)
      setMeetings(updatedMeetings)
      await fetchPersons()
    } else {
      const newMeeting = await createMeeting({ ...data, personId: person.id })
      navigate(`/meetings/${newMeeting.id}?focus=true`)
      return newMeeting
    }
  }
  const handleNewMeeting = () => {
    setEditingMeeting(null)
    setMeetingFormDefaults({})
    setMeetingFormOpen(true)
  }
  const handleScheduleNext = () => {
    setEditingMeeting(null)
    const date = calculateNextMeetingDate(person)
    const templateId = pickDefaultTemplateForPerson(person, templates)
    setMeetingFormDefaults({
      date,
      ...(templateId != null ? { templateId } : {}),
    })
    setMeetingFormOpen(true)
  }
  const handleSkip = async () => {
    const skip = await meetingSkipService.create(person.id)
    toast.success(t('skip.success'))
    setSkipHistory((prev) => [skip, ...prev])
    await fetchPersons()
  }
  return (
    <PageTransition className="space-y-5">
      <button
        onClick={() => navigate('/persons')}
        className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>{t('nav.persons')}</span>
      </button>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 space-y-4">
          <PersonPendingActions actions={actions} onActionToggle={loadActions} />
          <PersonNotes personId={person.id} />
          <PersonTalkingPoints personId={person.id} />
          <PersonMeetingTimeline meetings={meetings} onAddClick={handleNewMeeting} />
        </div>

        <div className="col-span-2 space-y-4">
          <PersonDetailHeader
            person={person}
            onEdit={() => setEditFormOpen(true)}
            onNewMeeting={handleNewMeeting}
            onScheduleNext={handleScheduleNext}
            onSkip={handleSkip}
            futureMeeting={futureMeetings[0]}
          />
          {skipHistory.length > 0 && (
            <div className="card p-4">
              <h3 className="text-xs font-medium text-stone-500 mb-3">{t('skip.history')}</h3>
              <div className="space-y-2">
                {skipHistory.slice(0, 5).map((skip) => (
                  <div key={skip.id} className="flex items-center justify-between text-xs">
                    <span className="text-stone-600">
                      {new Date(skip.skippedAt).toLocaleDateString()}
                    </span>
                    <span className="text-stone-400">
                      → {new Date(skip.skippedUntil).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <PersonReportExport
            person={person}
            meetings={meetings}
            actions={actions}
            skips={skipHistory}
          />
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModalOpen(true)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              {t('persons.deletePerson')}
            </Button>
          </div>
        </div>
      </div>
      <PersonForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        person={person}
        onSubmit={async (data) => {
          await updatePerson(person.id, data)
        }}
      />
      <MeetingForm
        open={meetingFormOpen}
        onOpenChange={(open) => {
          setMeetingFormOpen(open)
          if (!open) setMeetingFormDefaults({})
        }}
        meeting={editingMeeting}
        persons={persons}
        templates={templates}
        defaultPersonId={person.id}
        defaultDate={meetingFormDefaults.date}
        defaultTemplateId={meetingFormDefaults.templateId}
        onSubmit={handleMeetingSubmit}
      />
      <ConfirmModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title={t('persons.deletePerson')}
        description={t('persons.deleteConfirm')}
        onConfirm={handleDelete}
      />
    </PageTransition>
  )
}
export default PersonDetail
