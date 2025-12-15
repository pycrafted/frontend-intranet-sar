"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Users, Calendar, MoreVertical } from "lucide-react"
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
      className={cn(
        "adaptive-publication-card rounded-xl overflow-hidden group fade-in w-full news-card cursor-pointer",
        "hover:shadow-md transition-shadow"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0 w-full">
        {/* Image en en-tête - Style actualités */}
        {forum.image_url && (
          <div className="relative h-40 w-full overflow-hidden bg-gray-50 -mx-0">
            <img
              src={forum.image_url}
              alt={forum.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Header avec date - Style actualités */}
        <div className="px-3 xs:px-4 sm:px-6 pt-2 xs:pt-3 pb-1">
          <div className="flex items-center justify-between mb-2 xs:mb-3">
            <div className="publication-date flex items-center gap-1 xs:gap-2 text-base xs:text-lg text-gray-500">
              <Calendar className="w-4 h-4 xs:w-5 xs:h-5 flex-shrink-0" />
              <span className="date-text font-medium text-gray-600 hidden xs:inline">
                {forum.last_message
                  ? new Date(forum.last_message.created_at).toLocaleDateString("fr-FR", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : new Date().toLocaleDateString("fr-FR", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
              </span>
              <span className="date-text font-medium text-gray-600 xs:hidden">
                {forum.last_message
                  ? new Date(forum.last_message.created_at).toLocaleDateString("fr-FR", {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit'
                    })
                  : new Date().toLocaleDateString("fr-FR", {
                      day: 'numeric',
                      month: 'short',
                      year: '2-digit'
                    })}
              </span>
            </div>
            
            {/* Menu actions - Style actualités */}
            {isOwner && (
              <div className="flex items-center gap-1 relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                      onClick={(e) => e.stopPropagation()}
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

          {/* Badges - Style actualités */}
          <div className="flex items-center gap-1 xs:gap-2 flex-wrap mb-3 xs:mb-4">
            <Badge variant="outline" className="text-base px-3 py-1.5 bg-blue-100 text-blue-700 border-blue-200">
              Forum
            </Badge>
            <Badge variant="secondary" className="text-base px-3 py-1.5 bg-gray-100 text-gray-700">
              <MessageSquare className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
              {forum.message_count} {forum.message_count === 1 ? 'message' : 'messages'}
            </Badge>
            <Badge variant="secondary" className="text-base px-3 py-1.5 bg-gray-100 text-gray-700">
              <Users className="w-3 h-3 xs:w-4 xs:h-4 mr-1" />
              {forum.participant_count} {forum.participant_count === 1 ? 'participant' : 'participants'}
            </Badge>
          </div>
        </div>

        {/* Titre et contenu - Style actualités */}
        <div className="px-3 xs:px-4 sm:px-6 pb-4 xs:pb-6 w-full">
          <h2 className="article-title mb-3 xs:mb-4 w-full block text-2xl xs:text-3xl font-bold text-gray-900 leading-tight">
            {forum.title}
          </h2>
          
          <div className="flex items-center gap-3 xs:gap-4">
            <div className="relative h-10 w-10 xs:h-12 xs:w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-200">
              {forum.created_by_info.avatar_url ? (
                <img
                  src={forum.created_by_info.avatar_url}
                  alt={forum.created_by_info.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs xs:text-sm">
                  {forum.created_by_info.full_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-base xs:text-lg">{forum.created_by_info.full_name}</div>
              {forum.created_by_info.position && (
                <div className="text-sm xs:text-base text-gray-500">{forum.created_by_info.position}</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

