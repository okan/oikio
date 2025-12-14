import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import type { Person, Meeting } from '@/types'
import { EmptyState, Button } from '@/components/ui'
import { PersonCard } from './PersonCard'
interface PersonListProps {
  persons: Person[]
  onAddClick: () => void
  futureMeetings?: Meeting[]
}
export function PersonList({ persons, onAddClick, futureMeetings = [] }: PersonListProps) {
  const { t } = useTranslation()
  if (persons.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-12 h-12" />}
        title={t('persons.noPeople')}
        description={t('persons.addFirst')}
        action={<Button onClick={onAddClick}>{t('persons.addFirstButton')}</Button>}
      />
    )
  }
  return (
    <div className="space-y-3">
      {persons.map((person, index) => (
        <PersonCard
          key={person.id}
          person={person}
          index={index}
          futureMeeting={futureMeetings.find(m => {
            const meetingDate = new Date(m.date)
            meetingDate.setHours(0, 0, 0, 0)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            return m.personId === person.id && meetingDate > today
          })}
        />
      ))}
    </div>
  )
}
