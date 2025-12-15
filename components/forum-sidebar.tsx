"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { MessageCircle, Plus, ImageIcon, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

export function ForumSidebar({ forums, loading, onCreateClick, onEditForum, onDeleteForum, isMainSidebarCollapsed = false, isCollapsed: externalIsCollapsed, onCollapseChange }: ForumSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentForumId = pathname?.match(/\/forum\/(\d+)/)?.[1]
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false) // Développé par défaut

  // Utiliser l'état externe si fourni (géré par LayoutWrapper), sinon utiliser l'état interne
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed

  const handleForumClick = (forumId: number) => {
    router.push(`/forum/${forumId}`)
  }

  const toggleCollapse = () => {
    const newState = !isCollapsed
    if (externalIsCollapsed === undefined) {
      setInternalIsCollapsed(newState)
    }
    onCollapseChange?.(newState)
  }

  // Calculer la position left en fonction de l'état du sidebar principal
  // Doit correspondre exactement aux marges du sidebar principal dans LayoutWrapper
  const leftPosition = isMainSidebarCollapsed 
    ? 'tablet:left-12 md:left-14 lg:left-16' // Sidebar principal rétracté (48px, 56px, 64px)
    : 'tablet:left-56 md:left-60 lg:left-64' // Sidebar principal développé (224px, 240px, 256px)

  return (
    <aside className={cn(
      "hidden lg:flex lg:flex-col lg:fixed lg:top-16 lg:bottom-0 lg:z-30 border-r border-border bg-card/50 backdrop-blur-sm transition-all duration-300 shadow-sm",
      leftPosition,
      isCollapsed ? "lg:w-20" : "lg:w-80"
    )}>
      <div className="flex flex-col h-full bg-card relative">
        {/* Bouton de rétractement - Position identique au sidebar principal */}
        <div className="flex justify-end p-1.5 sm:p-2 border-b border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg"
            aria-label={isCollapsed ? "Développer le sidebar" : "Rétracter le sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
            ) : (
              <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>

        {/* Header élégant */}
        <div className={cn(
          "border-b border-border/50 flex-shrink-0 bg-gradient-to-r from-card to-card/95 transition-all duration-300 overflow-hidden",
          isCollapsed ? "p-2" : "p-4 sm:p-5"
        )}>
          {!isCollapsed ? (
            <>
              <Button
                onClick={onCreateClick}
                size="sm"
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau forum
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Button
                onClick={onCreateClick}
                size="icon"
                className="h-8 w-8"
                title="Créer un forum"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Liste des forums - Design raffiné */}
        <div className="flex-1 overflow-y-auto">
          <div className={cn("space-y-1 transition-all duration-300", isCollapsed ? "p-2" : "p-3")}>
            {loading && forums.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                {isCollapsed ? (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
                ) : (
                  <div className="text-sm text-muted-foreground">Chargement...</div>
                )}
              </div>
            ) : forums.length === 0 ? (
              !isCollapsed && (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-2">Aucun forum</p>
                  <p className="text-xs text-muted-foreground mb-4 text-center">Créez votre premier forum pour commencer</p>
                </div>
              )
            ) : (
              forums
                .filter((forum) => forum && forum.id)
                .map((forum) => {
                  const isActive = currentForumId === forum.id.toString()
                  
                  return (
                    <div
                      key={forum.id}
                      className={cn(
                        "relative w-full rounded-lg transition-all duration-200 group",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-accent/50 hover:shadow-sm",
                        isCollapsed ? "p-2" : "p-3"
                      )}
                    >
                      <button
                        onClick={() => handleForumClick(forum.id)}
                        className={cn(
                          "w-full",
                          isCollapsed ? "flex justify-center" : "text-left"
                        )}
                        title={isCollapsed ? forum.title : undefined}
                      >
                        {isCollapsed ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                            {forum.image_url ? (
                              <Image
                                src={forum.image_url}
                                alt={forum.title}
                                fill
                                className="object-cover"
                                sizes="40px"
                                unoptimized
                              />
                            ) : (
                              <div className={cn(
                                "w-full h-full flex items-center justify-center",
                                isActive ? "bg-primary-foreground/20" : "bg-primary/10"
                              )}>
                                <MessageCircle className={cn(
                                  "h-5 w-5",
                                  isActive ? "text-primary-foreground/70" : "text-primary/40"
                                )} />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-3 items-center pr-8">
                            {/* Image miniature avec bordure élégante */}
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
                        )}
                      </button>
                      {!isCollapsed && (
                        <div className="absolute top-3 right-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-7 w-7 text-white",
                                  isActive ? "hover:bg-primary-foreground/20" : "hover:bg-white/20"
                                )}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onEditForum?.(forum)
                                }}
                              >
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onDeleteForum?.(forum)
                                }}
                                className="text-destructive"
                              >
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
      </div>
    </aside>
  )
}

