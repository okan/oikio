import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Edit2, Trash2, Mail } from 'lucide-react'
import { usePersonStore, useMeetingStore, useTemplateStore } from '@/store'
import type { Person, Meeting } from '@/types'
import { Button, Avatar, Badge, Modal } from '@/components/ui'
import { MeetingList, MeetingForm } from '@/components/meeting'
import { PersonForm } from '@/components/person'

export function PersonDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { persons, fetchPersons, updatePerson, deletePerson } = usePersonStore()
  const { fetchMeetingsByPerson, createMeeting, updateMeeting } = useMeetingStore()
  const { templates, fetchTemplates } = useTemplateStore()

  const [person, setPerson] = useState<Person | null>(null)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [editFormOpen, setEditFormOpen] = useState(false)
  const [meetingFormOpen, setMeetingFormOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!id) return

      await fetchPersons()
      await fetchTemplates()

      const personMeetings = await fetchMeetingsByPerson(parseInt(id))
      setMeetings(personMeetings)
    }

    loadData()
  }, [id, fetchPersons, fetchMeetingsByPerson, fetchTemplates])

  useEffect(() => {
    if (id && persons.length > 0) {
      const foundPerson = persons.find((p) => p.id === parseInt(id))
      setPerson(foundPerson || null)
    }
  }, [id, persons])

  if (!person) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">{t('common.noResults')}</p>
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
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/persons')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('nav.persons')}</span>
      </button>

      {/* Person Header */}
      <div className="card p-6">
        <div className="flex items-start gap-6">
          <Avatar name={person.name} size="lg" className="w-16 h-16 text-xl" />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{person.name}</h1>
              <Badge variant={person.role === 'manager' ? 'primary' : 'default'}>
                {person.role === 'manager' ? t('persons.manager') : t('persons.teammate')}
              </Badge>
            </div>
            {person.email && (
              <p className="text-slate-500 flex items-center gap-2 mt-2">
                <Mail className="w-4 h-4" />
                {person.email}
              </p>
            )}
            {person.notes && <p className="text-slate-600 mt-4">{person.notes}</p>}
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

      {/* Meetings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t('nav.meetings')}</h2>
          <Button
            onClick={() => {
              setEditingMeeting(null)
              setMeetingFormOpen(true)
            }}
          >
            {t('meetings.newMeeting')}
          </Button>
        </div>

        <MeetingList
          meetings={meetings}
          onAddClick={() => {
            setEditingMeeting(null)
            setMeetingFormOpen(true)
          }}
          showPerson={false}
        />
      </div>

      {/* Edit Person Form */}
      <PersonForm
        open={editFormOpen}
        onOpenChange={setEditFormOpen}
        person={person}
        onSubmit={async (data) => {
          await updatePerson(person.id, data)
        }}
      />

      {/* Meeting Form */}
      <MeetingForm
        open={meetingFormOpen}
        onOpenChange={setMeetingFormOpen}
        meeting={editingMeeting}
        persons={persons}
        templates={templates}
        defaultPersonId={person.id}
        onSubmit={handleMeetingSubmit}
      />

      {/* Delete Confirmation */}
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
