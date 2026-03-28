import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileText } from 'lucide-react'
import { useMeetingStore, usePersonStore, useTemplateStore } from '@/store'
import { Header } from '@/components/layout'
import { MeetingList, MeetingForm } from '@/components/meeting'
import { PageTransition } from '@/components/ui'
import type { Meeting } from '@/types'
export function Meetings() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { meetings, fetchMeetings, createMeeting, updateMeeting } = useMeetingStore()
  const { persons, fetchPersons } = usePersonStore()
  const { templates, fetchTemplates } = useTemplateStore()
  const [meetingFormOpen, setMeetingFormOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [defaultPersonId, setDefaultPersonId] = useState<number | undefined>(undefined)
  useEffect(() => {
    fetchMeetings()
    fetchPersons()
    fetchTemplates()
  }, [fetchMeetings, fetchPersons, fetchTemplates])
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      const personIdParam = searchParams.get('personId')
      if (personIdParam) {
        setDefaultPersonId(parseInt(personIdParam))
      }
      setMeetingFormOpen(true)
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])
  const handleAddMeeting = () => {
    setEditingMeeting(null)
    setDefaultPersonId(undefined)
    setMeetingFormOpen(true)
  }
  const handleMeetingSubmit = async (data: Omit<Meeting, 'id' | 'createdAt'>) => {
    if (editingMeeting) {
      await updateMeeting(editingMeeting.id, data)
      toast.success(t('meetings.updated'))
    } else {
      const newMeeting = await createMeeting(data)
      navigate(`/meetings/${newMeeting.id}?focus=true`)
      return newMeeting
    }
  }
  return (
    <PageTransition className="space-y-6">
      <Header
        title={t('meetings.title')}
        description={t('meetings.description')}
        action={{ label: t('meetings.newMeeting'), onClick: handleAddMeeting }}
        secondaryAction={{
          label: t('nav.templates'),
          onClick: () => navigate('/templates'),
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
        defaultPersonId={defaultPersonId}
        onSubmit={handleMeetingSubmit}
      />
    </PageTransition>
  )
}
export default Meetings
