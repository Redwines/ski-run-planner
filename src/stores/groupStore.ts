import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Difficulty } from '@/lib/graph'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type Discipline = 'ski' | 'snowboard'
export type DifficultyMode = 'play_it_safe' | 'stretch_slightly'

export interface GroupMember {
  id: string
  name: string
  discipline: Discipline
  skillLevel: SkillLevel
}

interface GroupState {
  resortId: string | null
  members: GroupMember[]
  difficultyMode: DifficultyMode

  // Actions
  setResort: (id: string) => void
  addMember: (member: Omit<GroupMember, 'id'>) => void
  removeMember: (id: string) => void
  updateMember: (id: string, updates: Partial<Omit<GroupMember, 'id'>>) => void
  setDifficultyMode: (mode: DifficultyMode) => void
  clearGroup: () => void
}

// Map skill level to difficulty
export function skillToDifficulty(skill: SkillLevel): Difficulty {
  switch (skill) {
    case 'beginner':
      return Difficulty.GREEN
    case 'intermediate':
      return Difficulty.BLUE
    case 'advanced':
      return Difficulty.RED
    case 'expert':
      return Difficulty.BLACK
  }
}

// Get max difficulty for a group based on lowest skill
export function getGroupMaxDifficulty(
  members: GroupMember[],
  mode: DifficultyMode
): Difficulty {
  if (members.length === 0) {
    return Difficulty.GREEN
  }

  const lowestSkill = members.reduce((lowest, member) => {
    const memberDiff = skillToDifficulty(member.skillLevel)
    return memberDiff < lowest ? memberDiff : lowest
  }, Difficulty.BLACK)

  if (mode === 'stretch_slightly') {
    // Allow one level higher, capped at BLACK
    return Math.min(lowestSkill + 1, Difficulty.BLACK) as Difficulty
  }

  return lowestSkill
}

// Generate a simple unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set) => ({
      resortId: null,
      members: [],
      difficultyMode: 'play_it_safe',

      setResort: (id) => set({ resortId: id }),

      addMember: (member) =>
        set((state) => ({
          members: [
            ...state.members,
            {
              ...member,
              id: generateId(),
            },
          ],
        })),

      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),

      updateMember: (id, updates) =>
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      setDifficultyMode: (mode) => set({ difficultyMode: mode }),

      clearGroup: () => set({ members: [], difficultyMode: 'play_it_safe' }),
    }),
    {
      name: 'ski-planner-group',
    }
  )
)
