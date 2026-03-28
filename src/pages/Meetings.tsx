import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { FileText, Search } from 'lucide-react'
import { useMeetingStore, usePersonStore, useTemplateStore } from '@/store'
import { Header } from '@/components/layout'
import { MeetingList, MeetingForm } from '@/components/meeting'
import { PageTransition, Select } from '@/components/ui'
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
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPersonId, setFilterPersonId] = useState('')
  useEffect(() => {
    fetchMeetings()
    fetchPersons()
    fetchTemplates()
  }, [fetchMeetings, fetchPersons, fetchTemplates])
  const filteredMeetings = useMemo(() => {
    let result = meetings
    if (filterPersonId) {
      result = result.filter((m) => m.personId === parseInt(filterPersonId))
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          (m.title && m.title.toLowerCase().includes(q)) ||
          (m.personName && m.personName.toLowerCase().includes(q))
      )
    }
    return result
  }, [meetings, filterPersonId, searchQuery])
  const personFilterOptions = [
    { value: '', label: t('meetings.allPersons') },
    ...persons.map((p) => ({ value: p.id.toString(), label: p.name })),
  ]
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
      {meetings.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('meetings.searchPlaceholder')}
              className="input pl-9 w-full"
            />
          </div>
          <div className="w-48">
            <Select
              value={filterPersonId}
              onValueChange={setFilterPersonId}
              options={personFilterOptions}
              placeholder={t('meetings.allPersons')}
            />
          </div>
        </div>
      )}
      <MeetingList meetings={filteredMeetings} onAddClick={handleAddMeeting} />
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
