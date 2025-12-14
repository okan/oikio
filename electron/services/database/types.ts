import type { Person, Meeting, ActionItem, Template } from '../../../src/types'
export interface DatabaseData {
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
export type EntityType = 'persons' | 'meetings' | 'actionItems' | 'templates'
export interface BaseEntity {
  id: number
  createdAt: string
}
export const defaultData: DatabaseData = {
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
