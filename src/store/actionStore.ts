import { create } from 'zustand'
import type { ActionItem } from '@/types'
import { actionService } from '@/services'
interface ActionState {
  actions: ActionItem[]
  pendingActions: ActionItem[]
  isLoading: boolean
  error: string | null
  fetchActions: () => Promise<void>
  fetchPendingActions: () => Promise<void>
  fetchActionsByMeeting: (meetingId: number) => Promise<ActionItem[]>
  createAction: (data: Omit<ActionItem, 'id' | 'createdAt'>) => Promise<ActionItem>
  updateAction: (id: number, data: Partial<ActionItem>) => Promise<ActionItem>
  deleteAction: (id: number) => Promise<void>
  toggleComplete: (id: number) => Promise<void>
  clearError: () => void
}
export const useActionStore = create<ActionState>((set) => ({
  actions: [],
  pendingActions: [],
  isLoading: false,
  error: null,
  fetchActions: async () => {
    set({ isLoading: true, error: null })
    try {
      const actions = await actionService.getAll()
      set({ actions, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch actions'
      set({ error: message, isLoading: false })
    }
  },
  fetchPendingActions: async () => {
    try {
      const pendingActions = await actionService.getPending()
      set({ pendingActions })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch pending actions'
      set({ error: message })
    }
  },
  fetchActionsByMeeting: async (meetingId) => {
    try {
      const actions = await actionService.getByMeeting(meetingId)
      return actions
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch meeting actions'
      set({ error: message })
      return []
    }
  },
  createAction: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const action = await actionService.create(data)
      set((state) => ({
        actions: [...state.actions, action],
        pendingActions: action.completed
          ? state.pendingActions
          : [...state.pendingActions, action],
        isLoading: false,
      }))
      return action
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create action'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  updateAction: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const action = await actionService.update(id, data)
      set((state) => {
        const updatedActions = state.actions.map((a) => (a.id === id ? action : a))
        let updatedPendingActions: ActionItem[]
        if (action.completed) {
          updatedPendingActions = state.pendingActions.filter((a) => a.id !== id)
        } else {
          const existsInPending = state.pendingActions.some((a) => a.id === id)
          updatedPendingActions = existsInPending
            ? state.pendingActions.map((a) => (a.id === id ? action : a))
            : [...state.pendingActions, action]
        }
        return {
          actions: updatedActions,
          pendingActions: updatedPendingActions,
          isLoading: false,
        }
      })
      return action
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update action'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  deleteAction: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await actionService.delete(id)
      set((state) => ({
        actions: state.actions.filter((a) => a.id !== id),
        pendingActions: state.pendingActions.filter((a) => a.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete action'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  toggleComplete: async (id) => {
    try {
      const action = await actionService.toggleComplete(id)
      set((state) => ({
        actions: state.actions.map((a) => (a.id === id ? action : a)),
        pendingActions: action.completed
          ? state.pendingActions.filter((a) => a.id !== id)
          : [...state.pendingActions, action],
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to toggle action'
      set({ error: message })
    }
  },
  clearError: () => {
    set({ error: null })
  },
}))
