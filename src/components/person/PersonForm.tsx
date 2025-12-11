import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { Person, PersonRole } from '@/types'
import { Button, Input, Textarea, Select, Modal } from '@/components/ui'

interface PersonFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person?: Person | null
  onSubmit: (data: Omit<Person, 'id' | 'createdAt'>) => Promise<void>
}

export function PersonForm({ open, onOpenChange, person, onSubmit }: PersonFormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [role, setRole] = useState<PersonRole>('teammate')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const roleOptions = [
    { value: 'manager', label: t('persons.manager') },
    { value: 'teammate', label: t('persons.teammate') },
  ]

  useEffect(() => {
    if (person) {
      setName(person.name)
      setRole(person.role)
      setEmail(person.email || '')
      setNotes(person.notes || '')
    } else {
      setName('')
      setRole('teammate')
      setEmail('')
      setNotes('')
    }
    setErrors({})
  }, [person, open])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = t('persons.name') + ' required'
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        role,
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving person:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={person ? t('persons.editPerson') : t('persons.addPerson')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('persons.name')}
          placeholder={t('persons.namePlaceholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoFocus
        />

        <Select
          label={t('persons.role')}
          value={role}
          onValueChange={(value) => setRole(value as PersonRole)}
          options={roleOptions}
        />

        <Input
          label={t('persons.email')}
          type="email"
          placeholder={t('persons.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <Textarea
          label={t('persons.notes')}
          placeholder={t('persons.notesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {person ? t('common.save') : t('common.add')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
