import { create } from 'zustand'
import type { Template } from '@/types'

interface TemplateState {
  templates: Template[]
  isLoading: boolean
  error: string | null

  fetchTemplates: () => Promise<void>
  createTemplate: (data: Omit<Template, 'id'>) => Promise<Template>
  updateTemplate: (id: number, data: Partial<Template>) => Promise<Template>
  deleteTemplate: (id: number) => Promise<void>
}

export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      const templates = await window.api.templates.getAll()
      set({ templates, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createTemplate: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const template = await window.api.templates.create(data)
      set((state) => ({
        templates: [...state.templates, template],
        isLoading: false,
      }))
      return template
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updateTemplate: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const template = await window.api.templates.update(id, data)
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? template : t)),
        isLoading: false,
      }))
      return template
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await window.api.templates.delete(id)
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
}))

