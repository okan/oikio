import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import type { Person } from '@/types'
import { EmptyState, Button } from '@/components/ui'
import { PersonCard } from './PersonCard'

interface PersonListProps {
  persons: Person[]
  onAddClick: () => void
}

export function PersonList({ persons, onAddClick }: PersonListProps) {
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
        <PersonCard key={person.id} person={person} index={index} />
      ))}
    </div>
  )
}
