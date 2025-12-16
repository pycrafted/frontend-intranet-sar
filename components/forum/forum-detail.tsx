"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Users, Edit, Trash2, ImageIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import type { Forum } from "@/lib/types/forum"

interface ForumDetailProps {
  forum: Forum
  currentUserId?: number
  onEdit?: (forum: Forum) => void
  onDelete?: (forum: Forum) => void
}

export function ForumDetail({ forum, currentUserId, onEdit, onDelete }: ForumDetailProps) {
  const isOwner = currentUserId === forum.created_by

  return (
    <Card className="overflow-hidden">
      {/* Image du forum */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 bg-gradient-to-br from-blue-100 to-indigo-100">
        {forum.image_url ? (
          <img
            src={forum.image_url}
            alt={forum.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="h-16 w-16 sm:h-20 sm:w-20 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground/70">Image par défaut</p>
            </div>
          </div>
        )}
      </div>

      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl sm:text-2xl break-words">{forum.title}</CardTitle>
          </div>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(forum)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(forum)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6">
          {/* Créateur */}
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-full">
              <img
                src={forum.created_by_info.avatar_url || "/placeholder-user.jpg"}
                alt={forum.created_by_info.full_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (target.src !== "/placeholder-user.jpg") {
                    target.src = "/placeholder-user.jpg"
                  }
                }}
              />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium">{forum.created_by_info.full_name}</p>
              {forum.created_by_info.position && (
                <p className="text-xs text-muted-foreground hidden sm:block">{forum.created_by_info.position}</p>
              )}
            </div>
          </div>

          {/* Statistiques */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{forum.message_count} messages</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{forum.participant_count} participants</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

