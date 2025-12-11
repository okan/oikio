import { create } from 'zustand'
import type { Meeting } from '@/types'

interface MeetingState {
  meetings: Meeting[]
  selectedMeeting: Meeting | null
  upcomingMeetings: Meeting[]
  recentMeetings: Meeting[]
  isLoading: boolean
  error: string | null

  fetchMeetings: () => Promise<void>
  fetchMeetingsByPerson: (personId: number) => Promise<Meeting[]>
  fetchUpcomingMeetings: (days?: number) => Promise<void>
  fetchRecentMeetings: (limit?: number) => Promise<void>
  selectMeeting: (meeting: Meeting | null) => void
  createMeeting: (data: Omit<Meeting, 'id' | 'createdAt'>) => Promise<Meeting>
  updateMeeting: (id: number, data: Partial<Meeting>) => Promise<Meeting>
  deleteMeeting: (id: number) => Promise<void>
}

export const useMeetingStore = create<MeetingState>((set) => ({
  meetings: [],
  selectedMeeting: null,
  upcomingMeetings: [],
  recentMeetings: [],
  isLoading: false,
  error: null,

  fetchMeetings: async () => {
    set({ isLoading: true, error: null })
    try {
      const meetings = await window.api.meetings.getAll()
      set({ meetings, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  fetchMeetingsByPerson: async (personId) => {
    try {
      const meetings = await window.api.meetings.getByPerson(personId)
      return meetings
    } catch (error) {
      set({ error: (error as Error).message })
      return []
    }
  },

  fetchUpcomingMeetings: async (days = 7) => {
    try {
      const upcomingMeetings = await window.api.meetings.getUpcoming(days)
      set({ upcomingMeetings })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  fetchRecentMeetings: async (limit = 5) => {
    try {
      const recentMeetings = await window.api.meetings.getRecent(limit)
      set({ recentMeetings })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  selectMeeting: (meeting) => {
    set({ selectedMeeting: meeting })
  },

  createMeeting: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const meeting = await window.api.meetings.create(data)
      set((state) => ({
        meetings: [meeting, ...state.meetings],
        isLoading: false,
      }))
      return meeting
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateMeeting: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const meeting = await window.api.meetings.update(id, data)
      set((state) => ({
        meetings: state.meetings.map((m) => (m.id === id ? meeting : m)),
        selectedMeeting: state.selectedMeeting?.id === id ? meeting : state.selectedMeeting,
        isLoading: false,
      }))
      return meeting
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deleteMeeting: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await window.api.meetings.delete(id)
      set((state) => ({
        meetings: state.meetings.filter((m) => m.id !== id),
        selectedMeeting: state.selectedMeeting?.id === id ? null : state.selectedMeeting,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
}))

