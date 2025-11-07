"use client"

import type { Conversation, Forum } from "./forum-page"
import Image from "next/image"
import { Plus, MessageSquare, ChevronRight, ChevronLeft } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Comment {
  id: number | string
  author: string
  authorAvatar: string
  content: string
  timestamp: string
  likes: number
}

interface ForumSidebarProps {
  forums: Forum[]
  conversations: Conversation[]
  comments?: Comment[]
  selectedForumId?: string | null
  selectedConversationId: string | null
  onSelectForum?: (forum: Forum) => void
  onSelectConversation: (conversation: Conversation) => void
  onCreateForum?: () => void
  isCollapsed?: boolean
  onCollapseChange?: (isCollapsed: boolean) => void
  isMainSidebarCollapsed?: boolean
  isLoading?: boolean
  isLoadingComments?: boolean
}

export function ForumSidebar({ 
  forums,
  conversations,
  comments = [],
  selectedForumId,
  selectedConversationId, 
  onSelectForum,
  onSelectConversation,
  onCreateForum,
  isCollapsed: externalIsCollapsed,
  onCollapseChange,
  isMainSidebarCollapsed = false,
  isLoading = false,
  isLoadingComments = false
}: ForumSidebarProps) {
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(true) // Rétracté par défaut
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed
  
  // Logs pour debug
  console.log("🟣 [FORUM_SIDEBAR] ===== RENDU =====")
  console.log("🟣 [FORUM_SIDEBAR] Forums reçus:", forums.length)
  forums.forEach((forum, idx) => {
    console.log(`🟣 [FORUM_SIDEBAR]   Forum ${idx + 1}: ID=${forum.id}, name="${forum.name}"`)
  })
  console.log("🟣 [FORUM_SIDEBAR] Conversations reçues:", conversations.length)
  console.log("🟣 [FORUM_SIDEBAR] Commentaires reçus:", comments.length)
  console.log("🟣 [FORUM_SIDEBAR] selectedConversationId:", selectedConversationId)
  console.log("🟣 [FORUM_SIDEBAR] isCollapsed:", isCollapsed)
  console.log("🟣 [FORUM_SIDEBAR] isLoading:", isLoading)
  console.log("🟣 [FORUM_SIDEBAR] isLoadingComments:", isLoadingComments)
  
  const handleCollapseToggle = () => {
    const newState = !isCollapsed
    if (onCollapseChange) {
      onCollapseChange(newState)
    } else {
      setInternalIsCollapsed(newState)
    }
  }

  return (
    <aside 
      className={cn(
        "fixed top-16 bottom-0 z-30 h-full border-r border-slate-200/60 shadow-sm transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-80",
        isMainSidebarCollapsed ? "lg:left-16" : "lg:left-64"
      )}
      style={{ backgroundColor: "#344256" }}
    >
      <div className="relative flex flex-col h-full">
        {/* Header avec bouton de rétractement */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200/20 flex-shrink-0">
          {!isCollapsed && (
            <div className="flex items-center justify-between flex-1">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                Forums
              </h3>
              <button
                onClick={() => {
                  console.log("🟣 [FORUM_SIDEBAR] Bouton Créer (Forum) cliqué")
                  if (onCreateForum) {
                    onCreateForum()
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-500/30 hover:bg-blue-500/40 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 border border-blue-400/30 shadow-sm"
                title="Créer un nouveau forum"
              >
                <Plus className="h-3.5 w-3.5" />
                Créer
              </button>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCollapseToggle}
            className={cn(
              "h-8 w-8 p-0 text-slate-300 hover:text-white hover:bg-slate-500/20 rounded-lg transition-all duration-200",
              isCollapsed && "mx-auto"
            )}
            aria-label={isCollapsed ? "Développer le menu" : "Rétracter le menu"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Zone scrollable avec forums et conversations */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-slate-400 text-sm">Chargement...</p>
            </div>
          ) : (
            <>
              {/* Liste des forums */}
              <div className="px-4 pt-4 pb-4">
                {forums.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-slate-400 text-sm">Aucun forum</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {forums.map((forum) => {
                    const forumIdStr = typeof forum.id === 'number' ? forum.id.toString() : forum.id
                    const isActive = selectedForumId === forumIdStr || selectedForumId === forum.id?.toString()
                    return (
                      <button
                        key={forum.id}
                        onClick={() => {
                          console.log("🟣 [FORUM_SIDEBAR] Forum cliqué:", forum.id, forum.name)
                          if (onSelectForum) {
                            onSelectForum(forum)
                          }
                        }}
                        className={cn(
                          "group flex items-start gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300 relative overflow-hidden w-full text-left",
                          isActive
                            ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white shadow-sm border border-blue-400/30"
                            : "text-slate-200 hover:bg-slate-500/20 hover:text-white hover:shadow-sm",
                          isCollapsed && "justify-center"
                        )}
                        title={isCollapsed ? forum.name : undefined}
                      >
                        {/* Effet de survol avec gradient */}
                        <div className={cn(
                          "absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 transition-opacity duration-300",
                          "group-hover:opacity-100"
                        )} />
                        
                        {!isCollapsed && (
                          <>
                            {/* Image du forum */}
                            <div className={cn(
                              "relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg transition-all duration-300",
                              isActive 
                                ? "ring-2 ring-blue-400/50 shadow-sm" 
                                : "group-hover:ring-2 group-hover:ring-blue-400/30"
                            )}>
                              <Image
                                src={forum.image || "/placeholder.svg"}
                                alt={forum.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            
                            {/* Contenu */}
                            <div className="flex-1 min-w-0 relative z-10">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-medium text-sm line-clamp-2 flex-1">{forum.name}</h4>
                                {isActive && (
                                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse flex-shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-slate-400 line-clamp-2 mb-2">{forum.description || 'Aucune description'}</p>
                              <div className="flex items-center gap-3">
                                <Badge 
                                  variant="secondary" 
                                  className={cn(
                                    "h-5 px-2 text-xs font-medium transition-all duration-300 flex items-center gap-1",
                                    isActive 
                                      ? "bg-blue-500/30 text-white border-blue-400/50" 
                                      : "bg-slate-500/20 text-slate-300 border-slate-400/30"
                                  )}
                                >
                                  <MessageSquare className="h-3 w-3" />
                                  {forum.conversationCount}
                                </Badge>
                                <span className={cn(
                                  "text-xs transition-colors",
                                  isActive ? "text-slate-300" : "text-slate-500"
                                )}>
                                  {forum.memberCount} membres
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {isCollapsed && (
                          <div className={cn(
                            "p-2 rounded-lg transition-all duration-300 relative z-10",
                            isActive 
                              ? "bg-blue-500/30 text-white shadow-sm" 
                              : "bg-slate-500/20 text-slate-300 group-hover:bg-blue-500/30 group-hover:text-white"
                          )}>
                            <Image
                              src={forum.image || "/placeholder.svg"}
                              alt={forum.name}
                              width={24}
                              height={24}
                              className="object-cover rounded"
                            />
                          </div>
                        )}
                      </button>
                    )
                  })}
                  </div>
                )}
              </div>
              
              {/* Séparateur pour les commentaires */}
              {selectedConversationId && comments.length > 0 && !isCollapsed && (
                <div className="px-4 py-2 border-t border-slate-200/20">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Commentaires</h4>
                </div>
              )}
              
              {/* Liste des commentaires */}
              {selectedConversationId && (
                <div className="px-4 pt-2 pb-4">
                  {isLoadingComments ? (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-slate-400 text-xs">Chargement...</p>
                    </div>
                  ) : comments.length === 0 ? (
                    !isCollapsed && (
                      <div className="flex items-center justify-center py-4">
                        <p className="text-slate-400 text-xs">Aucun commentaire</p>
                      </div>
                    )
                  ) : (
                    <div className="space-y-2">
                      {comments.map((comment, index) => (
                        <div
                          key={comment.id || `comment-${index}`}
                          className={cn(
                            "group flex items-start gap-2 px-2 py-2 text-xs rounded-lg transition-all duration-200",
                            "bg-slate-500/10 hover:bg-slate-500/20"
                          )}
                        >
                          {!isCollapsed && (
                            <>
                              <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full ring-1 ring-slate-400/30">
                                <Image
                                  src={comment.authorAvatar || "/placeholder.svg"}
                                  alt={comment.author}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-slate-200 text-xs line-clamp-1">{comment.author}</span>
                                  <span className="text-slate-500 text-[10px]">{comment.timestamp}</span>
                                </div>
                                <p className="text-slate-300 text-xs line-clamp-2">{comment.content}</p>
                                {comment.likes > 0 && (
                                  <div className="mt-1 flex items-center gap-1">
                                    <MessageSquare className="h-3 w-3 text-slate-400" />
                                    <span className="text-slate-400 text-[10px]">{comment.likes}</span>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                          {isCollapsed && (
                            <div className="relative h-6 w-6 mx-auto overflow-hidden rounded-full ring-1 ring-slate-400/30">
                              <Image
                                src={comment.authorAvatar || "/placeholder.svg"}
                                alt={comment.author}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

