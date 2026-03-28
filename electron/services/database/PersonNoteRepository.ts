import type { PersonNote } from '../../../src/types'
import type { DataStore } from './DataStore'

export class PersonNoteRepository {
  constructor(private store: DataStore) {}

  getByPerson(personId: number): PersonNote[] {
    return this.store.personNotes
      .filter((n) => n.personId === personId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  create(data: { personId: number; content: string }): PersonNote {
    const person = this.store.persons.find((p) => p.id === data.personId)
    if (!person) throw new Error('Person not found')
    const trimmed = data.content.trim()
    if (!trimmed) throw new Error('Note content is required')
    const note: PersonNote = {
      id: this.store.getNextId('personNotes'),
      personId: data.personId,
      content: trimmed,
      createdAt: this.store.getCurrentTimestamp(),
    }
    this.store.personNotes.push(note)
    this.store.save()
    return note
  }

  delete(id: number): void {
    this.store.personNotes = this.store.personNotes.filter((n) => n.id !== id)
    this.store.save()
  }

  deleteByPersonId(personId: number): void {
    this.store.personNotes = this.store.personNotes.filter((n) => n.personId !== personId)
  }
}
