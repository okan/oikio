import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMeetingStore, usePersonStore, useTemplateStore } from '@/store'
import { Header } from '@/components/layout'
import { MeetingList, MeetingForm } from '@/components/meeting'
import type { Meeting } from '@/types'

export function Meetings() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { meetings, fetchMeetings, createMeeting, updateMeeting } = useMeetingStore()
  const { persons, fetchPersons } = usePersonStore()
  const { templates, fetchTemplates } = useTemplateStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)

  useEffect(() => {
    fetchMeetings()
    fetchPersons()
    fetchTemplates()
  }, [fetchMeetings, fetchPersons, fetchTemplates])

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setFormOpen(true)
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])

  const handleAdd = () => {
    setEditingMeeting(null)
    setFormOpen(true)
  }

  const handleSubmit = async (data: Omit<Meeting, 'id' | 'createdAt'>) => {
    if (editingMeeting) {
      await updateMeeting(editingMeeting.id, data)
    } else {
      await createMeeting(data)
    }
  }

  return (
    <div className="space-y-6">
      <Header
        title={t('meetings.title')}
        description={t('meetings.description')}
        action={{ label: t('meetings.newMeeting'), onClick: handleAdd }}
      />

      <MeetingList meetings={meetings} onAddClick={handleAdd} />

      <MeetingForm
        open={formOpen}
        onOpenChange={setFormOpen}
        meeting={editingMeeting}
        persons={persons}
        templates={templates}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
