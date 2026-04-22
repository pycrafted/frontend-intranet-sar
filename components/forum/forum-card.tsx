"use client"

import { useRouter } from "next/navigation"
import { MessageSquare, Users, MoreVertical, ChevronRight, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { Forum } from "@/lib/types/forum"

interface ForumCardProps {
  forum: Forum
  currentUserId?: number
  onEdit?: (forum: Forum) => void
  onDelete?: (forum: Forum) => void
}

export function ForumCard({ forum, currentUserId, onEdit, onDelete }: ForumCardProps) {
  const router = useRouter()
  const isOwner = currentUserId === forum.created_by

  const handleClick = () => router.push(`/forum/${forum.id}`)
  const handleEdit = (e: React.MouseEvent) => { e.stopPropagation(); onEdit?.(forum) }
  const handleDelete = (e: React.MouseEvent) => { e.stopPropagation(); onDelete?.(forum) }

  const dateLabel = forum.last_message
    ? new Date(forum.last_message.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    : new Date(forum.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })

  return (
    <div
      className={cn(
        "flex items-center gap-3 sm:gap-4 bg-white rounded-xl border border-gray-200 p-3 sm:p-4",
        "hover:shadow-md hover:border-[#344256]/30 cursor-pointer transition-all duration-200 group",
      )}
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden">
        {forum.image_url ? (
          <img
            src={forum.image_url}
            alt={forum.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center rounded-lg"
            style={{ backgroundColor: "#344256" }}
          >
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate group-hover:text-[#344256] transition-colors">
            {forum.title}
          </h3>
          <span className="text-xs text-gray-400 flex-shrink-0">{dateLabel}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            {forum.message_count} avis
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {forum.participant_count} participant{forum.participant_count !== 1 ? "s" : ""}
          </span>
          <span className="hidden sm:flex items-center gap-1.5 ml-auto">
            <img
              src={forum.created_by_info.avatar_url || "/placeholder-user.jpg"}
              alt=""
              className="w-4 h-4 rounded-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-user.jpg" }}
            />
            <span className="truncate max-w-[120px]">{forum.created_by_info.full_name}</span>
          </span>
        </div>
      </div>

      {/* Owner menu */}
      {isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-gray-400 hover:text-gray-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>Modifier</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[#344256] transition-colors flex-shrink-0" />
    </div>
  )
}
