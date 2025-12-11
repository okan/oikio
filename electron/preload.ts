import { contextBridge, ipcRenderer } from 'electron'
import type { Person, Meeting, ActionItem, Template, DashboardStats } from '../src/types'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Person operations
  persons: {
    getAll: (): Promise<Person[]> => ipcRenderer.invoke('db:persons:getAll'),
    getById: (id: number): Promise<Person | null> => ipcRenderer.invoke('db:persons:getById', id),
    create: (data: Omit<Person, 'id' | 'createdAt'>): Promise<Person> =>
      ipcRenderer.invoke('db:persons:create', data),
    update: (id: number, data: Partial<Person>): Promise<Person> =>
      ipcRenderer.invoke('db:persons:update', id, data),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('db:persons:delete', id),
  },

  // Meeting operations
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

  // Action item operations
  actions: {
    getAll: (): Promise<ActionItem[]> => ipcRenderer.invoke('db:actions:getAll'),
    getByMeeting: (meetingId: number): Promise<ActionItem[]> =>
      ipcRenderer.invoke('db:actions:getByMeeting', meetingId),
    getPending: (): Promise<ActionItem[]> => ipcRenderer.invoke('db:actions:getPending'),
    create: (data: Omit<ActionItem, 'id' | 'createdAt'>): Promise<ActionItem> =>
      ipcRenderer.invoke('db:actions:create', data),
    update: (id: number, data: Partial<ActionItem>): Promise<ActionItem> =>
      ipcRenderer.invoke('db:actions:update', id, data),
    delete: (id: number): Promise<void> => ipcRenderer.invoke('db:actions:delete', id),
    toggleComplete: (id: number): Promise<ActionItem> =>
      ipcRenderer.invoke('db:actions:toggleComplete', id),
  },

  // Template operations
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

  // Stats
  stats: {
    getDashboard: (): Promise<DashboardStats> => ipcRenderer.invoke('db:stats:getDashboard'),
  },

  // Export/Import
  data: {
    export: (): Promise<string> => ipcRenderer.invoke('db:export'),
    import: (data: string): Promise<void> => ipcRenderer.invoke('db:import', data),
  },

  // Search
  search: (query: string): Promise<{ persons: Person[]; meetings: Meeting[] }> =>
    ipcRenderer.invoke('db:search', query),
})

