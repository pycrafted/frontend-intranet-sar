"use client"

import { MessageSquare, Eye, Send } from "lucide-react"
import type { Conversation } from "./forum-page"
import Image from "next/image"
import { useState } from "react"
import React from "react"
import { useForum } from "@/hooks/useForum"
import { useAuth } from "@/contexts/AuthContext"

interface ConversationListProps {
  conversations: Conversation[]
  onSelectConversation: (conversation: Conversation) => void
  forumId: number | null
  isLoading?: boolean
}

export function ConversationList({ conversations, onSelectConversation, forumId, isLoading = false }: ConversationListProps) {
  const { user } = useAuth()
  const { createConversation } = useForum()
  const [newConversationContent, setNewConversationContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Log quand conversations change
  React.useEffect(() => {
    console.log('📋📋📋 [CONV_LIST] ===== CONVERSATIONS REÇUES =====')
    console.log('📋 [CONV_LIST] conversations.length:', conversations.length)
    console.log('📋 [CONV_LIST] forumId:', forumId)
    console.log('📋 [CONV_LIST] isLoading:', isLoading)
    conversations.forEach((c, idx) => {
      console.log(`📋 [CONV_LIST]   ${idx + 1}. ID=${c.id}, forumId=${c.forumId}, message="${c.message?.substring(0, 40)}"`)
    })
    console.log('📋📋📋 [CONV_LIST] ===== FIN CONVERSATIONS REÇUES =====')
  }, [conversations, forumId, isLoading])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedContent = newConversationContent.trim()
    if (!trimmedContent || trimmedContent.length < 3 || !user || !forumId) {
      if (trimmedContent && trimmedContent.length < 3) {
        alert('Le message doit contenir au moins 3 caractères.')
      }
      return
    }
    
    console.log('📝📝📝 [CONV_LIST] ===== DÉBUT SOUMISSION =====')
    console.log('📝 [CONV_LIST] forumId:', forumId)
    console.log('📝 [CONV_LIST] conversations AVANT création:', conversations.length)
    
    setIsSubmitting(true)
    try {
      const forumIdNum = typeof forumId === 'string' ? parseInt(forumId) : Number(forumId)
      console.log('📝 [CONV_LIST] Appel createConversation avec forumIdNum:', forumIdNum)
      
      const newConversation = await createConversation({
        forum: forumIdNum,
        content: trimmedContent,
      })
      
      console.log('📝 [CONV_LIST] createConversation terminé, conversation retournée:', newConversation?.id)
      setNewConversationContent("")
      console.log('📝📝📝 [CONV_LIST] ===== FIN SOUMISSION =====')
    } catch (error) {
      console.error('❌ [CONV_LIST] Erreur:', error)
      alert('Erreur lors de la publication. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-3">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Conversations</h3>
        {isLoading && (
          <span className="text-xs text-muted-foreground animate-pulse">Synchronisation...</span>
        )}
      </div>

      {conversations.length > 0 && (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className="group p-4 transition-all hover:bg-muted/50 cursor-pointer"
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={conversation.authorAvatar || "/placeholder.svg"}
                        alt={conversation.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors text-pretty">
                        {conversation.message && conversation.message.length > 100 
                          ? conversation.message.substring(0, 100) + "..." 
                          : conversation.message || 'Sans message'}
                      </h4>
                    </div>

                    <div className="mb-3 text-sm text-muted-foreground">
                      Par <span className="font-medium">{conversation.author}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {conversation.replies} réponses
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {conversation.views} vues
                      </span>
                      <span className="ml-auto">{conversation.lastActivity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Formulaire de création rapide de conversation - Toujours affiché si un forum est sélectionné */}
      {forumId && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-100">
                <Image 
                  src={user?.avatar_url || "/photo_profil.png"} 
                  alt={user?.full_name || "Vous"} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <textarea
                  value={newConversationContent}
                  onChange={(e) => setNewConversationContent(e.target.value)}
                  placeholder="Écrivez votre message..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting || !newConversationContent.trim()}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Publication..." : "Publier"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}


