"use client"

import { MessageSquare, Eye, CheckCircle2, Send } from "lucide-react"
import type { Conversation } from "./forum-page"
import Image from "next/image"
import { useState } from "react"
import { useForum } from "@/hooks/useForum"
import { useAuth } from "@/contexts/AuthContext"

interface ConversationListProps {
  conversations: Conversation[]
  onSelectConversation: (conversation: Conversation) => void
  forumId: number | null
}

export function ConversationList({ conversations, onSelectConversation, forumId }: ConversationListProps) {
  const { user } = useAuth()
  const { createConversation } = useForum()
  const [newConversationContent, setNewConversationContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newConversationContent.trim() || !user || !forumId) {
      return
    }
    
    setIsSubmitting(true)
    try {
      console.log('🟢 [CONVERSATION_LIST] Création de la conversation pour le forum:', forumId)
      console.log('🟢 [CONVERSATION_LIST] Contenu:', newConversationContent.trim())
      
      const newConversation = await createConversation({
        forum: forumId,
        content: newConversationContent.trim(),
      })
      
      console.log('🟢 [CONVERSATION_LIST] Conversation créée (réponse):', newConversation)
      console.log('🟢 [CONVERSATION_LIST] Détails de la conversation:', {
        id: newConversation?.id,
        title: newConversation?.title,
        forumId: newConversation?.forumId,
        forum: newConversation?.forum,
        isResolved: newConversation?.isResolved
      })
      
      setNewConversationContent("")
      
      // La conversation est déjà ajoutée à la liste et rechargée par createConversation
      // (createConversation appelle fetchConversations automatiquement, comme pour les commentaires)
      console.log('✅ [CONVERSATION_LIST] Conversation créée et liste mise à jour automatiquement')
      console.log('🟢 [CONVERSATION_LIST] ===== FIN handleSubmit =====')
    } catch (error) {
      console.error('❌ [CONVERSATION_LIST] Erreur lors de la création de la conversation:', error)
      alert('Erreur lors de la publication. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="space-y-3">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Conversations</h3>
      </div>

      {conversations.length > 0 && (
        <div className="space-y-3">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => onSelectConversation(conversation)}
              className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm cursor-pointer"
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
                      {conversation.title}
                    </h4>
                    {conversation.isResolved && <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-600" />}
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


