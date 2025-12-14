import type {
  Person,
  Meeting,
  ActionItem,
  Template,
  DashboardStats,
  NotificationSettings,
} from '@/types'
export const personService = {
  getAll: (): Promise<Person[]> => {
    return window.api.persons.getAll()
  },
  getById: (id: number): Promise<Person | null> => {
    return window.api.persons.getById(id)
  },
  create: (data: Omit<Person, 'id' | 'createdAt'>): Promise<Person> => {
    return window.api.persons.create(data)
  },
  update: (id: number, data: Partial<Person>): Promise<Person> => {
    return window.api.persons.update(id, data)
  },
  delete: (id: number): Promise<void> => {
    return window.api.persons.delete(id)
  },
  getNeedingAttention: (): Promise<Person[]> => {
    return window.api.persons.getNeedingAttention()
  },
}
export const meetingService = {
  getAll: (): Promise<Meeting[]> => {
    return window.api.meetings.getAll()
  },
  getByPerson: (personId: number): Promise<Meeting[]> => {
    return window.api.meetings.getByPerson(personId)
  },
  getById: (id: number): Promise<Meeting | null> => {
    return window.api.meetings.getById(id)
  },
  create: (data: Omit<Meeting, 'id' | 'createdAt'>): Promise<Meeting> => {
    return window.api.meetings.create(data)
  },
  update: (id: number, data: Partial<Meeting>): Promise<Meeting> => {
    return window.api.meetings.update(id, data)
  },
  delete: (id: number): Promise<void> => {
    return window.api.meetings.delete(id)
  },
  getUpcoming: (days: number = 7): Promise<Meeting[]> => {
    return window.api.meetings.getUpcoming(days)
  },
  getRecent: (limit: number = 5): Promise<Meeting[]> => {
    return window.api.meetings.getRecent(limit)
  },
}
export const actionService = {
  getAll: (): Promise<ActionItem[]> => {
    return window.api.actions.getAll()
  },
  getByMeeting: (meetingId: number): Promise<ActionItem[]> => {
    return window.api.actions.getByMeeting(meetingId)
  },
  getPending: (): Promise<ActionItem[]> => {
    return window.api.actions.getPending()
  },
  create: (data: Omit<ActionItem, 'id' | 'createdAt'>): Promise<ActionItem> => {
    return window.api.actions.create(data)
  },
  update: (id: number, data: Partial<ActionItem>): Promise<ActionItem> => {
    return window.api.actions.update(id, data)
  },
  delete: (id: number): Promise<void> => {
    return window.api.actions.delete(id)
  },
  toggleComplete: (id: number): Promise<ActionItem> => {
    return window.api.actions.toggleComplete(id)
  },
}
export const templateService = {
  getAll: (): Promise<Template[]> => {
    return window.api.templates.getAll()
  },
  getById: (id: number): Promise<Template | null> => {
    return window.api.templates.getById(id)
  },
  create: (data: Omit<Template, 'id'>): Promise<Template> => {
    return window.api.templates.create(data)
  },
  update: (id: number, data: Partial<Template>): Promise<Template> => {
    return window.api.templates.update(id, data)
  },
  delete: (id: number): Promise<void> => {
    return window.api.templates.delete(id)
  },
}
export const statsService = {
  getDashboard: (): Promise<DashboardStats> => {
    return window.api.stats.getDashboard()
  },
}
export const dataService = {
  export: (): Promise<string> => {
    return window.api.data.export()
  },
  import: (data: string): Promise<void> => {
    return window.api.data.import(data)
  },
  reset: (): Promise<void> => {
    return window.api.data.reset()
  },
}
export const searchService = {
  search: (query: string): Promise<{ persons: Person[]; meetings: Meeting[] }> => {
    return window.api.search(query)
  },
}
export const notificationService = {
  getSettings: (): Promise<NotificationSettings> => {
    return window.api.notifications.getSettings()
  },
  updateSettings: (settings: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    return window.api.notifications.updateSettings(settings)
  },
  test: (): Promise<void> => {
    return window.api.notifications.test()
  },
}
export const api = {
  persons: personService,
  meetings: meetingService,
  actions: actionService,
  templates: templateService,
  stats: statsService,
  data: dataService,
  search: searchService,
  notifications: notificationService,
}
export default api
