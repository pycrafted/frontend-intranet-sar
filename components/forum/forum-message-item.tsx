"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2 } from "lucide-react"
import type { ForumMessage } from "@/lib/types/forum"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale/fr"

interface ForumMessageItemProps {
  message: ForumMessage
  currentUserId?: number
  onEdit?: (message: ForumMessage) => void
  onDelete?: (message: ForumMessage) => void
}

export function ForumMessageItem({
  message,
  currentUserId,
  onEdit,
  onDelete,
}: ForumMessageItemProps) {
  const isOwner = currentUserId === message.author

  const handleEdit = () => {
    onEdit?.(message)
  }

  const handleDelete = () => {
    onDelete?.(message)
  }

  return (
    <div className="flex gap-2 sm:gap-4 group pb-4 sm:pb-6">
      {/* Avatar */}
      <div className="relative h-8 w-8 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-full">
        <img
          src={message.author_info.avatar_url || "/placeholder-user.jpg"}
          alt={message.author_info.full_name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            if (target.src !== "/placeholder-user.jpg") {
              target.src = "/placeholder-user.jpg"
            }
          }}
        />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
            <p className="font-semibold text-xs sm:text-sm truncate">{message.author_info.full_name}</p>
            {message.author_info.position && (
              <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                {message.author_info.position}
              </span>
            )}
            {message.is_edited && (
              <Badge variant="outline" className="text-xs shrink-0">
                Modifié
              </Badge>
            )}
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                  <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words mb-2">
          {message.content}
        </p>

        <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
          {formatDistanceToNow(new Date(message.created_at), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </div>
    </div>
  )
}

