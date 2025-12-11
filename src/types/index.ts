export type PersonRole = 'manager' | 'teammate'

export interface Person {
  id: number
  name: string
  role: PersonRole
  email?: string
  notes?: string
  createdAt: string
}

export interface Meeting {
  id: number
  personId: number
  personName?: string
  templateId?: number
  date: string
  title: string
  notes?: string
  talkingPoints?: string
  nextTopics?: string
  createdAt: string
  actionStats?: {
    total: number
    completed: number
  }
}

export interface ActionItem {
  id: number
  meetingId: number
  meetingTitle?: string
  personName?: string
  description: string
  assignee?: string
  dueDate?: string
  completed: boolean
  createdAt: string
}

export interface Template {
  id: number
  name: string
  description?: string
  content: string
  isDefault: boolean
}

export interface DashboardStats {
  totalPersons: number
  meetingsThisMonth: number
  pendingActions: number
}

// API interface exposed via preload
export interface ElectronAPI {
  persons: {
    getAll: () => Promise<Person[]>
    getById: (id: number) => Promise<Person | null>
    create: (data: Omit<Person, 'id' | 'createdAt'>) => Promise<Person>
    update: (id: number, data: Partial<Person>) => Promise<Person>
    delete: (id: number) => Promise<void>
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
    create: (data: Omit<ActionItem, 'id' | 'createdAt'>) => Promise<ActionItem>
    update: (id: number, data: Partial<ActionItem>) => Promise<ActionItem>
    delete: (id: number) => Promise<void>
    toggleComplete: (id: number) => Promise<ActionItem>
  }
  templates: {
    getAll: () => Promise<Template[]>
    getById: (id: number) => Promise<Template | null>
    create: (data: Omit<Template, 'id'>) => Promise<Template>
    update: (id: number, data: Partial<Template>) => Promise<Template>
    delete: (id: number) => Promise<void>
  }
  stats: {
    getDashboard: () => Promise<DashboardStats>
  }
  data: {
    export: () => Promise<string>
    import: (data: string) => Promise<void>
  }
  search: (query: string) => Promise<{ persons: Person[]; meetings: Meeting[] }>
}

declare global {
  interface Window {
    api: ElectronAPI
  }
}

