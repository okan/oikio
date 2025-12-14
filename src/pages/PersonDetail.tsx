import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { usePersonStore, useMeetingStore, useTemplateStore } from '@/store'
import type { Person, Meeting, ActionItem } from '@/types'
import { Button, Modal } from '@/components/ui'
import { MeetingForm } from '@/components/meeting'
import {
  PersonForm,
  PersonDetailHeader,
  PersonPendingActions,
  PersonMeetingTimeline,
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
  const [futureMeetings, setFutureMeetings] = useState<Meeting[]>([])
  const loadActions = useCallback(async () => {
    if (!id) return
    const allActions = await window.api.actions.getAll()
    const meetingIds = meetings.map((m) => m.id)
    const personActions = allActions.filter((a) => meetingIds.includes(a.meetingId))
    setActions(personActions)
  }, [id, meetings])
  useEffect(() => {
    const loadData = async () => {
      if (!id) return
      await fetchPersons()
      await fetchTemplates()
      const [personMeetings, futureMeetingsData] = await Promise.all([
        fetchMeetingsByPerson(parseInt(id)),
        window.api.meetings.getUpcoming(365),
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
        <p className="text-slate-500">{t('common.loading')}</p>
      </div>
    )
  }
  const handleDelete = async () => {
    await deletePerson(person.id)
    navigate('/persons')
  }
  const handleMeetingSubmit = async (data: Omit<Meeting, 'id' | 'createdAt'>) => {
    if (editingMeeting) {
      await updateMeeting(editingMeeting.id, data)
    } else {
      await createMeeting({ ...data, personId: person.id })
    }
    const updatedMeetings = await fetchMeetingsByPerson(person.id)
    setMeetings(updatedMeetings)
    await fetchPersons()
  }
  const handleNewMeeting = () => {
    setEditingMeeting(null)
    setMeetingFormOpen(true)
  }
  return (
    <div className="space-y-6">
      { }
      <button
        onClick={() => navigate('/persons')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('nav.persons')}</span>
      </button>
      { }
      <PersonDetailHeader
        person={person}
        onEdit={() => setEditFormOpen(true)}
        onNewMeeting={handleNewMeeting}
        futureMeeting={futureMeetings[0]}
      />
      { }
      <PersonPendingActions actions={actions} onActionToggle={loadActions} />
      { }
      <PersonMeetingTimeline meetings={meetings} onAddClick={handleNewMeeting} />
      { }
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteModalOpen(true)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {t('persons.deletePerson')}
        </Button>
      </div>
      { }
      <PersonForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        person={person}
        onSubmit={async (data) => {
          await updatePerson(person.id, data)
        }}
      />
      { }
      <MeetingForm
        open={meetingFormOpen}
        onOpenChange={setMeetingFormOpen}
        meeting={editingMeeting}
        persons={persons}
        templates={templates}
        defaultPersonId={person.id}
        onSubmit={handleMeetingSubmit}
      />
      { }
      <Modal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        title={t('persons.deletePerson')}
        description={t('persons.deleteConfirm')}
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
export default PersonDetail
