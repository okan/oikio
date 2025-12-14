import { create } from 'zustand'
import type { Template } from '@/types'
import { templateService } from '@/services'
interface TemplateState {
  templates: Template[]
  isLoading: boolean
  error: string | null
  fetchTemplates: () => Promise<void>
  fetchTemplateById: (id: number) => Promise<Template | null>
  createTemplate: (data: Omit<Template, 'id'>) => Promise<Template>
  updateTemplate: (id: number, data: Partial<Template>) => Promise<Template>
  deleteTemplate: (id: number) => Promise<void>
  clearError: () => void
}
export const useTemplateStore = create<TemplateState>((set) => ({
  templates: [],
  isLoading: false,
  error: null,
  fetchTemplates: async () => {
    set({ isLoading: true, error: null })
    try {
      const templates = await templateService.getAll()
      set({ templates, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch templates'
      set({ error: message, isLoading: false })
    }
  },
  fetchTemplateById: async (id: number) => {
    try {
      const template = await templateService.getById(id)
      if (template) {
        set((state) => ({
          templates: state.templates.some((t) => t.id === id)
            ? state.templates.map((t) => (t.id === id ? template : t))
            : state.templates,
        }))
      }
      return template
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch template'
      set({ error: message })
      return null
    }
  },
  createTemplate: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const template = await templateService.create(data)
      set((state) => ({
        templates: [...state.templates, template],
        isLoading: false,
      }))
      return template
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create template'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  updateTemplate: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const template = await templateService.update(id, data)
      set((state) => ({
        templates: state.templates.map((t) => (t.id === id ? template : t)),
        isLoading: false,
      }))
      return template
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update template'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await templateService.delete(id)
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete template'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  clearError: () => {
    set({ error: null })
  },
}))
