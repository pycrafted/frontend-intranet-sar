import { Users, MessageSquare } from "lucide-react"
import type { Forum } from "./forum-page"
import Image from "next/image"

interface ForumHeaderProps {
  forum: Forum
}

export function ForumHeader({ forum }: ForumHeaderProps) {
  return (
    <div className="mb-8 overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative h-48 w-full overflow-hidden">
        <Image src={forum.image || "/placeholder.svg"} alt={forum.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-3xl font-semibold text-white text-balance">{forum.name}</h2>
        </div>
      </div>

      <div className="p-6">
        <p className="mb-4 text-muted-foreground text-pretty">{forum.description}</p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{forum.memberCount.toLocaleString()} membres</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>{forum.conversationCount} conversations</span>
          </div>
        </div>
      </div>
    </div>
  )
}


