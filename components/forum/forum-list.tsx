"use client"

import { ForumCard } from "./forum-card"
import type { Forum } from "@/lib/types/forum"
import { StandardLoader } from "@/components/ui/standard-loader"

interface ForumListProps {
  forums: Forum[]
  loading?: boolean
  currentUserId?: number
  onEdit?: (forum: Forum) => void
  onDelete?: (forum: Forum) => void
}

export function ForumList({ forums, loading, currentUserId, onEdit, onDelete }: ForumListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <StandardLoader />
      </div>
    )
  }

  if (forums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 rounded-lg border-2 border-dashed border-border bg-card p-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Aucun forum trouvé</h3>
          <p className="text-sm text-muted-foreground">
            Créez le premier forum pour commencer les discussions
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {forums.map((forum) => (
        <ForumCard
          key={forum.id}
          forum={forum}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}


