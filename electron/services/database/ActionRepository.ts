import type { ActionItem } from '../../../src/types'
import type { DataStore } from './DataStore'
export class ActionRepository {
  constructor(private store: DataStore) { }
  private enrichAction(action: ActionItem): ActionItem {
    const meeting = this.store.meetings.find((m) => m.id === action.meetingId)
    const person = meeting ? this.store.persons.find((p) => p.id === meeting.personId) : null
    return {
      ...action,
      meetingTitle: meeting?.title,
      personName: person?.name,
    }
  }
  getAll(): ActionItem[] {
    return this.store.actionItems.map((a) => this.enrichAction(a))
  }
  getByMeeting(meetingId: number): ActionItem[] {
    return this.store.actionItems
      .filter((a) => a.meetingId === meetingId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }
  getPending(): ActionItem[] {
    return this.store.actionItems
      .filter((a) => !a.completed)
      .map((a) => this.enrichAction(a))
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
  }
  create(data: Omit<ActionItem, 'id' | 'createdAt'>): ActionItem {
    const actionItem: ActionItem = {
      id: this.store.getNextId('actionItems'),
      ...data,
      createdAt: this.store.getCurrentTimestamp(),
    }
    this.store.actionItems.push(actionItem)
    this.store.save()
    return actionItem
  }
  update(id: number, data: Partial<ActionItem>): ActionItem {
    const index = this.store.actionItems.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Action item not found')
    this.store.actionItems[index] = { ...this.store.actionItems[index], ...data }
    this.store.save()
    return this.store.actionItems[index]
  }
  delete(id: number): void {
    this.store.actionItems = this.store.actionItems.filter((a) => a.id !== id)
    this.store.save()
  }
  deleteByMeetingId(meetingId: number): void {
    this.store.actionItems = this.store.actionItems.filter((a) => a.meetingId !== meetingId)
  }
  toggleComplete(id: number): ActionItem {
    const index = this.store.actionItems.findIndex((a) => a.id === id)
    if (index === -1) throw new Error('Action item not found')
    this.store.actionItems[index].completed = !this.store.actionItems[index].completed
    this.store.save()
    return this.store.actionItems[index]
  }
  getAllTags(): string[] {
    const allTags = this.store.actionItems
      .flatMap((a) => a.tags || [])
      .filter((tag) => tag.trim() !== '')
    return Array.from(new Set(allTags)).sort()
  }
}
