"use client"

import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageCircle, Plus, MoreVertical, MessagesSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import type { Forum } from "@/lib/types/forum"
import Image from "next/image"

interface ForumSidebarProps {
  forums: Forum[]
  loading?: boolean
  onCreateClick?: () => void
  onEditForum?: (forum: Forum) => void
  onDeleteForum?: (forum: Forum) => void
  isMainSidebarCollapsed?: boolean
  isCollapsed?: boolean
  onCollapseChange?: (isCollapsed: boolean) => void
}

export function ForumSidebar({ forums, loading, onCreateClick, onEditForum, onDeleteForum, isMainSidebarCollapsed = false }: ForumSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const currentForumId = pathname?.match(/\/forum\/(\d+)/)?.[1]

  const handleForumClick = (forumId: number) => {
    router.push(`/forum/${forumId}`)
  }

  const leftPosition = isMainSidebarCollapsed
    ? 'tablet:left-12 md:left-14 lg:left-16'
    : 'tablet:left-56 md:left-60 lg:left-64'

  return (
    <aside className={cn(
      "hidden lg:flex lg:flex-col lg:fixed lg:top-16 lg:bottom-0 lg:z-30 lg:w-80 border-r border-border bg-card/50 backdrop-blur-sm shadow-sm",
      leftPosition,
    )}>
      <div className="flex flex-col h-full bg-card">

        {/* Header */}
        <div className="p-4 border-b border-border/50 flex-shrink-0">
          <Button onClick={onCreateClick} size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau forum
          </Button>
        </div>

        {/* Liste des forums */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="space-y-1 p-3">
            {loading && forums.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-muted-foreground">Chargement...</div>
              </div>
            ) : forums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm font-medium text-foreground mb-2">Aucun forum</p>
                <p className="text-xs text-muted-foreground text-center">Créez votre premier forum pour commencer</p>
              </div>
            ) : (
              forums
                .filter((forum) => forum && forum.id)
                .map((forum) => {
                  const isActive = currentForumId === forum.id.toString()
                  return (
                    <div
                      key={forum.id}
                      className={cn(
                        "relative w-full rounded-lg transition-all duration-200 group p-3",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-accent/50 hover:shadow-sm",
                      )}
                    >
                      <button onClick={() => handleForumClick(forum.id)} className="w-full text-left">
                        <div className="flex gap-3 items-center pr-8">
                          <div className={cn(
                            "relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg transition-all",
                            isActive
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                              : "ring-2 ring-transparent group-hover:ring-primary/20"
                          )}>
                            {forum.image_url ? (
                              <Image
                                src={forum.image_url}
                                alt={forum.title}
                                fill
                                className="object-cover"
                                sizes="56px"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                                <MessageCircle className="h-6 w-6 text-primary/40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "font-medium text-sm line-clamp-2 mb-1",
                              isActive ? "text-primary-foreground" : "text-foreground group-hover:text-primary transition-colors"
                            )}>
                              {forum.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{forum.message_count} messages</span>
                              <span>•</span>
                              <span>{forum.participant_count} participants</span>
                            </div>
                          </div>
                        </div>
                      </button>

                      {user && forum.created_by === user.id && (
                        <div className="absolute top-3 right-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-7 w-7",
                                  isActive ? "text-primary-foreground hover:bg-primary-foreground/20" : "text-muted-foreground hover:bg-accent"
                                )}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEditForum?.(forum) }}>
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDeleteForum?.(forum) }} className="text-destructive">
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  )
                })
            )}
          </div>
        </div>

        {/* Bouton "Tous les échanges" — visible uniquement sur une page de détail de forum */}
        {currentForumId && (
          <div className="p-4 border-t border-border/50 flex-shrink-0">
            <button
              onClick={() => router.push("/forum")}
              className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium border border-[#344256]/30 transition-all duration-200 group hover:opacity-80"
              style={{ backgroundColor: '#344256', color: '#ffffff' }}
            >
              <MessagesSquare className="h-4 w-4 text-white" />
              Tous les échanges
            </button>
          </div>
        )}

      </div>
    </aside>
  )
}
