"use client"

import type React from "react"

import { ArrowLeft, MessageSquare, Eye, ThumbsUp, Send } from "lucide-react"
import type { Conversation } from "./forum-page"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useForum } from "@/hooks/useForum"
import { useAuth } from "@/contexts/AuthContext"

interface Comment {
  id: number | string
  author: string
  authorAvatar: string
  content: string
  timestamp: string
  likes: number
  is_liked?: boolean
}

interface ConversationDetailProps {
  conversation: Conversation
  onBack: () => void
}

export function ConversationDetail({ conversation, onBack }: ConversationDetailProps) {
  const { user } = useAuth()
  const {
    comments: apiComments,
    isLoadingComments,
    fetchComments,
    createComment,
    toggleCommentLike,
  } = useForum()
  
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Récupérer les commentaires pour cette conversation
  const conversationId = typeof conversation.id === 'string' ? parseInt(conversation.id) : conversation.id
  const comments: Comment[] = (apiComments[conversationId] || []).map(c => ({
    id: c.id,
    author: c.author?.full_name || c.author?.username || 'Utilisateur',
    authorAvatar: c.authorAvatar || c.author?.avatar_url || '/photo_profil.png',
    content: c.content,
    timestamp: c.timestamp,
    likes: c.likes || c.likes_count || 0,
    is_liked: c.is_liked || false,
  }))
  
  // Charger les commentaires au montage et quand la conversation change
  useEffect(() => {
    if (conversationId) {
      fetchComments(conversationId)
    }
  }, [conversationId, fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || !user) {
      return
    }
    
    setIsSubmitting(true)
    try {
      await createComment({
        conversation: conversationId,
        content: newComment.trim(),
      })
      setNewComment("")
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error)
      alert('Erreur lors de la publication du commentaire. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleLike = async (commentId: number | string) => {
    if (!user) {
      alert('Vous devez être connecté pour liker un commentaire')
      return
    }
    
    const id = typeof commentId === 'string' ? parseInt(commentId) : commentId
    try {
      await toggleCommentLike(id)
    } catch (error) {
      console.error('Erreur lors du like:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec image et informations - Design professionnel */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-xl shadow-lg">
        <Image
          src={conversation.image || "/placeholder.svg"}
          alt={conversation.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

        {/* Back button positioned at top left */}
        <button
          onClick={onBack}
          className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-black/50 backdrop-blur-sm px-3 py-2 text-sm text-white transition-all hover:bg-black/70 shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-balance leading-tight">{conversation.title}</h1>

          {/* Author and metadata */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full ring-2 ring-white/30 shadow-md">
                <Image
                  src={conversation.authorAvatar || "/placeholder.svg"}
                  alt={conversation.author}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-semibold text-white text-sm sm:text-base">{conversation.author}</div>
                <div className="text-xs sm:text-sm text-white/80">{conversation.lastActivity}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/90">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <MessageSquare className="h-4 w-4" />
                {conversation.replies} réponses
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <Eye className="h-4 w-4" />
                {conversation.views} vues
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu de la conversation */}
      {conversation.description && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {conversation.description}
            </p>
          </div>
        </div>
      )}

      {/* Comments section - Design professionnel */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Réponses ({comments.length})</h3>
        </div>

        {isLoadingComments && comments.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Chargement des commentaires...</p>
          </div>
        ) : comments.length > 0 && (
          <div className="space-y-4">
            {comments.map((comment, index) => (
            <div key={comment.id || `comment-${index}`} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="mb-4 flex items-start gap-4">
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-100">
                  <Image
                    src={comment.authorAvatar || "/placeholder.svg"}
                    alt={comment.author}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{comment.author}</span>
                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 text-pretty">{comment.content}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 pl-16">
                <button 
                  onClick={() => handleLike(comment.id)}
                  className={`flex items-center gap-1.5 text-xs transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 ${
                    comment.is_liked 
                      ? 'text-red-600' 
                      : 'text-gray-600 hover:text-red-600'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${comment.is_liked ? 'fill-current' : ''}`} />
                  <span className="font-medium">{comment.likes}</span>
                </button>
                <button className="text-xs text-gray-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50">Répondre</button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* New comment form - Design professionnel */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full ring-2 ring-gray-100">
            <Image src="/photo_profil.png" alt="Votre avatar" fill className="object-cover" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Ajouter votre réponse</h4>
            <p className="text-sm text-gray-600">Partagez votre point de vue avec la communauté</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Partagez vos idées, posez vos questions..."
              className="min-h-[140px] w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-sm transition-all focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:shadow-md"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-xs text-gray-500 italic">Soyez respectueux et constructif dans vos échanges</p>
            <button
              type="submit"
              disabled={!user || isSubmitting || !newComment.trim()}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Publication...' : 'Publier ma réponse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

