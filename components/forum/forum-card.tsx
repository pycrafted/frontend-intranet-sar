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
        "publication-card bg-white shadow-sm border border-gray-200 hover:shadow-lg rounded-xl overflow-hidden group fade-in cursor-pointer h-full flex flex-col transition-all duration-300",
        "hover:-translate-y-1"
      )}
      onClick={handleClick}
    >
      <CardContent className="p-0 h-full flex flex-col">
        {/* Image en en-tête - Style actualités */}
        {forum.image_url && (
          <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-gray-50">
            <img
              src={forum.image_url}
              alt={forum.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}

        {/* Contenu - Style actualités */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {/* Header avec date et actions */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span>
                {forum.last_message
                  ? new Date(forum.last_message.created_at).toLocaleDateString("fr-FR", {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })
                  : new Date().toLocaleDateString("fr-FR", {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
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
                      className="h-6 w-6 sm:h-7 sm:w-7 text-gray-500 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" />
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

          {/* Type et badges - Style actualités */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Badge className="text-xs px-2 py-1 bg-blue-100 text-blue-700 border-blue-200">
              Forum
            </Badge>
            <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-700">
              <MessageSquare className="w-3 h-3 mr-1" />
              {forum.message_count}
            </Badge>
            <Badge variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-700">
              <Users className="w-3 h-3 mr-1" />
              {forum.participant_count}
            </Badge>
          </div>

          {/* Titre - Style actualités */}
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-3 sm:mb-4 line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {forum.title}
          </h2>
          
          {/* Auteur - Style actualités */}
          <div className="flex items-center gap-2 sm:gap-3 mt-auto pt-2">
            <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-200">
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
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{forum.created_by_info.full_name}</div>
              {forum.created_by_info.position && (
                <div className="text-xs sm:text-sm text-gray-500 truncate">{forum.created_by_info.position}</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

