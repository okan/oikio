import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'
import type { Meeting } from '@/types'
import { EmptyState, Button } from '@/components/ui'
import { MeetingCard } from './MeetingCard'

interface MeetingListProps {
  meetings: Meeting[]
  onAddClick: () => void
  showPerson?: boolean
}

export function MeetingList({ meetings, onAddClick, showPerson = true }: MeetingListProps) {
  const { t } = useTranslation()

  if (meetings.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="w-12 h-12" />}
        title={t('meetings.noMeetings')}
        description={t('meetings.createFirst')}
        action={<Button onClick={onAddClick}>{t('meetings.createFirstButton')}</Button>}
      />
    )
  }

  return (
    <div className="space-y-3">
      {meetings.map((meeting, index) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          index={index}
          showPerson={showPerson}
        />
      ))}
    </div>
  )
}
