import type { MeetingSkip } from '../../../src/types'
import type { DataStore } from './DataStore'

export class MeetingSkipRepository {
  constructor(private store: DataStore) {}

  create(personId: number, reason?: string): MeetingSkip {
    const person = this.store.persons.find((p) => p.id === personId)
    if (!person) throw new Error('Person not found')

    const frequencyDays: Record<string, number> = {
      weekly: 7,
      biweekly: 14,
      monthly: 30,
      quarterly: 90,
    }
    const days = person.meetingFrequencyGoal
      ? frequencyDays[person.meetingFrequencyGoal] || 30
      : 30

    const now = new Date()
    const skippedUntil = new Date(now)
    skippedUntil.setDate(skippedUntil.getDate() + days)

    const skip: MeetingSkip = {
      id: this.store.getNextId('meetingSkips'),
      personId,
      skippedAt: now.toISOString(),
      skippedUntil: skippedUntil.toISOString().split('T')[0],
      reason,
    }

    this.store.meetingSkips.push(skip)

    const personIndex = this.store.persons.findIndex((p) => p.id === personId)
    if (personIndex !== -1) {
      this.store.persons[personIndex].skippedUntil = skip.skippedUntil
    }

    this.store.save()
    return skip
  }

  getByPerson(personId: number): MeetingSkip[] {
    return this.store.meetingSkips
      .filter((s) => s.personId === personId)
      .sort((a, b) => new Date(b.skippedAt).getTime() - new Date(a.skippedAt).getTime())
  }

  getActive(personId: number): MeetingSkip | null {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return (
      this.store.meetingSkips.find((s) => {
        if (s.personId !== personId) return false
        const until = new Date(s.skippedUntil)
        until.setHours(23, 59, 59, 999)
        return until >= today
      }) || null
    )
  }

  deleteByPersonId(personId: number): void {
    this.store.meetingSkips = this.store.meetingSkips.filter((s) => s.personId !== personId)
  }
}
