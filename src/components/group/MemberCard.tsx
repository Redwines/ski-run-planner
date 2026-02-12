'use client'

import { GroupMember, Discipline, SkillLevel, useGroupStore } from '@/stores/groupStore'
import { SkillSelector } from './SkillSelector'

interface MemberCardProps {
  member: GroupMember
}

export function MemberCard({ member }: MemberCardProps) {
  const updateMember = useGroupStore((state) => state.updateMember)
  const removeMember = useGroupStore((state) => state.removeMember)

  const handleSkillChange = (skillLevel: SkillLevel) => {
    updateMember(member.id, { skillLevel })
  }

  const handleDisciplineChange = (discipline: Discipline) => {
    updateMember(member.id, { discipline })
  }

  return (
    <div className="p-3 bg-card rounded-lg border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">
            {member.discipline === 'ski' ? '⛷️' : '🏂'}
          </span>
          <span className="font-medium">{member.name}</span>
        </div>
        <button
          onClick={() => removeMember(member.id)}
          className="text-muted-foreground hover:text-destructive transition-colors p-1"
          aria-label="Remove member"
        >
          ✕
        </button>
      </div>

      {/* Discipline toggle */}
      <div className="flex gap-1">
        <button
          onClick={() => handleDisciplineChange('ski')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm transition-colors ${
            member.discipline === 'ski'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Ski
        </button>
        <button
          onClick={() => handleDisciplineChange('snowboard')}
          className={`flex-1 py-1.5 px-3 rounded-md text-sm transition-colors ${
            member.discipline === 'snowboard'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground'
          }`}
        >
          Snowboard
        </button>
      </div>

      {/* Skill selector */}
      <SkillSelector value={member.skillLevel} onChange={handleSkillChange} />
    </div>
  )
}
