"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Users, Clock, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { Forum } from "@/lib/types/forum"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale/fr"

interface ForumCardProps {
  forum: Forum
  currentUserId?: number
  onEdit?: (forum: Forum) => void
  onDelete?: (forum: Forum) => void
}

export function ForumCard({ forum, currentUserId, onEdit, onDelete }: ForumCardProps) {
  const router = useRouter()
  const isOwner = currentUserId === forum.created_by

  const handleClick = () => {
    router.push(`/forum/${forum.id}`)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(forum)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(forum)
  }

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden border-border/50 w-full max-w-sm"
      onClick={handleClick}
    >
      {/* Image en en-tête avec overlay */}
      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-muted">
        {forum.image_url ? (
          <img
            src={forum.image_url}
            alt={forum.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
        
        {/* Menu actions en overlay */}
        {isOwner && (
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 bg-background/90 backdrop-blur-sm hover:bg-background shadow-sm"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
          {forum.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Créateur et statistiques */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background">
              <AvatarImage src={forum.created_by_info.avatar_url} alt={forum.created_by_info.full_name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {forum.created_by_info.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate text-foreground">{forum.created_by_info.full_name}</p>
              {forum.created_by_info.position && (
                <p className="text-xs text-muted-foreground truncate">{forum.created_by_info.position}</p>
              )}
            </div>
          </div>

          {/* Statistiques avec badges élégants */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-xs font-medium text-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{forum.message_count}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-xs font-medium text-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{forum.participant_count}</span>
            </div>
          </div>
        </div>

        {/* Dernière activité avec style élégant */}
        {forum.last_message && (
          <div className="flex items-center gap-2 pt-3 border-t border-border/50">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60"></div>
            <span className="text-xs text-muted-foreground">
              Dernière activité{" "}
              {formatDistanceToNow(new Date(forum.last_message.created_at), {
                addSuffix: true,
                locale: fr,
              })}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

