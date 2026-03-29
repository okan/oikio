import type {
  Person,
  Meeting,
  ActionItem,
  Template,
  DashboardStats,
  MeetingSkip,
  PersonNote,
  TalkingPoint,
} from '../../../src/types'
import { DataStore } from './DataStore'
import { PersonRepository } from './PersonRepository'
import { MeetingRepository } from './MeetingRepository'
import { ActionRepository } from './ActionRepository'
import { TemplateRepository } from './TemplateRepository'
import { MeetingSkipRepository } from './MeetingSkipRepository'
import { PersonNoteRepository } from './PersonNoteRepository'
import { TalkingPointRepository } from './TalkingPointRepository'
import { runSearch } from './searchQuery'
export class DatabaseService {
  private store: DataStore
  private personRepo: PersonRepository
  private meetingRepo: MeetingRepository
  private actionRepo: ActionRepository
  private templateRepo: TemplateRepository
  private meetingSkipRepo: MeetingSkipRepository
  private personNoteRepo: PersonNoteRepository
  private talkingPointRepo: TalkingPointRepository
  constructor() {
    this.store = new DataStore()
    this.personRepo = new PersonRepository(this.store)
    this.meetingRepo = new MeetingRepository(this.store)
    this.actionRepo = new ActionRepository(this.store)
    this.templateRepo = new TemplateRepository(this.store)
    this.meetingSkipRepo = new MeetingSkipRepository(this.store)
    this.personNoteRepo = new PersonNoteRepository(this.store)
    this.talkingPointRepo = new TalkingPointRepository(this.store)
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
    return this.personRepo.delete(
      id,
      this.meetingRepo,
      this.meetingSkipRepo,
      this.personNoteRepo,
      this.talkingPointRepo
    )
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
  addActionProgressNote(id: number, text: string): ActionItem {
    return this.actionRepo.addProgressNote(id, text)
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
  createMeetingSkip(personId: number, reason?: string): MeetingSkip {
    return this.meetingSkipRepo.create(personId, reason)
  }
  getMeetingSkipsByPerson(personId: number): MeetingSkip[] {
    return this.meetingSkipRepo.getByPerson(personId)
  }
  getActiveMeetingSkip(personId: number): MeetingSkip | null {
    return this.meetingSkipRepo.getActive(personId)
  }
  getPersonNotesByPerson(personId: number): PersonNote[] {
    return this.personNoteRepo.getByPerson(personId)
  }
  createPersonNote(data: { personId: number; content: string }): PersonNote {
    return this.personNoteRepo.create(data)
  }
  deletePersonNote(id: number): void {
    this.personNoteRepo.delete(id)
  }
  getTalkingPointsByPerson(personId: number): TalkingPoint[] {
    return this.talkingPointRepo.getByPerson(personId)
  }
  createTalkingPoint(data: { personId: number; content: string }): TalkingPoint {
    return this.talkingPointRepo.create(data)
  }
  toggleTalkingPointComplete(id: number): TalkingPoint {
    return this.talkingPointRepo.toggleComplete(id)
  }
  deleteTalkingPoint(id: number): void {
    this.talkingPointRepo.delete(id)
  }
  getDashboardStats(): DashboardStats {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return {
      totalPersons: this.store.persons.length,
      meetingsThisMonth: this.store.meetings.filter((m) => m.date.startsWith(currentMonth)).length,
      pendingActions: this.store.actionItems.filter((a) => !a.completed).length,
    }
  }
  search(query: string) {
    return runSearch(
      {
        persons: this.store.persons,
        meetings: this.store.meetings,
        actionItems: this.store.actionItems,
      },
      query
    )
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
export { MeetingSkipRepository } from './MeetingSkipRepository'
export { PersonNoteRepository } from './PersonNoteRepository'
export { TalkingPointRepository } from './TalkingPointRepository'
export * from './types'
