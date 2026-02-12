'use client'

import { SkillLevel } from '@/stores/groupStore'

interface SkillSelectorProps {
  value: SkillLevel
  onChange: (value: SkillLevel) => void
}

const skillLevels: { value: SkillLevel; label: string; color: string }[] = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-500' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-500' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-500' },
  { value: 'expert', label: 'Expert', color: 'bg-gray-900' },
]

export function SkillSelector({ value, onChange }: SkillSelectorProps) {
  return (
    <div className="flex gap-1">
      {skillLevels.map((skill) => (
        <button
          key={skill.value}
          type="button"
          onClick={() => onChange(skill.value)}
          className={`
            flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all
            ${
              value === skill.value
                ? `${skill.color} text-white ring-2 ring-offset-2 ring-${skill.color}`
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }
          `}
        >
          {skill.label}
        </button>
      ))}
    </div>
  )
}
