'use client'

import { useMemo } from 'react'
import {
  Resort,
  filterRunsByDifficulty,
  computeCanReachBase,
  computeSafeZones,
  suggestNextLift,
  RouteSuggestion,
} from '@/lib/graph'
import { useMapStore } from '@/stores/mapStore'
import { useGroupStore, getGroupMaxDifficulty } from '@/stores/groupStore'

interface SuggestionPanelProps {
  resort: Resort
}

export function SuggestionPanel({ resort }: SuggestionPanelProps) {
  const { selectedLiftId, currentSuggestions, showSuggestion } = useMapStore()
  const setSuggestions = useMapStore((state) => state.setSuggestions)
  const clearSuggestions = useMapStore((state) => state.clearSuggestions)
  const selectLift = useMapStore((state) => state.selectLift)
  const { members, difficultyMode } = useGroupStore()

  // Compute max difficulty for the group
  const maxDifficulty = useMemo(() => {
    return getGroupMaxDifficulty(members, difficultyMode)
  }, [members, difficultyMode])

  // Filter runs based on group difficulty
  const filteredRuns = useMemo(() => {
    return filterRunsByDifficulty(resort.runs, maxDifficulty)
  }, [resort.runs, maxDifficulty])

  // Compute reachability and zones
  const { reachability, safeZones } = useMemo(() => {
    const reach = computeCanReachBase(filteredRuns, resort.baseAreas)
    const zones = computeSafeZones(filteredRuns, reach)
    return { reachability: reach, safeZones: zones }
  }, [filteredRuns, resort.baseAreas])

  // Get current lift info
  const currentLift = useMemo(() => {
    if (!selectedLiftId) return null
    return resort.lifts.find((l) => l.id === selectedLiftId)
  }, [selectedLiftId, resort.lifts])

  const handleSuggest = () => {
    if (!selectedLiftId) return

    const suggestions = suggestNextLift({
      currentLiftId: selectedLiftId,
      runs: filteredRuns,
      reachability,
      safeZones,
    })

    setSuggestions(suggestions)
  }

  const handleSelectSuggestion = (suggestion: RouteSuggestion) => {
    selectLift(suggestion.toLiftId)
  }

  // No lift selected
  if (!selectedLiftId || !currentLift) {
    return (
      <div className="text-center py-3 text-muted-foreground">
        <p>Tap a lift on the map to see options</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Current location */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">You are at</p>
          <p className="font-medium">{currentLift.name}</p>
          {currentLift.nameJa && (
            <p className="text-sm text-muted-foreground">{currentLift.nameJa}</p>
          )}
        </div>
        <button
          onClick={handleSuggest}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Where Next?
        </button>
      </div>

      {/* Suggestions */}
      {showSuggestion && currentSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Suggested routes:
          </p>
          {currentSuggestions.map((suggestion, idx) => {
            const toLift = resort.lifts.find((l) => l.id === suggestion.toLiftId)
            return (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full p-3 bg-secondary rounded-lg text-left hover:bg-secondary/80 transition-colors"
              >
                <p className="font-medium">
                  → {toLift?.name || suggestion.toLiftId}
                </p>
                <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
              </button>
            )
          })}
        </div>
      )}

      {/* No suggestions available */}
      {showSuggestion && currentSuggestions.length === 0 && (
        <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
          <p className="text-sm text-destructive font-medium">
            No safe routes available
          </p>
          <p className="text-sm text-muted-foreground">
            From this lift, there are no runs matching your group&apos;s skill level
            that lead to a lift with a return path to base.
          </p>
        </div>
      )}
    </div>
  )
}
