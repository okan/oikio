import type {
  Person,
  Meeting,
  ActionItem,
  Template,
  MeetingSkip,
  PersonNote,
  TalkingPoint,
} from '../../../src/types'
export interface DatabaseData {
  persons: Person[]
  meetings: Meeting[]
  actionItems: ActionItem[]
  templates: Template[]
  meetingSkips: MeetingSkip[]
  personNotes: PersonNote[]
  talkingPoints: TalkingPoint[]
  meta: {
    lastId: {
      persons: number
      meetings: number
      actionItems: number
      templates: number
      meetingSkips: number
      personNotes: number
      talkingPoints: number
    }
  }
}
export type EntityType =
  | 'persons'
  | 'meetings'
  | 'actionItems'
  | 'templates'
  | 'meetingSkips'
  | 'personNotes'
  | 'talkingPoints'
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
  personNotes: [],
  talkingPoints: [],
  meta: {
    lastId: {
      persons: 0,
      meetings: 0,
      actionItems: 0,
      templates: 0,
      meetingSkips: 0,
      personNotes: 0,
      talkingPoints: 0,
    },
  },
}
