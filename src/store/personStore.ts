import { create } from 'zustand'
import type { Person } from '@/types'
import { personService } from '@/services'
interface PersonState {
  persons: Person[]
  selectedPerson: Person | null
  isLoading: boolean
  error: string | null
  fetchPersons: () => Promise<void>
  fetchPersonById: (id: number) => Promise<Person | null>
  selectPerson: (person: Person | null) => void
  createPerson: (data: Omit<Person, 'id' | 'createdAt'>) => Promise<Person>
  updatePerson: (id: number, data: Partial<Person>) => Promise<Person>
  deletePerson: (id: number) => Promise<void>
  getNeedingAttention: () => Promise<Person[]>
  clearError: () => void
}
export const usePersonStore = create<PersonState>((set) => ({
  persons: [],
  selectedPerson: null,
  isLoading: false,
  error: null,
  fetchPersons: async () => {
    set({ isLoading: true, error: null })
    try {
      const persons = await personService.getAll()
      set({ persons, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch persons'
      set({ error: message, isLoading: false })
    }
  },
  fetchPersonById: async (id: number) => {
    try {
      const person = await personService.getById(id)
      if (person) {
        set((state) => ({
          persons: state.persons.some((p) => p.id === id)
            ? state.persons.map((p) => (p.id === id ? person : p))
            : state.persons,
        }))
      }
      return person
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch person'
      set({ error: message })
      return null
    }
  },
  selectPerson: (person) => {
    set({ selectedPerson: person })
  },
  createPerson: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const person = await personService.create(data)
      set((state) => ({
        persons: [...state.persons, person].sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }))
      return person
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create person'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  updatePerson: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const person = await personService.update(id, data)
      set((state) => ({
        persons: state.persons
          .map((p) => (p.id === id ? person : p))
          .sort((a, b) => a.name.localeCompare(b.name)),
        selectedPerson: state.selectedPerson?.id === id ? person : state.selectedPerson,
        isLoading: false,
      }))
      return person
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update person'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  deletePerson: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await personService.delete(id)
      set((state) => ({
        persons: state.persons.filter((p) => p.id !== id),
        selectedPerson: state.selectedPerson?.id === id ? null : state.selectedPerson,
        isLoading: false,
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete person'
      set({ error: message, isLoading: false })
      throw error
    }
  },
  getNeedingAttention: async () => {
    try {
      return await personService.getNeedingAttention()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch attention list'
      set({ error: message })
      return []
    }
  },
  clearError: () => {
    set({ error: null })
  },
}))
