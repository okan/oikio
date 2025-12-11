import { create } from 'zustand'
import type { ActionItem } from '@/types'

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
}

export const useActionStore = create<ActionState>((set) => ({
  actions: [],
  pendingActions: [],
  isLoading: false,
  error: null,

  fetchActions: async () => {
    set({ isLoading: true, error: null })
    try {
      const actions = await window.api.actions.getAll()
      set({ actions, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  fetchPendingActions: async () => {
    try {
      const pendingActions = await window.api.actions.getPending()
      set({ pendingActions })
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },

  fetchActionsByMeeting: async (meetingId) => {
    try {
      const actions = await window.api.actions.getByMeeting(meetingId)
      return actions
    } catch (error) {
      set({ error: (error as Error).message })
      return []
    }
  },

  createAction: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const action = await window.api.actions.create(data)
      set((state) => ({
        actions: [...state.actions, action],
        pendingActions: action.completed
          ? state.pendingActions
          : [...state.pendingActions, action],
        isLoading: false,
      }))
      return action
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateAction: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const action = await window.api.actions.update(id, data)
      set((state) => ({
        actions: state.actions.map((a) => (a.id === id ? action : a)),
        pendingActions: action.completed
          ? state.pendingActions.filter((a) => a.id !== id)
          : state.pendingActions.map((a) => (a.id === id ? action : a)),
        isLoading: false,
      }))
      return action
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deleteAction: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await window.api.actions.delete(id)
      set((state) => ({
        actions: state.actions.filter((a) => a.id !== id),
        pendingActions: state.pendingActions.filter((a) => a.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  toggleComplete: async (id) => {
    try {
      const action = await window.api.actions.toggleComplete(id)
      set((state) => ({
        actions: state.actions.map((a) => (a.id === id ? action : a)),
        pendingActions: action.completed
          ? state.pendingActions.filter((a) => a.id !== id)
          : [...state.pendingActions, action],
      }))
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },
}))

