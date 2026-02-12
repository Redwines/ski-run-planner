'use client'

import { useState } from 'react'
import { useGroupStore, getGroupMaxDifficulty, DifficultyMode } from '@/stores/groupStore'
import { Difficulty } from '@/lib/graph'
import { MemberCard } from './MemberCard'
import { AddMemberForm } from './AddMemberForm'

const difficultyLabels: Record<Difficulty, string> = {
  [Difficulty.GREEN]: 'Green (Beginner)',
  [Difficulty.BLUE]: 'Blue (Intermediate)',
  [Difficulty.RED]: 'Red (Advanced)',
  [Difficulty.BLACK]: 'Black (Expert)',
  [Difficulty.DOUBLE_BLACK]: 'Double Black (Expert+)',
}

export function GroupPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { members, difficultyMode, setDifficultyMode } = useGroupStore()

  const maxDifficulty = getGroupMaxDifficulty(members, difficultyMode)

  return (
    <div className="space-y-3">
      {/* Summary row */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <span className="font-medium">
            {members.length === 0
              ? 'Add your group'
              : `${members.length} ${members.length === 1 ? 'member' : 'members'}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {members.length > 0 && (
            <span className="text-sm text-muted-foreground">
              Max: {difficultyLabels[maxDifficulty]}
            </span>
          )}
          <span className="text-muted-foreground">{isExpanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-4 pt-2">
          {/* Difficulty mode toggle */}
          {members.length > 0 && (
            <div className="flex gap-1 p-1 bg-secondary rounded-lg">
              <button
                onClick={() => setDifficultyMode('play_it_safe')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  difficultyMode === 'play_it_safe'
                    ? 'bg-card text-foreground shadow'
                    : 'text-muted-foreground'
                }`}
              >
                Play it Safe
              </button>
              <button
                onClick={() => setDifficultyMode('stretch_slightly')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  difficultyMode === 'stretch_slightly'
                    ? 'bg-card text-foreground shadow'
                    : 'text-muted-foreground'
                }`}
              >
                Stretch Slightly
              </button>
            </div>
          )}

          {/* Member cards */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>

          {/* Add member form */}
          <AddMemberForm />
        </div>
      )}
    </div>
  )
}
