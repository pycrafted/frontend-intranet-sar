import { Users, MessageSquare } from "lucide-react"
import type { Forum } from "./forum-page"
import Image from "next/image"

interface ForumHeaderProps {
  forum: Forum
}

export function ForumHeader({ forum }: ForumHeaderProps) {
  return (
    <div className="mb-8 relative overflow-hidden rounded-lg border border-border bg-card">
      {/* Image en arrière-plan de toute la carte */}
      <div className="absolute inset-0 z-0">
        <Image 
          src={forum.image || "/placeholder.svg"} 
          alt={forum.name} 
          fill 
          className="object-cover" 
          priority 
        />
        {/* Overlay pour améliorer la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Contenu en overlay (texte) */}
      <div className="relative z-10 p-6">
        <h2 className="text-3xl font-semibold text-white text-balance mb-4 drop-shadow-lg">
          {forum.name}
        </h2>
        
        <p className="mb-4 text-white/90 text-pretty drop-shadow-md">
          {forum.description}
        </p>
        
        <div className="flex items-center gap-6 text-sm text-white/80">
          <div className="flex items-center gap-2 drop-shadow-sm">
            <Users className="h-4 w-4" />
            <span>{forum.memberCount.toLocaleString()} membres</span>
          </div>
          <div className="flex items-center gap-2 drop-shadow-sm">
            <MessageSquare className="h-4 w-4" />
            <span>{forum.conversationCount} conversations</span>
          </div>
        </div>
      </div>
    </div>
  )
}


