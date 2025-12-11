import { create } from 'zustand'
import type { Person } from '@/types'

interface PersonState {
  persons: Person[]
  selectedPerson: Person | null
  isLoading: boolean
  error: string | null

  fetchPersons: () => Promise<void>
  selectPerson: (person: Person | null) => void
  createPerson: (data: Omit<Person, 'id' | 'createdAt'>) => Promise<Person>
  updatePerson: (id: number, data: Partial<Person>) => Promise<Person>
  deletePerson: (id: number) => Promise<void>
}

export const usePersonStore = create<PersonState>((set) => ({
  persons: [],
  selectedPerson: null,
  isLoading: false,
  error: null,

  fetchPersons: async () => {
    set({ isLoading: true, error: null })
    try {
      const persons = await window.api.persons.getAll()
      set({ persons, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  selectPerson: (person) => {
    set({ selectedPerson: person })
  },

  createPerson: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const person = await window.api.persons.create(data)
      set((state) => ({
        persons: [...state.persons, person].sort((a, b) => a.name.localeCompare(b.name)),
        isLoading: false,
      }))
      return person
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updatePerson: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const person = await window.api.persons.update(id, data)
      set((state) => ({
        persons: state.persons
          .map((p) => (p.id === id ? person : p))
          .sort((a, b) => a.name.localeCompare(b.name)),
        selectedPerson: state.selectedPerson?.id === id ? person : state.selectedPerson,
        isLoading: false,
      }))
      return person
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  deletePerson: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await window.api.persons.delete(id)
      set((state) => ({
        persons: state.persons.filter((p) => p.id !== id),
        selectedPerson: state.selectedPerson?.id === id ? null : state.selectedPerson,
        isLoading: false,
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },
}))

