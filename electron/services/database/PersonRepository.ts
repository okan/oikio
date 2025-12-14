import type { Person } from '../../../src/types'
import type { DataStore } from './DataStore'
export class PersonRepository {
  constructor(private store: DataStore) {}
  getAll(): Person[] {
    return [...this.store.persons].sort((a, b) => a.name.localeCompare(b.name))
  }
  getById(id: number): Person | null {
    return this.store.persons.find((p) => p.id === id) || null
  }
  create(data: Omit<Person, 'id' | 'createdAt'>): Person {
    const person: Person = {
      id: this.store.getNextId('persons'),
      ...data,
      createdAt: this.store.getCurrentTimestamp(),
    }
    this.store.persons.push(person)
    this.store.save()
    return person
  }
  update(id: number, data: Partial<Person>): Person {
    const index = this.store.persons.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Person not found')
    this.store.persons[index] = { ...this.store.persons[index], ...data }
    this.store.save()
    return this.store.persons[index]
  }
  delete(id: number, meetingRepository: { deleteByPersonId: (personId: number) => void }): void {
    meetingRepository.deleteByPersonId(id)
    this.store.persons = this.store.persons.filter((p) => p.id !== id)
    this.store.save()
  }
  updateLastMeetingDate(personId: number, date: string | undefined): void {
    const index = this.store.persons.findIndex((p) => p.id === personId)
    if (index !== -1) {
      this.store.persons[index].lastMeetingDate = date
    }
  }
  getNeedingAttention(): Person[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thresholds: Record<string, number> = {
      weekly: 7,
      biweekly: 14,
      monthly: 30,
      quarterly: 90,
    }
    return this.store.persons
      .filter((person) => {
        if (!person.meetingFrequencyGoal) return false
        const lastMeeting = person.lastMeetingDate ? new Date(person.lastMeetingDate) : null
        if (!lastMeeting) return true  
        const daysSinceLastMeeting = Math.floor(
          (today.getTime() - lastMeeting.getTime()) / (1000 * 60 * 60 * 24)
        )
        const threshold = thresholds[person.meetingFrequencyGoal] || 30
        return daysSinceLastMeeting >= threshold
      })
      .sort((a, b) => {
        const aLast = a.lastMeetingDate ? new Date(a.lastMeetingDate).getTime() : 0
        const bLast = b.lastMeetingDate ? new Date(b.lastMeetingDate).getTime() : 0
        return aLast - bLast
      })
  }
}
