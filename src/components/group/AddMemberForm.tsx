'use client'

import { useState } from 'react'
import { useGroupStore, SkillLevel, Discipline } from '@/stores/groupStore'

export function AddMemberForm() {
  const addMember = useGroupStore((state) => state.addMember)
  const [name, setName] = useState('')
  const [discipline, setDiscipline] = useState<Discipline>('ski')
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate')
  const [isAdding, setIsAdding] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    addMember({
      name: name.trim(),
      discipline,
      skillLevel,
    })

    setName('')
    setIsAdding(false)
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full py-3 px-4 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        + Add Member
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-secondary rounded-lg space-y-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-full px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        autoFocus
      />

      {/* Discipline toggle */}
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setDiscipline('ski')}
          className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors ${
            discipline === 'ski'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground'
          }`}
        >
          ⛷️ Ski
        </button>
        <button
          type="button"
          onClick={() => setDiscipline('snowboard')}
          className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors ${
            discipline === 'snowboard'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-foreground'
          }`}
        >
          🏂 Snowboard
        </button>
      </div>

      {/* Skill level */}
      <div className="flex gap-1">
        {(['beginner', 'intermediate', 'advanced', 'expert'] as SkillLevel[]).map(
          (level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSkillLevel(level)}
              className={`flex-1 py-2 px-1 rounded-md text-xs transition-colors ${
                skillLevel === level
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background text-foreground'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsAdding(false)}
          className="flex-1 py-2 px-3 bg-background rounded-md text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 py-2 px-3 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
        >
          Add
        </button>
      </div>
    </form>
  )
}
