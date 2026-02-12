'use client'

import { useEffect } from 'react'
import { Resort } from '@/lib/graph'
import { useGroupStore } from '@/stores/groupStore'
import { ResortMap } from '@/components/map'
import { GroupPanel } from '@/components/group/GroupPanel'
import { SuggestionPanel } from '@/components/suggestion/SuggestionPanel'

interface ResortPageClientProps {
  resort: Resort
}

export function ResortPageClient({ resort }: ResortPageClientProps) {
  const setResort = useGroupStore((state) => state.setResort)
  const members = useGroupStore((state) => state.members)

  // Set resort ID on mount
  useEffect(() => {
    setResort(resort.id)
  }, [resort.id, setResort])

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex-none p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{resort.name}</h1>
            {resort.region && (
              <p className="text-sm text-muted-foreground">{resort.region}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>
      </header>

      {/* Main content - Map */}
      <main className="flex-1 min-h-0 p-2">
        <ResortMap resort={resort} />
      </main>

      {/* Bottom panel */}
      <footer className="flex-none border-t bg-card">
        <div className="p-4 space-y-4">
          <GroupPanel />
          <SuggestionPanel resort={resort} />
        </div>
      </footer>
    </div>
  )
}
