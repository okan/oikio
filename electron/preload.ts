import { contextBridge, ipcRenderer } from 'electron'
import type {
  Person,
  Meeting,
  ActionItem,
  Template,
  DashboardStats,
  MeetingSkip,
  PersonNote,
  TalkingPoint,
  SearchResults,
} from '../src/types'
contextBridge.exposeInMainWorld('api', {
  persons: {
    getAll: (): Promise<Person[]> => ipcRenderer.invoke('db:persons:getAll'),
    getById: (id: number): Promise<Person | null> => ipcRenderer.invoke('db:persons:getById', id),
    create: (data: Omit<Person, 'id' | 'createdAt'>): Promise<Person> =>
      ipcRenderer.invoke('db:persons:create', data),
    update: (id: number, data: Partial<Person>): Promise<Person> =>
      ipcRenderer.invoke('db:persons:update', id, data),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('db:persons:delete', id),
    getNeedingAttention: (): Promise<Person[]> => ipcRenderer.invoke('db:persons:needingAttention'),
  },
  meetings: {
    getAll: (): Promise<Meeting[]> => ipcRenderer.invoke('db:meetings:getAll'),
    getByPerson: (personId: number): Promise<Meeting[]> =>
      ipcRenderer.invoke('db:meetings:getByPerson', personId),
    getById: (id: number): Promise<Meeting | null> => ipcRenderer.invoke('db:meetings:getById', id),
    create: (data: Omit<Meeting, 'id' | 'createdAt'>): Promise<Meeting> =>
      ipcRenderer.invoke('db:meetings:create', data),
    update: (id: number, data: Partial<Meeting>): Promise<Meeting> =>
      ipcRenderer.invoke('db:meetings:update', id, data),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('db:meetings:delete', id),
    getUpcoming: (days: number): Promise<Meeting[]> =>
      ipcRenderer.invoke('db:meetings:getUpcoming', days),
    getRecent: (limit: number): Promise<Meeting[]> =>
      ipcRenderer.invoke('db:meetings:getRecent', limit),
  },
  actions: {
    getAll: (): Promise<ActionItem[]> => ipcRenderer.invoke('db:actions:getAll'),
    getByMeeting: (meetingId: number): Promise<ActionItem[]> =>
      ipcRenderer.invoke('db:actions:getByMeeting', meetingId),
    getPending: (): Promise<ActionItem[]> => ipcRenderer.invoke('db:actions:getPending'),
    getAllTags: (): Promise<string[]> => ipcRenderer.invoke('db:actions:getAllTags'),
    create: (data: Omit<ActionItem, 'id' | 'createdAt'>): Promise<ActionItem> =>
      ipcRenderer.invoke('db:actions:create', data),
    update: (id: number, data: Partial<ActionItem>): Promise<ActionItem> =>
      ipcRenderer.invoke('db:actions:update', id, data),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('db:actions:delete', id),
    toggleComplete: (id: number): Promise<ActionItem> =>
      ipcRenderer.invoke('db:actions:toggleComplete', id),
    addProgressNote: (id: number, text: string): Promise<ActionItem> =>
      ipcRenderer.invoke('db:actions:addProgressNote', id, text),
  },
  templates: {
    getAll: (): Promise<Template[]> => ipcRenderer.invoke('db:templates:getAll'),
    getById: (id: number): Promise<Template | null> =>
      ipcRenderer.invoke('db:templates:getById', id),
    create: (data: Omit<Template, 'id'>): Promise<Template> =>
      ipcRenderer.invoke('db:templates:create', data),
    update: (id: number, data: Partial<Template>): Promise<Template> =>
      ipcRenderer.invoke('db:templates:update', id, data),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('db:templates:delete', id),
  },
  stats: {
    getDashboard: (): Promise<DashboardStats> => ipcRenderer.invoke('db:stats:getDashboard'),
  },
  meetingSkips: {
    create: (personId: number, reason?: string): Promise<MeetingSkip> =>
      ipcRenderer.invoke('db:meetingSkips:create', personId, reason),
    getByPerson: (personId: number): Promise<MeetingSkip[]> =>
      ipcRenderer.invoke('db:meetingSkips:getByPerson', personId),
    getActive: (personId: number): Promise<MeetingSkip | null> =>
      ipcRenderer.invoke('db:meetingSkips:getActive', personId),
  },
  personNotes: {
    getByPerson: (personId: number): Promise<PersonNote[]> =>
      ipcRenderer.invoke('db:personNotes:getByPerson', personId),
    create: (data: { personId: number; content: string }): Promise<PersonNote> =>
      ipcRenderer.invoke('db:personNotes:create', data),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('db:personNotes:delete', id),
  },
  talkingPoints: {
    getByPerson: (personId: number): Promise<TalkingPoint[]> =>
      ipcRenderer.invoke('db:talkingPoints:getByPerson', personId),
    create: (data: { personId: number; content: string }): Promise<TalkingPoint> =>
      ipcRenderer.invoke('db:talkingPoints:create', data),
    toggleComplete: (id: number): Promise<TalkingPoint> =>
      ipcRenderer.invoke('db:talkingPoints:toggleComplete', id),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('db:talkingPoints:delete', id),
  },
  data: {
    export: (): Promise<string> => ipcRenderer.invoke('db:export'),
    import: (data: string): Promise<void> => ipcRenderer.invoke('db:import', data),
    reset: (): Promise<void> => ipcRenderer.invoke('db:reset'),
    getPath: (): Promise<string> => ipcRenderer.invoke('db:getPath'),
  },
  search: (query: string): Promise<SearchResults> => ipcRenderer.invoke('db:search', query),
  notifications: {
    getSettings: () => ipcRenderer.invoke('notifications:getSettings'),
    updateSettings: (settings: Record<string, unknown>) =>
      ipcRenderer.invoke('notifications:updateSettings', settings),
    test: () => ipcRenderer.invoke('notifications:test'),
  },
  setLanguage: (lang: string): Promise<void> => ipcRenderer.invoke('app:setLanguage', lang),
})
