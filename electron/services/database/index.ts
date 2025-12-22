import type { Person, Meeting, ActionItem, Template, DashboardStats } from '../../../src/types'
import { DataStore } from './DataStore'
import { PersonRepository } from './PersonRepository'
import { MeetingRepository } from './MeetingRepository'
import { ActionRepository } from './ActionRepository'
import { TemplateRepository } from './TemplateRepository'
export class DatabaseService {
  private store: DataStore
  private personRepo: PersonRepository
  private meetingRepo: MeetingRepository
  private actionRepo: ActionRepository
  private templateRepo: TemplateRepository
  constructor() {
    this.store = new DataStore()
    this.personRepo = new PersonRepository(this.store)
    this.meetingRepo = new MeetingRepository(this.store)
    this.actionRepo = new ActionRepository(this.store)
    this.templateRepo = new TemplateRepository(this.store)
    this.templateRepo.seedDefaults()
    this.meetingRepo.migrateLastMeetingDates(this.personRepo)
    this.store.save()
  }
  getAllPersons(): Person[] {
    return this.personRepo.getAll()
  }
  getPersonById(id: number): Person | null {
    return this.personRepo.getById(id)
  }
  createPerson(data: Omit<Person, 'id' | 'createdAt'>): Person {
    return this.personRepo.create(data)
  }
  updatePerson(id: number, data: Partial<Person>): Person {
    return this.personRepo.update(id, data)
  }
  deletePerson(id: number): void {
    return this.personRepo.delete(id, this.meetingRepo)
  }
  getPersonsNeedingAttention(): Person[] {
    return this.personRepo.getNeedingAttention()
  }
  getAllMeetings(): Meeting[] {
    return this.meetingRepo.getAll()
  }
  getMeetingsByPerson(personId: number): Meeting[] {
    return this.meetingRepo.getByPerson(personId)
  }
  getMeetingById(id: number): Meeting | null {
    return this.meetingRepo.getById(id)
  }
  createMeeting(data: Omit<Meeting, 'id' | 'createdAt'>): Meeting {
    return this.meetingRepo.create(data, this.personRepo)
  }
  updateMeeting(id: number, data: Partial<Meeting>): Meeting {
    return this.meetingRepo.update(id, data, this.personRepo)
  }
  deleteMeeting(id: number): void {
    return this.meetingRepo.delete(id, this.actionRepo, this.personRepo)
  }
  getUpcomingMeetings(days: number): Meeting[] {
    return this.meetingRepo.getUpcoming(days)
  }
  getRecentMeetings(limit: number): Meeting[] {
    return this.meetingRepo.getRecent(limit)
  }
  getAllActionItems(): ActionItem[] {
    return this.actionRepo.getAll()
  }
  getActionItemsByMeeting(meetingId: number): ActionItem[] {
    return this.actionRepo.getByMeeting(meetingId)
  }
  getPendingActionItems(): ActionItem[] {
    return this.actionRepo.getPending()
  }
  createActionItem(data: Omit<ActionItem, 'id' | 'createdAt'>): ActionItem {
    return this.actionRepo.create(data)
  }
  updateActionItem(id: number, data: Partial<ActionItem>): ActionItem {
    return this.actionRepo.update(id, data)
  }
  deleteActionItem(id: number): void {
    return this.actionRepo.delete(id)
  }
  toggleActionItemComplete(id: number): ActionItem {
    return this.actionRepo.toggleComplete(id)
  }
  getAllActionTags(): string[] {
    return this.actionRepo.getAllTags()
  }
  getAllTemplates(): Template[] {
    return this.templateRepo.getAll()
  }
  getTemplateById(id: number): Template | null {
    return this.templateRepo.getById(id)
  }
  createTemplate(data: Omit<Template, 'id'>): Template {
    return this.templateRepo.create(data)
  }
  updateTemplate(id: number, data: Partial<Template>): Template {
    return this.templateRepo.update(id, data)
  }
  deleteTemplate(id: number): void {
    return this.templateRepo.delete(id)
  }
  getDashboardStats(): DashboardStats {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return {
      totalPersons: this.store.persons.length,
      meetingsThisMonth: this.store.meetings.filter((m) => m.date.startsWith(currentMonth)).length,
      pendingActions: this.store.actionItems.filter((a) => !a.completed).length,
    }
  }
  search(query: string): { persons: Person[]; meetings: Meeting[]; actions: ActionItem[] } {
    const lowerQuery = query.toLowerCase()
    const persons = this.store.persons.filter(
      (p) => p.name.toLowerCase().includes(lowerQuery)
    )
    const meetings = this.store.meetings
      .filter(
        (m) =>
          m.title?.toLowerCase().includes(lowerQuery) ||
          m.notes?.toLowerCase().includes(lowerQuery) ||
          m.talkingPoints?.toLowerCase().includes(lowerQuery)
      )
      .map((m) => ({
        ...m,
        personName: this.store.persons.find((p) => p.id === m.personId)?.name,
      }))

    const actions = this.store.actionItems
      .filter(
        (a) =>
          a.description.toLowerCase().includes(lowerQuery) ||
          (a.tags || []).some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
      .map((a) => {
        const meeting = this.store.meetings.find((m) => m.id === a.meetingId)
        const person = meeting ? this.store.persons.find((p) => p.id === meeting.personId) : null
        return {
          ...a,
          meetingTitle: meeting?.title,
          personName: person?.name,
        }
      })

    return { persons, meetings, actions }
  }
  exportData(): string {
    return this.store.exportData()
  }
  importData(jsonData: string): void {
    const defaultTemplates = this.templateRepo.getDefaults()
    this.store.importData(jsonData, defaultTemplates)
  }
  reset(): void {
    this.store.reset()
    this.templateRepo.seedDefaults()
    this.store.save()
  }
}
export { DataStore } from './DataStore'
export { PersonRepository } from './PersonRepository'
export { MeetingRepository } from './MeetingRepository'
export { ActionRepository } from './ActionRepository'
export { TemplateRepository } from './TemplateRepository'
export * from './types'
