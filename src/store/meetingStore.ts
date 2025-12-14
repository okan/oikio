import { create } from 'zustand'
import type { Meeting } from '@/types'
import { meetingService } from '@/services'
interface MeetingState {
  meetings: Meeting[]
  selectedMeeting: Meeting | null
  upcomingMeetings: Meeting[]
  recentMeetings: Meeting[]
  isLoading: boolean
  error: string | null
  fetchMeetings: () => Promise<void>
  fetchMeetingsByPerson: (personId: number) => Promise<Meeting[]>
  fetchMeetingById: (id: number) => Promise<Meeting | null>
  fetchUpcomingMeetings: (days?: number) => Promise<void>
  fetchRecentMeetings: (limit?: number) => Promise<void>
  selectMeeting: (meeting: Meeting | null) => void
  createMeeting: (data: Omit<Meeting, 'id' | 'createdAt'>) => Promise<Meeting>
  updateMeeting: (id: number, data: Partial<Meeting>) => Promise<Meeting>
  deleteMeeting: (id: number) => Promise<void>
  clearError: () => void
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
      const meetings = await meetingService.getAll()
      set({ meetings, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch meetings'
      set({ error: message, isLoading: false })
    }
  },
  fetchMeetingsByPerson: async (personId) => {
    try {
      const meetings = await meetingService.getByPerson(personId)
      return meetings
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch person meetings'
      set({ error: message })
      return []
    }
  },
  fetchMeetingById: async (id: number) => {
    try {
      const meeting = await meetingService.getById(id)
      if (meeting) {
        set((state) => ({
          meetings: state.meetings.some((m) => m.id === id)
            ? state.meetings.map((m) => (m.id === id ? meeting : m))
            : state.meetings,
        }))
      }
      return meeting
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch meeting'
      set({ error: message })
      return null
    }
  },
  fetchUpcomingMeetings: async (days = 7) => {
    try {
      const upcomingMeetings = await meetingService.getUpcoming(days)
      set({ upcomingMeetings })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch upcoming meetings'
      set({ error: message })
    }
  },
  fetchRecentMeetings: async (limit = 5) => {
    try {
      const recentMeetings = await meetingService.getRecent(limit)
      set({ recentMeetings })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch recent meetings'
      set({ error: message })
    }
  },
  selectMeeting: (meeting) => {
    set({ selectedMeeting: meeting })
  },
  createMeeting: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const meeting = await meetingService.create(data)
      set((state) => ({
        meetings: [meeting, ...state.meetings],
        isLoading: false,
      }))
      return meeting
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create meeting'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  updateMeeting: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const meeting = await meetingService.update(id, data)
      set((state) => ({
        meetings: state.meetings.map((m) => (m.id === id ? meeting : m)),
        selectedMeeting: state.selectedMeeting?.id === id ? meeting : state.selectedMeeting,
        upcomingMeetings: state.upcomingMeetings.map((m) => (m.id === id ? meeting : m)),
        recentMeetings: state.recentMeetings.map((m) => (m.id === id ? meeting : m)),
        isLoading: false,
      }))
      return meeting
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update meeting'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  deleteMeeting: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await meetingService.delete(id)
      set((state) => ({
        meetings: state.meetings.filter((m) => m.id !== id),
        selectedMeeting: state.selectedMeeting?.id === id ? null : state.selectedMeeting,
        upcomingMeetings: state.upcomingMeetings.filter((m) => m.id !== id),
        recentMeetings: state.recentMeetings.filter((m) => m.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete meeting'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  clearError: () => {
    set({ error: null })
  },
}))
