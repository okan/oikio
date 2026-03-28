import type {
  Person,
  Meeting,
  ActionItem,
  Template,
  MeetingSkip,
  PersonNote,
} from '@/types'
export const personService = {
  getAll: (): Promise<Person[]> => window.api.persons.getAll(),
  getById: (id: number): Promise<Person | null> => window.api.persons.getById(id),
  create: (data: Omit<Person, 'id' | 'createdAt'>): Promise<Person> => window.api.persons.create(data),
  update: (id: number, data: Partial<Person>): Promise<Person> => window.api.persons.update(id, data),
  delete: (id: number): Promise<void> => window.api.persons.delete(id),
  getNeedingAttention: (): Promise<Person[]> => window.api.persons.getNeedingAttention(),
}
export const meetingService = {
  getAll: (): Promise<Meeting[]> => window.api.meetings.getAll(),
  getByPerson: (personId: number): Promise<Meeting[]> => window.api.meetings.getByPerson(personId),
  getById: (id: number): Promise<Meeting | null> => window.api.meetings.getById(id),
  create: (data: Omit<Meeting, 'id' | 'createdAt'>): Promise<Meeting> => window.api.meetings.create(data),
  update: (id: number, data: Partial<Meeting>): Promise<Meeting> => window.api.meetings.update(id, data),
  delete: (id: number): Promise<void> => window.api.meetings.delete(id),
  getUpcoming: (days: number = 7): Promise<Meeting[]> => window.api.meetings.getUpcoming(days),
  getRecent: (limit: number = 5): Promise<Meeting[]> => window.api.meetings.getRecent(limit),
}
export const actionService = {
  getAll: (): Promise<ActionItem[]> => window.api.actions.getAll(),
  getByMeeting: (meetingId: number): Promise<ActionItem[]> => window.api.actions.getByMeeting(meetingId),
  getPending: (): Promise<ActionItem[]> => window.api.actions.getPending(),
  getAllTags: (): Promise<string[]> => window.api.actions.getAllTags(),
  create: (data: Omit<ActionItem, 'id' | 'createdAt'>): Promise<ActionItem> => window.api.actions.create(data),
  update: (id: number, data: Partial<ActionItem>): Promise<ActionItem> => window.api.actions.update(id, data),
  delete: (id: number): Promise<void> => window.api.actions.delete(id),
  toggleComplete: (id: number): Promise<ActionItem> => window.api.actions.toggleComplete(id),
}
export const templateService = {
  getAll: (): Promise<Template[]> => window.api.templates.getAll(),
  getById: (id: number): Promise<Template | null> => window.api.templates.getById(id),
  create: (data: Omit<Template, 'id'>): Promise<Template> => window.api.templates.create(data),
  update: (id: number, data: Partial<Template>): Promise<Template> => window.api.templates.update(id, data),
  delete: (id: number): Promise<void> => window.api.templates.delete(id),
}
export const meetingSkipService = {
  create: (personId: number, reason?: string): Promise<MeetingSkip> =>
    window.api.meetingSkips.create(personId, reason),
  getByPerson: (personId: number): Promise<MeetingSkip[]> =>
    window.api.meetingSkips.getByPerson(personId),
  getActive: (personId: number): Promise<MeetingSkip | null> =>
    window.api.meetingSkips.getActive(personId),
}
export const personNoteService = {
  getByPerson: (personId: number): Promise<PersonNote[]> =>
    window.api.personNotes.getByPerson(personId),
  create: (data: { personId: number; content: string }): Promise<PersonNote> =>
    window.api.personNotes.create(data),
  delete: (id: number): Promise<void> => window.api.personNotes.delete(id),
}
