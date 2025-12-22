import { app } from 'electron'
import path from 'path'
import fs from 'fs'
import type { Person, Meeting, ActionItem, Template, DashboardStats } from '../../src/types'
interface DatabaseData {
  persons: Person[]
  meetings: Meeting[]
  actionItems: ActionItem[]
  templates: Template[]
  meta: {
    lastId: {
      persons: number
      meetings: number
      actionItems: number
      templates: number
    }
  }
}
const defaultData: DatabaseData = {
  persons: [],
  meetings: [],
  actionItems: [],
  templates: [],
  meta: {
    lastId: {
      persons: 0,
      meetings: 0,
      actionItems: 0,
      templates: 0,
    },
  },
}
export class DatabaseService {
  private data: DatabaseData
  private dbPath: string
  constructor() {
    const userDataPath = app.getPath('userData')
    this.dbPath = path.join(userDataPath, 'oikio-data.json')
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }
    if (fs.existsSync(this.dbPath)) {
      try {
        const content = fs.readFileSync(this.dbPath, 'utf-8')
        this.data = JSON.parse(content)
      } catch {
        this.data = { ...defaultData }
      }
    } else {
      this.data = { ...defaultData }
    }
    this.seedDefaultTemplates()
    this.migrateLastMeetingDates()
    this.save()
  }
  private save(): void {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8')
  }
  private getNextId(entity: keyof DatabaseData['meta']['lastId']): number {
    this.data.meta.lastId[entity]++
    return this.data.meta.lastId[entity]
  }
  private getCurrentTimestamp(): string {
    return new Date().toISOString()
  }
  private migrateLastMeetingDates(): void {
    for (const person of this.data.persons) {
      const personMeetings = this.data.meetings
        .filter((m) => m.personId === person.id)
        .filter((m) => new Date(m.date) <= new Date())
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const latestMeeting = personMeetings[0]
      if (latestMeeting) {
        person.lastMeetingDate = latestMeeting.date
      }
    }
  }
  private seedDefaultTemplates(): void {
    const hasDefaultTemplates = this.data.templates.some((t) => t.isDefault)
    if (!hasDefaultTemplates) {
      const defaultTemplates = [
        {
          name: 'Haftalık Sync',
          description: 'Haftalık düzenli 1-1 toplantıları için',
          content: '## Bu Hafta\n- \n\n## Engelleyiciler\n- \n\n## Sonraki Hafta\n- ',
        },
        {
          name: 'Performans Görüşmesi',
          description: 'Performans değerlendirme toplantıları için',
          content: '## Başarılar\n- \n\n## Gelişim Alanları\n- \n\n## Hedefler\n- \n\n## Geri Bildirim\n- ',
        },
        {
          name: 'Kariyer Görüşmesi',
          description: 'Kariyer gelişimi ve hedefler için',
          content: '## Kısa Vadeli Hedefler\n- \n\n## Uzun Vadeli Hedefler\n- \n\n## Gelişim Planı\n- \n\n## Destek İhtiyaçları\n- ',
        },
      ]
      for (const template of defaultTemplates) {
        this.data.templates.push({
          id: this.getNextId('templates'),
          ...template,
          isDefault: true,
        })
      }
    }
  }
  getAllPersons(): Person[] {
    return [...this.data.persons].sort((a, b) => a.name.localeCompare(b.name))
  }
  getPersonById(id: number): Person | null {
    return this.data.persons.find((p) => p.id === id) || null
  }
  createPerson(data: Omit<Person, 'id' | 'createdAt'>): Person {
    const person: Person = {
      id: this.getNextId('persons'),
      ...data,
      createdAt: this.getCurrentTimestamp(),
    }
    this.data.persons.push(person)
    this.save()
    return person
  }
  updatePerson(id: number, data: Partial<Person>): Person {
    const index = this.data.persons.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Person not found')
    this.data.persons[index] = { ...this.data.persons[index], ...data }
    this.save()
    return this.data.persons[index]
  }
  deletePerson(id: number): void {
    const meetingIds = this.data.meetings.filter((m) => m.personId === id).map((m) => m.id)
    this.data.actionItems = this.data.actionItems.filter((a) => !meetingIds.includes(a.meetingId))
    this.data.meetings = this.data.meetings.filter((m) => m.personId !== id)
    this.data.persons = this.data.persons.filter((p) => p.id !== id)
    this.save()
  }
  private getActionStats(meetingId: number): { total: number; completed: number } {
    const actions = this.data.actionItems.filter((a) => a.meetingId === meetingId)
    return {
      total: actions.length,
      completed: actions.filter((a) => a.completed).length,
    }
  }
  getAllMeetings(): Meeting[] {
    return [...this.data.meetings]
      .map((m) => ({
        ...m,
        personName: this.data.persons.find((p) => p.id === m.personId)?.name,
        actionStats: this.getActionStats(m.id),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  getMeetingsByPerson(personId: number): Meeting[] {
    const personName = this.data.persons.find((p) => p.id === personId)?.name
    return this.data.meetings
      .filter((m) => m.personId === personId)
      .map((m) => ({ ...m, personName, actionStats: this.getActionStats(m.id) }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
  getMeetingById(id: number): Meeting | null {
    const meeting = this.data.meetings.find((m) => m.id === id)
    if (!meeting) return null
    return {
      ...meeting,
      personName: this.data.persons.find((p) => p.id === meeting.personId)?.name,
      actionStats: this.getActionStats(meeting.id),
    }
  }
  createMeeting(data: Omit<Meeting, 'id' | 'createdAt'>): Meeting {
    const meeting: Meeting = {
      id: this.getNextId('meetings'),
      ...data,
      createdAt: this.getCurrentTimestamp(),
    }
    this.data.meetings.push(meeting)
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const meetingDate = new Date(data.date)
    if (meetingDate <= today) {
      const personIndex = this.data.persons.findIndex((p) => p.id === data.personId)
      if (personIndex !== -1) {
        const currentLastMeeting = this.data.persons[personIndex].lastMeetingDate
        if (!currentLastMeeting || new Date(data.date) > new Date(currentLastMeeting)) {
          this.data.persons[personIndex].lastMeetingDate = data.date
        }
      }
    }
    this.save()
    return {
      ...meeting,
      personName: this.data.persons.find((p) => p.id === meeting.personId)?.name,
      actionStats: { total: 0, completed: 0 },
    }
  }
  updateMeeting(id: number, data: Partial<Meeting>): Meeting {
    const index = this.data.meetings.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Meeting not found')
    this.data.meetings[index] = { ...this.data.meetings[index], ...data }
    if (data.date) {
      this.recalculateLastMeetingDate(this.data.meetings[index].personId)
    }
    this.save()
    return {
      ...this.data.meetings[index],
      personName: this.data.persons.find((p) => p.id === this.data.meetings[index].personId)?.name,
      actionStats: this.getActionStats(id),
    }
  }
  deleteMeeting(id: number): void {
    const meeting = this.data.meetings.find((m) => m.id === id)
    const personId = meeting?.personId
    this.data.actionItems = this.data.actionItems.filter((a) => a.meetingId !== id)
    this.data.meetings = this.data.meetings.filter((m) => m.id !== id)
    if (personId) {
      this.recalculateLastMeetingDate(personId)
    }
    this.save()
  }
  private recalculateLastMeetingDate(personId: number): void {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const personMeetings = this.data.meetings
      .filter((m) => m.personId === personId)
      .filter((m) => new Date(m.date) <= today)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const personIndex = this.data.persons.findIndex((p) => p.id === personId)
    if (personIndex !== -1) {
      this.data.persons[personIndex].lastMeetingDate = personMeetings[0]?.date || undefined
    }
  }
  getPersonsNeedingAttention(): Person[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return this.data.persons
      .filter((person) => {
        if (!person.meetingFrequencyGoal) return false
        const lastMeeting = person.lastMeetingDate ? new Date(person.lastMeetingDate) : null
        if (!lastMeeting) return true
        const daysSinceLastMeeting = Math.floor(
          (today.getTime() - lastMeeting.getTime()) / (1000 * 60 * 60 * 24)
        )
        const thresholds: Record<string, number> = {
          weekly: 7,
          biweekly: 14,
          monthly: 30,
          quarterly: 90,
        }
        const threshold = thresholds[person.meetingFrequencyGoal] || 30
        return daysSinceLastMeeting >= threshold
      })
      .sort((a, b) => {
        const aLast = a.lastMeetingDate ? new Date(a.lastMeetingDate).getTime() : 0
        const bLast = b.lastMeetingDate ? new Date(b.lastMeetingDate).getTime() : 0
        return aLast - bLast
      })
  }
  getUpcomingMeetings(days: number): Meeting[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
    return this.data.meetings
      .filter((m) => {
        const meetingDate = new Date(m.date)
        return meetingDate >= today && meetingDate <= futureDate
      })
      .map((m) => ({
        ...m,
        personName: this.data.persons.find((p) => p.id === m.personId)?.name,
        actionStats: this.getActionStats(m.id),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
  getRecentMeetings(limit: number): Meeting[] {
    return [...this.data.meetings]
      .map((m) => ({
        ...m,
        personName: this.data.persons.find((p) => p.id === m.personId)?.name,
        actionStats: this.getActionStats(m.id),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }
  getAllActionItems(): ActionItem[] {
    return this.data.actionItems.map((a) => {
      const meeting = this.data.meetings.find((m) => m.id === a.meetingId)
      const person = meeting ? this.data.persons.find((p) => p.id === meeting.personId) : null
      return {
        ...a,
        meetingTitle: meeting?.title,
        personName: person?.name,
      }
    })
  }
  getActionItemsByMeeting(meetingId: number): ActionItem[] {
    return this.data.actionItems
      .filter((a) => a.meetingId === meetingId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }
  getPendingActionItems(): ActionItem[] {
    return this.data.actionItems
      .filter((a) => !a.completed)
      .map((a) => {
        const meeting = this.data.meetings.find((m) => m.id === a.meetingId)
        const person = meeting ? this.data.persons.find((p) => p.id === meeting.personId) : null
        return {
          ...a,
          meetingTitle: meeting?.title,
          personName: person?.name,
        }
      })
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
  }
  createActionItem(data: Omit<ActionItem, 'id' | 'createdAt'>): ActionItem {
    const actionItem: ActionItem = {
      id: this.getNextId('actionItems'),
      ...data,
      createdAt: this.getCurrentTimestamp(),
    }
    this.data.actionItems.push(actionItem)
    this.save()
    return actionItem
  }
  updateActionItem(id: number, data: Partial<ActionItem>): ActionItem {
    const index = this.data.actionItems.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Action item not found')
    this.data.actionItems[index] = { ...this.data.actionItems[index], ...data }
    this.save()
    return this.data.actionItems[index]
  }
  deleteActionItem(id: number): void {
    this.data.actionItems = this.data.actionItems.filter((a) => a.id !== id)
    this.save()
  }
  toggleActionItemComplete(id: number): ActionItem {
    const index = this.data.actionItems.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Action item not found')
    this.data.actionItems[index].completed = !this.data.actionItems[index].completed
    this.save()
    return this.data.actionItems[index]
  }
  getAllActionTags(): string[] {
    const allTags = this.data.actionItems
      .flatMap((a) => a.tags || [])
      .filter((tag) => tag.trim() !== '')
    return Array.from(new Set(allTags)).sort()
  }
  getAllTemplates(): Template[] {
    return [...this.data.templates].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1
      if (!a.isDefault && b.isDefault) return 1
      return a.name.localeCompare(b.name)
    })
  }
  getTemplateById(id: number): Template | null {
    return this.data.templates.find((t) => t.id === id) || null
  }
  createTemplate(data: Omit<Template, 'id'>): Template {
    const template: Template = {
      id: this.getNextId('templates'),
      ...data,
    }
    this.data.templates.push(template)
    this.save()
    return template
  }
  updateTemplate(id: number, data: Partial<Template>): Template {
    const index = this.data.templates.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Template not found')
    this.data.templates[index] = { ...this.data.templates[index], ...data }
    this.save()
    return this.data.templates[index]
  }
  deleteTemplate(id: number): void {
    this.data.templates = this.data.templates.filter((t) => t.id !== id)
    this.save()
  }
  getDashboardStats(): DashboardStats {
    const currentMonth = new Date().toISOString().slice(0, 7)
    return {
      totalPersons: this.data.persons.length,
      meetingsThisMonth: this.data.meetings.filter((m) => m.date.startsWith(currentMonth)).length,
      pendingActions: this.data.actionItems.filter((a) => !a.completed).length,
    }
  }
  exportData(): string {
    const exportData = {
      persons: this.data.persons,
      meetings: this.data.meetings,
      actionItems: this.data.actionItems,
      templates: this.data.templates.filter((t) => !t.isDefault),
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(exportData, null, 2)
  }
  importData(jsonData: string): void {
    const importedData = JSON.parse(jsonData)
    const defaultTemplates = this.data.templates.filter((t) => t.isDefault)
    this.data.persons = importedData.persons || []
    this.data.meetings = importedData.meetings || []
    this.data.actionItems = importedData.actionItems || []
    this.data.templates = [...defaultTemplates, ...(importedData.templates || [])]
    this.data.meta.lastId.persons = Math.max(0, ...this.data.persons.map((p) => p.id))
    this.data.meta.lastId.meetings = Math.max(0, ...this.data.meetings.map((m) => m.id))
    this.data.meta.lastId.actionItems = Math.max(0, ...this.data.actionItems.map((a) => a.id))
    this.data.meta.lastId.templates = Math.max(0, ...this.data.templates.map((t) => t.id))
    this.save()
  }
  reset(): void {
    this.data = { ...defaultData }
    this.seedDefaultTemplates()
    this.save()
  }
  search(query: string): { persons: Person[]; meetings: Meeting[]; actions: ActionItem[] } {
    const lowerQuery = query.toLowerCase()
    const persons = this.data.persons.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(lowerQuery) ||
        p.email?.toLowerCase().includes(lowerQuery) ||
        p.notes?.toLowerCase().includes(lowerQuery)
    )
    const meetings = this.data.meetings
      .filter(
        (m) =>
          (m.title || '').toLowerCase().includes(lowerQuery) ||
          m.notes?.toLowerCase().includes(lowerQuery) ||
          m.talkingPoints?.toLowerCase().includes(lowerQuery)
      )
      .map((m) => ({
        ...m,
        personName: this.data.persons.find((p) => p.id === m.personId)?.name,
      }))
    const actions = this.data.actionItems
      .filter(
        (a) =>
          a.description.toLowerCase().includes(lowerQuery) ||
          (a.tags || []).some((tag) => tag.toLowerCase().includes(lowerQuery))
      )
      .map((a) => {
        const meeting = this.data.meetings.find((m) => m.id === a.meetingId)
        const person = meeting ? this.data.persons.find((p) => p.id === meeting.personId) : null
        return {
          ...a,
          meetingTitle: meeting?.title,
          personName: person?.name,
        }
      })
    return { persons, meetings, actions }
  }
}
