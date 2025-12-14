import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePersonStore } from '@/store'
import { Header } from '@/components/layout'
import { PersonList, PersonForm } from '@/components/person'
import type { Person, Meeting } from '@/types'
export function Persons() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { persons, fetchPersons, createPerson, updatePerson } = usePersonStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const [futureMeetings, setFutureMeetings] = useState<Meeting[]>([])
  useEffect(() => {
    fetchPersons()
    window.api.meetings.getUpcoming(365).then(setFutureMeetings)
  }, [fetchPersons])
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setFormOpen(true)
      setSearchParams({})
    }
  }, [searchParams, setSearchParams])
  const handleAdd = () => {
    setEditingPerson(null)
    setFormOpen(true)
  }
  const handleSubmit = async (data: Omit<Person, 'id' | 'createdAt'>) => {
    if (editingPerson) {
      await updatePerson(editingPerson.id, data)
    } else {
      await createPerson(data)
    }
  }
  return (
    <div className="space-y-6">
      <Header
        title={t('persons.title')}
        description={t('persons.description')}
        action={{ label: t('persons.newPerson'), onClick: handleAdd }}
      />
      <PersonList persons={persons} onAddClick={handleAdd} futureMeetings={futureMeetings} />
      <PersonForm
        open={formOpen}
        onOpenChange={setFormOpen}
        person={editingPerson}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
export default Persons
