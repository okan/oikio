import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import type { DatabaseData, EntityType } from './types'
import { defaultData } from './types'
import type { PersonNote } from '../../../src/types'
export class DataStore {
  private data: DatabaseData
  private dbPath: string
  private saveDebounceTimer: NodeJS.Timeout | null = null
  constructor() {
    const userDataPath = app.getPath('userData')
    this.dbPath = path.join(userDataPath, 'oikio-data.json')
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }
    this.data = this.loadData()
  }
  private loadData(): DatabaseData {
    if (fs.existsSync(this.dbPath)) {
      try {
        const content = fs.readFileSync(this.dbPath, 'utf-8')
        const data = JSON.parse(content) as DatabaseData
        if (!Array.isArray(data.personNotes)) {
          data.personNotes = []
        }
        if (!data.meta?.lastId) {
          data.meta = structuredClone(defaultData.meta)
        } else {
          data.meta.lastId = { ...defaultData.meta.lastId, ...data.meta.lastId }
        }
        if (typeof data.meta.lastId.personNotes !== 'number') {
          data.meta.lastId.personNotes = data.personNotes.length
            ? Math.max(0, ...data.personNotes.map((n: PersonNote) => n.id))
            : 0
        }
        return data
      } catch {
        return structuredClone(defaultData)
      }
    }
    return structuredClone(defaultData)
  }
  save(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer)
    }
    this.saveDebounceTimer = setTimeout(() => {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8')
      this.saveDebounceTimer = null
    }, 100)
  }
  saveImmediate(): void {
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer)
      this.saveDebounceTimer = null
    }
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8')
  }
  getNextId(entity: EntityType): number {
    this.data.meta.lastId[entity]++
    return this.data.meta.lastId[entity]
  }
  getCurrentTimestamp(): string {
    return new Date().toISOString()
  }
  get persons() {
    return this.data.persons
  }
  set persons(value) {
    this.data.persons = value
  }
  get meetings() {
    return this.data.meetings
  }
  set meetings(value) {
    this.data.meetings = value
  }
  get actionItems() {
    return this.data.actionItems
  }
  set actionItems(value) {
    this.data.actionItems = value
  }
  get templates() {
    return this.data.templates
  }
  set templates(value) {
    this.data.templates = value
  }
  get meetingSkips() {
    return this.data.meetingSkips || []
  }
  set meetingSkips(value) {
    this.data.meetingSkips = value
  }
  get personNotes() {
    return this.data.personNotes || []
  }
  set personNotes(value) {
    this.data.personNotes = value
  }
  get meta() {
    return this.data.meta
  }
  exportData(): string {
    const exportData = {
      persons: this.data.persons,
      meetings: this.data.meetings,
      actionItems: this.data.actionItems,
      templates: this.data.templates.filter((t) => !t.isDefault),
      meetingSkips: this.data.meetingSkips || [],
      personNotes: this.data.personNotes || [],
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(exportData, null, 2)
  }
  importData(jsonData: string, defaultTemplates: typeof this.data.templates): void {
    const importedData = JSON.parse(jsonData)
    this.data.persons = importedData.persons || []
    this.data.meetings = importedData.meetings || []
    this.data.actionItems = importedData.actionItems || []
    this.data.templates = [...defaultTemplates, ...(importedData.templates || [])]
    this.data.meetingSkips = importedData.meetingSkips || []
    this.data.personNotes = importedData.personNotes || []
    this.data.meta.lastId.persons = Math.max(0, ...this.data.persons.map((p) => p.id))
    this.data.meta.lastId.meetings = Math.max(0, ...this.data.meetings.map((m) => m.id))
    this.data.meta.lastId.actionItems = Math.max(0, ...this.data.actionItems.map((a) => a.id))
    this.data.meta.lastId.templates = Math.max(0, ...this.data.templates.map((t) => t.id))
    this.data.meta.lastId.meetingSkips = Math.max(0, ...(this.data.meetingSkips || []).map((s) => s.id))
    this.data.meta.lastId.personNotes = Math.max(0, ...(this.data.personNotes || []).map((n) => n.id))
    this.saveImmediate()
  }
  reset(): void {
    this.data = structuredClone(defaultData)
    this.saveImmediate()
  }
}
