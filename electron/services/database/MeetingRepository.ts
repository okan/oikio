import type { Meeting } from '../../../src/types'
import type { DataStore } from './DataStore'
import type { PersonRepository } from './PersonRepository'
import type { ActionRepository } from './ActionRepository'
export class MeetingRepository {
  constructor(private store: DataStore) {}
  private getActionStats(meetingId: number): { total: number; completed: number } {
    const actions = this.store.actionItems.filter((a) => a.meetingId === meetingId)
    return {
      total: actions.length,
      completed: actions.filter((a) => a.completed).length,
    }
  }
  private enrichMeeting(meeting: Meeting): Meeting {
    return {
      ...meeting,
      personName: this.store.persons.find((p) => p.id === meeting.personId)?.name,
      actionStats: this.getActionStats(meeting.id),
    }
  }
  getAll(): Meeting[] {
    return [...this.store.meetings]
      .map((m) => this.enrichMeeting(m))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  getByPerson(personId: number): Meeting[] {
    const personName = this.store.persons.find((p) => p.id === personId)?.name
    return this.store.meetings
      .filter((m) => m.personId === personId)
      .map((m) => ({ ...m, personName, actionStats: this.getActionStats(m.id) }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  getById(id: number): Meeting | null {
    const meeting = this.store.meetings.find((m) => m.id === id)
    if (!meeting) return null
    return this.enrichMeeting(meeting)
  }
  create(
    data: Omit<Meeting, 'id' | 'createdAt'>,
    personRepository: PersonRepository
  ): Meeting {
    const meeting: Meeting = {
      id: this.store.getNextId('meetings'),
      ...data,
      createdAt: this.store.getCurrentTimestamp(),
    }
    this.store.meetings.push(meeting)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const meetingDate = new Date(data.date)
    if (meetingDate <= today) {
      const person = this.store.persons.find((p) => p.id === data.personId)
      if (person) {
        const currentLastMeeting = person.lastMeetingDate
        if (!currentLastMeeting || new Date(data.date) > new Date(currentLastMeeting)) {
          personRepository.updateLastMeetingDate(data.personId, data.date)
        }
      }
    }
    this.store.save()
    return this.enrichMeeting(meeting)
  }
  update(
    id: number,
    data: Partial<Meeting>,
    personRepository: PersonRepository
  ): Meeting {
    const index = this.store.meetings.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Meeting not found')
    const meeting = this.store.meetings[index]
    this.store.meetings[index] = { ...meeting, ...data }
    if (data.date) {
      this.recalculateLastMeetingDate(meeting.personId, personRepository)
    }
    this.store.save()
    return this.enrichMeeting(this.store.meetings[index])
  }
  delete(
    id: number,
    actionRepository: ActionRepository,
    personRepository: PersonRepository
  ): void {
    const meeting = this.store.meetings.find((m) => m.id === id)
    const personId = meeting?.personId
    actionRepository.deleteByMeetingId(id)
    this.store.meetings = this.store.meetings.filter((m) => m.id !== id)
    if (personId) {
      this.recalculateLastMeetingDate(personId, personRepository)
    }
    this.store.save()
  }
  deleteByPersonId(personId: number): void {
    const meetingIds = this.store.meetings.filter((m) => m.personId === personId).map((m) => m.id)
    this.store.actionItems = this.store.actionItems.filter((a) => !meetingIds.includes(a.meetingId))
    this.store.meetings = this.store.meetings.filter((m) => m.personId !== personId)
  }
  private recalculateLastMeetingDate(personId: number, personRepository: PersonRepository): void {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const personMeetings = this.store.meetings
      .filter((m) => m.personId === personId)
      .filter((m) => new Date(m.date) <= today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    personRepository.updateLastMeetingDate(personId, personMeetings[0]?.date || undefined)
  }
  getUpcoming(days: number): Meeting[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
    return this.store.meetings
      .filter((m) => {
        const meetingDate = new Date(m.date)
        return meetingDate >= today && meetingDate <= futureDate
      })
      .map((m) => this.enrichMeeting(m))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
  getRecent(limit: number): Meeting[] {
    return [...this.store.meetings]
      .map((m) => this.enrichMeeting(m))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }
  migrateLastMeetingDates(personRepository: PersonRepository): void {
    for (const person of this.store.persons) {
      const personMeetings = this.store.meetings
        .filter((m) => m.personId === person.id)
        .filter((m) => new Date(m.date) <= new Date())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const latestMeeting = personMeetings[0]
      if (latestMeeting) {
        personRepository.updateLastMeetingDate(person.id, latestMeeting.date)
      }
    }
  }
}
