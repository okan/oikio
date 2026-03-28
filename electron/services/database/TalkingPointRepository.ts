import type { TalkingPoint } from '../../../src/types'
import type { DataStore } from './DataStore'

export class TalkingPointRepository {
  constructor(private store: DataStore) {}

  getByPerson(personId: number): TalkingPoint[] {
    return this.store.talkingPoints
      .filter((tp) => tp.personId === personId)
      .sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }

  create(data: { personId: number; content: string }): TalkingPoint {
    const person = this.store.persons.find((p) => p.id === data.personId)
    if (!person) throw new Error('Person not found')
    const trimmed = data.content.trim()
    if (!trimmed) throw new Error('Talking point content is required')
    const tp: TalkingPoint = {
      id: this.store.getNextId('talkingPoints'),
      personId: data.personId,
      content: trimmed,
      completed: false,
      createdAt: this.store.getCurrentTimestamp(),
    }
    this.store.talkingPoints.push(tp)
    this.store.save()
    return tp
  }

  toggleComplete(id: number): TalkingPoint {
    const index = this.store.talkingPoints.findIndex((tp) => tp.id === id)
    if (index === -1) throw new Error('Talking point not found')
    this.store.talkingPoints[index] = {
      ...this.store.talkingPoints[index],
      completed: !this.store.talkingPoints[index].completed,
    }
    this.store.save()
    return this.store.talkingPoints[index]
  }

  delete(id: number): void {
    this.store.talkingPoints = this.store.talkingPoints.filter((tp) => tp.id !== id)
    this.store.save()
  }

  deleteByPersonId(personId: number): void {
    this.store.talkingPoints = this.store.talkingPoints.filter((tp) => tp.personId !== personId)
  }
}
