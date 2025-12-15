import { useState, useCallback, useEffect } from 'react'
import {
  getForums,
  getForum,
  createForum,
  updateForum,
  deleteForum,
  getForumMessages,
  createForumMessage,
  updateForumMessage,
  deleteForumMessage,
} from '@/lib/forum-api'
import type {
  Forum,
  ForumMessage,
  ForumCreateData,
  ForumUpdateData,
  ForumMessageCreateData,
  ForumFilters,
} from '@/lib/types/forum'

export function useForum() {
  const [forums, setForums] = useState<Forum[]>([])
  const [currentForum, setCurrentForum] = useState<Forum | null>(null)
  const [messages, setMessages] = useState<ForumMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Charger la liste des forums
  const fetchForums = useCallback(async (filters?: ForumFilters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getForums(filters)
      setForums(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des forums'
      setError(errorMessage)
      console.error('Erreur fetchForums:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Charger un forum spécifique
  const fetchForum = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getForum(id)
      setCurrentForum(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du forum'
      setError(errorMessage)
      console.error('Erreur fetchForum:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Créer un forum
  const createForumHandler = useCallback(async (data: ForumCreateData) => {
    try {
      setLoading(true)
      setError(null)
      const newForum = await createForum(data)
      setForums((prev) => [newForum, ...prev])
      return newForum
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du forum'
      setError(errorMessage)
      console.error('Erreur createForum:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Mettre à jour un forum
  const updateForumHandler = useCallback(async (id: number, data: ForumUpdateData) => {
    try {
      setLoading(true)
      setError(null)
      const updatedForum = await updateForum(id, data)
      setForums((prev) =>
        prev.map((f) => (f.id === id ? updatedForum : f))
      )
      if (currentForum?.id === id) {
        setCurrentForum(updatedForum)
      }
      return updatedForum
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du forum'
      setError(errorMessage)
      console.error('Erreur updateForum:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [currentForum])

  // Supprimer un forum
  const deleteForumHandler = useCallback(async (id: number) => {
    try {
      setLoading(true)
      setError(null)
      await deleteForum(id)
      setForums((prev) => prev.filter((f) => f.id !== id))
      if (currentForum?.id === id) {
        setCurrentForum(null)
      }
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du forum'
      setError(errorMessage)
      console.error('Erreur deleteForum:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [currentForum])

  // Charger les messages d'un forum
  const fetchMessages = useCallback(async (forumId: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getForumMessages(forumId)
      setMessages(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des messages'
      setError(errorMessage)
      console.error('Erreur fetchMessages:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Créer un message
  const createMessage = useCallback(async (forumId: number, content: string, image?: File | null) => {
    try {
      setLoading(true)
      setError(null)
      const newMessage = await createForumMessage(forumId, { content, image })
      setMessages((prev) => [...prev, newMessage])
      
      // Récupérer le nom de l'auteur de manière sécurisée
      const authorName = newMessage.author_info?.full_name || 
                        (newMessage.author_info?.first_name && newMessage.author_info?.last_name
                          ? `${newMessage.author_info.first_name} ${newMessage.author_info.last_name}`
                          : newMessage.author_info?.username || 'Utilisateur')
      
      // Mettre à jour le forum actuel si c'est le bon
      if (currentForum?.id === forumId) {
        setCurrentForum((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            message_count: prev.message_count + 1,
            last_message: {
              created_at: newMessage.created_at,
              author: authorName,
            },
          }
        })
      }
      // Mettre à jour la liste des forums
      setForums((prev) =>
        prev.map((f) => {
          if (f.id === forumId) {
            return {
              ...f,
              message_count: f.message_count + 1,
              last_message: {
                created_at: newMessage.created_at,
                author: authorName,
              },
            }
          }
          return f
        })
      )
      return newMessage
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du message'
      setError(errorMessage)
      console.error('Erreur createMessage:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [currentForum])

  // Mettre à jour un message
  const updateMessage = useCallback(async (messageId: number, content: string, image?: File | null) => {
    try {
      setLoading(true)
      setError(null)
      const updatedMessage = await updateForumMessage(messageId, { content, image })
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? updatedMessage : m))
      )
      return updatedMessage
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du message'
      setError(errorMessage)
      console.error('Erreur updateMessage:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Supprimer un message
  const deleteMessage = useCallback(async (messageId: number) => {
    try {
      setLoading(true)
      setError(null)
      await deleteForumMessage(messageId)
      const deletedMessage = messages.find((m) => m.id === messageId)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
      
      // Mettre à jour les statistiques du forum
      if (deletedMessage && currentForum) {
        setCurrentForum((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            message_count: Math.max(0, prev.message_count - 1),
          }
        })
        setForums((prev) =>
          prev.map((f) => {
            if (f.id === deletedMessage.forum) {
              return {
                ...f,
                message_count: Math.max(0, f.message_count - 1),
              }
            }
            return f
          })
        )
      }
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du message'
      setError(errorMessage)
      console.error('Erreur deleteMessage:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [messages, currentForum])

  // Réinitialiser l'état
  const reset = useCallback(() => {
    setForums([])
    setCurrentForum(null)
    setMessages([])
    setError(null)
  }, [])

  return {
    // État
    forums,
    currentForum,
    messages,
    loading,
    error,
    
    // Actions
    fetchForums,
    fetchForum,
    createForum: createForumHandler,
    updateForum: updateForumHandler,
    deleteForum: deleteForumHandler,
    fetchMessages,
    createMessage,
    updateMessage,
    deleteMessage,
    reset,
  }
}

