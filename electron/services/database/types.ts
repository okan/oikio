import type { Person, Meeting, ActionItem, Template, MeetingSkip } from '../../../src/types'
export interface DatabaseData {
  persons: Person[]
  meetings: Meeting[]
  actionItems: ActionItem[]
  templates: Template[]
  meetingSkips: MeetingSkip[]
  meta: {
    lastId: {
      persons: number
      meetings: number
      actionItems: number
      templates: number
      meetingSkips: number
    }
  }
}
export type EntityType = 'persons' | 'meetings' | 'actionItems' | 'templates' | 'meetingSkips'
export interface BaseEntity {
  id: number
  createdAt: string
}
export const defaultData: DatabaseData = {
  persons: [],
  meetings: [],
  actionItems: [],
  templates: [],
  meetingSkips: [],
  meta: {
    lastId: {
      persons: 0,
      meetings: 0,
      actionItems: 0,
      templates: 0,
      meetingSkips: 0,
    },
  },
}
