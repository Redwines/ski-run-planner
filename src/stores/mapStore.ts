import { create } from 'zustand'
import { SafeZone, RouteSuggestion } from '@/lib/graph'

interface MapState {
  // Selection
  selectedLiftId: string | null
  highlightedZone: SafeZone | null

  // Suggestions
  showSuggestion: boolean
  currentSuggestions: RouteSuggestion[]

  // View options
  showRunLabels: boolean
  showDifficultyFilter: boolean

  // Actions
  selectLift: (id: string | null) => void
  highlightZone: (zone: SafeZone | null) => void
  toggleSuggestion: () => void
  setSuggestions: (suggestions: RouteSuggestion[]) => void
  clearSuggestions: () => void
  toggleRunLabels: () => void
  toggleDifficultyFilter: () => void
  reset: () => void
}

export const useMapStore = create<MapState>()((set) => ({
  selectedLiftId: null,
  highlightedZone: null,
  showSuggestion: false,
  currentSuggestions: [],
  showRunLabels: true,
  showDifficultyFilter: false,

  selectLift: (id) =>
    set({
      selectedLiftId: id,
      showSuggestion: false,
      currentSuggestions: [],
    }),

  highlightZone: (zone) => set({ highlightedZone: zone }),

  toggleSuggestion: () =>
    set((state) => ({ showSuggestion: !state.showSuggestion })),

  setSuggestions: (suggestions) =>
    set({
      currentSuggestions: suggestions,
      showSuggestion: true,
    }),

  clearSuggestions: () =>
    set({
      currentSuggestions: [],
      showSuggestion: false,
    }),

  toggleRunLabels: () =>
    set((state) => ({ showRunLabels: !state.showRunLabels })),

  toggleDifficultyFilter: () =>
    set((state) => ({ showDifficultyFilter: !state.showDifficultyFilter })),

  reset: () =>
    set({
      selectedLiftId: null,
      highlightedZone: null,
      showSuggestion: false,
      currentSuggestions: [],
    }),
}))
