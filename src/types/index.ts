export type PersonRole = 'manager' | 'teammate'
export type MeetingFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly'
export interface Person {
  id: number
  name: string
  role: PersonRole
  notes?: string
  title?: string
  goals?: string
  meetingFrequencyGoal?: MeetingFrequency
  lastMeetingDate?: string
  skippedUntil?: string
  createdAt: string
}
export interface MeetingSkip {
  id: number
  personId: number
  skippedAt: string
  skippedUntil: string
  reason?: string
}
export interface PersonNote {
  id: number
  personId: number
  content: string
  createdAt: string
}
export interface TalkingPoint {
  id: number
  personId: number
  content: string
  completed: boolean
  createdAt: string
}
export type MeetingMood = 1 | 2 | 3 | 4 | 5
export interface RelationshipHealth {
  score: number
  status: 'good' | 'warning' | 'critical' | 'neutral'
  daysSinceLastMeeting: number | null
  isOverdue: boolean
  isSkipped: boolean
  daysOverdue: number
}
export interface Meeting {
  id: number
  personId: number
  personName?: string
  templateId?: number
  date: string
  title?: string
  notes?: string
  talkingPoints?: string
  nextTopics?: string
  mood?: MeetingMood
  createdAt: string
  actionStats?: {
    total: number
    completed: number
  }
}
export interface ActionProgressNote {
  id: number
  text: string
  createdAt: string
}
export interface ActionItem {
  id: number
  meetingId: number
  meetingTitle?: string
  personName?: string
  description: string
  tags?: string[]
  dueDate?: string
  assignedTo?: 'me' | 'other'
  completed: boolean
  createdAt: string
  progressNotes?: ActionProgressNote[]
}
export type TemplateCategory = 'manager' | 'teammate' | 'general'
export interface Template {
  id: number
  name: string
  description?: string
  content: string
  category: TemplateCategory
  isDefault: boolean
}
export interface DashboardStats {
  totalPersons: number
  meetingsThisMonth: number
  pendingActions: number
}
export type SearchPersonHit = Person & { searchSnippet?: string }
export type SearchMeetingHit = Meeting & { searchSnippet?: string }
export type SearchActionHit = ActionItem & { searchSnippet?: string }
export type SearchResults = {
  persons: SearchPersonHit[]
  meetings: SearchMeetingHit[]
  actions: SearchActionHit[]
}
export interface ElectronAPI {
  persons: {
    getAll: () => Promise<Person[]>
    getById: (id: number) => Promise<Person | null>
    create: (data: Omit<Person, 'id' | 'createdAt'>) => Promise<Person>
    update: (id: number, data: Partial<Person>) => Promise<Person>
    delete: (id: number) => Promise<void>
    getNeedingAttention: () => Promise<Person[]>
  }
  meetings: {
    getAll: () => Promise<Meeting[]>
    getByPerson: (personId: number) => Promise<Meeting[]>
    getById: (id: number) => Promise<Meeting | null>
    create: (data: Omit<Meeting, 'id' | 'createdAt'>) => Promise<Meeting>
    update: (id: number, data: Partial<Meeting>) => Promise<Meeting>
    delete: (id: number) => Promise<void>
    getUpcoming: (days: number) => Promise<Meeting[]>
    getRecent: (limit: number) => Promise<Meeting[]>
  }
  actions: {
    getAll: () => Promise<ActionItem[]>
    getByMeeting: (meetingId: number) => Promise<ActionItem[]>
    getPending: () => Promise<ActionItem[]>
    getAllTags: () => Promise<string[]>
    create: (data: Omit<ActionItem, 'id' | 'createdAt'>) => Promise<ActionItem>
    update: (id: number, data: Partial<ActionItem>) => Promise<ActionItem>
    delete: (id: number) => Promise<void>
    toggleComplete: (id: number) => Promise<ActionItem>
    addProgressNote: (id: number, text: string) => Promise<ActionItem>
  }
  templates: {
    getAll: () => Promise<Template[]>
    getById: (id: number) => Promise<Template | null>
    create: (data: Omit<Template, 'id'>) => Promise<Template>
    update: (id: number, data: Partial<Template>) => Promise<Template>
    delete: (id: number) => Promise<void>
  }
  stats: {
    getDashboard: () => Promise<{ totalPersons: number; meetingsThisMonth: number; pendingActions: number }>
  }
  meetingSkips: {
    create: (personId: number, reason?: string) => Promise<MeetingSkip>
    getByPerson: (personId: number) => Promise<MeetingSkip[]>
    getActive: (personId: number) => Promise<MeetingSkip | null>
  }
  personNotes: {
    getByPerson: (personId: number) => Promise<PersonNote[]>
    create: (data: { personId: number; content: string }) => Promise<PersonNote>
    delete: (id: number) => Promise<void>
  }
  talkingPoints: {
    getByPerson: (personId: number) => Promise<TalkingPoint[]>
    create: (data: { personId: number; content: string }) => Promise<TalkingPoint>
    toggleComplete: (id: number) => Promise<TalkingPoint>
    delete: (id: number) => Promise<void>
  }
  data: {
    export: () => Promise<string>
    import: (data: string) => Promise<void>
    reset: () => Promise<void>
    getPath: () => Promise<string>
  }
  search: (query: string) => Promise<SearchResults>
  setLanguage: (lang: string) => Promise<void>
  notifications: {
    getSettings: () => Promise<NotificationSettings>
    updateSettings: (settings: Partial<NotificationSettings>) => Promise<NotificationSettings>
    test: () => Promise<void>
  }
}
export interface NotificationSettings {
  enabled: boolean
  meetingReminders: boolean
  actionReminders: boolean
  reminderHoursBefore: number
}
declare global {
  interface Window {
    api: ElectronAPI
  }
}
