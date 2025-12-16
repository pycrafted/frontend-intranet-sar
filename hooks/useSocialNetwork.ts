import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '@/lib/api-client'
import { useAuth } from '@/contexts/AuthContext'
import { User } from '@/contexts/AuthContext'

// Interfaces alignées avec le backend et le frontend
export interface Conversation {
  id: string
  name: string
  avatar: string | null
  lastMessage: string
  time: string
  unread?: number
  online?: boolean
  type?: 'direct' | 'group'
  created_at?: string
  last_message_at?: string
  participants?: User[]
  is_pinned?: boolean
}

export interface Message {
  id: string
  text: string
  time: string
  sent: boolean
  conversation?: number
  sender?: User
  message_type?: 'text' | 'image' | 'file' | 'system'
  created_at?: string
  is_read?: boolean
  is_deleted?: boolean
  is_edited?: boolean
  attachment?: string | null
  attachment_url?: string | null
}

export interface SearchUserResult extends User {
  // User étend déjà ce dont on a besoin
}

interface UseSocialNetworkReturn {
  // État des conversations
  conversations: Conversation[]
  isLoadingConversations: boolean
  conversationsError: string | null
  
  // État des messages
  messages: Record<string, Message[]> // key = conversationId
  isLoadingMessages: boolean
  messagesError: string | null
  
  // État de la recherche d'utilisateurs
  searchResults: SearchUserResult[]
  isSearching: boolean
  searchError: string | null
  
  // Fonctions pour les conversations
  fetchConversations: () => Promise<void>
  getConversation: (id: string) => Conversation | undefined
  createConversation: (participantIds: number[]) => Promise<Conversation | null>
  createConversationWithUser: (userId: number) => Promise<Conversation | null>
  toggleFavorite: (conversationId: string) => Promise<void>
  deleteConversation: (conversationId: string) => Promise<void>
  
  // Fonctions pour les messages
  fetchMessages: (conversationId: string) => Promise<void>
  sendMessage: (conversationId: string, content: string, replyToId?: string, attachment?: File) => Promise<Message | null>
  updateMessage: (messageId: string, content: string) => Promise<Message | null>
  deleteMessage: (messageId: string) => Promise<void>
  markMessagesAsRead: (conversationId: string, messageIds?: string[]) => Promise<void>
  
  // Fonction de recherche
  searchUsers: (query: string) => Promise<void>
  clearSearch: () => void
  
  // Fonctions utilitaires
  refreshConversations: () => Promise<void>
  refreshMessages: (conversationId: string) => Promise<void>
  checkNewMessages: (conversationId: string) => Promise<void>
}

export function useSocialNetwork(): UseSocialNetworkReturn {
  const { isAuthenticated, user } = useAuth()
  
  // État des conversations
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [conversationsError, setConversationsError] = useState<string | null>(null)
  
  // État des messages (organisés par conversationId)
  const [messages, setMessages] = useState<Record<string, Message[]>>({})
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  
  // État de la recherche
  const [searchResults, setSearchResults] = useState<SearchUserResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  
  // Variable pour éviter les appels multiples simultanés
  const fetchingRef = useRef(false)
  const isPollingRef = useRef(false)
  
  // Charger les conversations
  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('🔒 [USE_SOCIAL_NETWORK] Utilisateur non authentifié, requête annulée')
      return
    }
    
    // Éviter les appels multiples simultanés
    if (fetchingRef.current) {
      console.log('⏳ [USE_SOCIAL_NETWORK] Déjà en cours de chargement, requête ignorée')
      return
    }
    
    fetchingRef.current = true
    setIsLoadingConversations(true)
    setConversationsError(null)
    
    try {
      console.log('💬 [USE_SOCIAL_NETWORK] Récupération des conversations...')
      const response = await api.get('/reseau-social/conversations/')
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📦 [USE_SOCIAL_NETWORK] Conversations reçues:', data)
      
      // Normaliser les données pour correspondre à l'interface Conversation
      const normalizedConversations: Conversation[] = Array.isArray(data) 
        ? data 
        : (data.results || [])
      
      // S'assurer que tous les champs nécessaires sont présents
      const formattedConversations = normalizedConversations.map((conv: any) => ({
        id: String(conv.id),
        name: conv.name || conv.display_name || 'Conversation',
        avatar: conv.avatar || null,
        lastMessage: conv.lastMessage || conv.last_message?.content || 'Aucun message',
        time: conv.time || '',
        unread: conv.unread ?? conv.unread_count ?? 0,
        online: conv.online ?? false,
        type: conv.type || 'direct',
        created_at: conv.created_at,
        last_message_at: conv.last_message_at,
        participants: conv.participants || [],
        is_pinned: conv.is_pinned ?? false,
      }))
      
      // Comparer avec les conversations existantes pour éviter les re-renders inutiles
      setConversations(prev => {
        // Si c'est la première fois, mettre à jour
        if (prev.length === 0) {
          return formattedConversations
        }
        
        // Comparer les IDs et les données importantes de manière stricte
        const prevMap = new Map(prev.map(c => [c.id, c]))
        let hasRealChanges = false
        
        // Vérifier si le nombre de conversations a changé
        if (prev.length !== formattedConversations.length) {
          hasRealChanges = true
        }
        
        // Comparer chaque conversation
        for (const newConv of formattedConversations) {
          const prevConv = prevMap.get(newConv.id)
          
          // Nouvelle conversation
          if (!prevConv) {
            hasRealChanges = true
            break
          }
          
          // Comparer uniquement les champs qui peuvent réellement changer et qui sont visibles
          // Ignorer les participants car ils changent de référence même si identiques
          if (
            prevConv.lastMessage !== newConv.lastMessage ||
            prevConv.time !== newConv.time ||
            prevConv.unread !== newConv.unread ||
            prevConv.online !== newConv.online ||
            prevConv.is_pinned !== newConv.is_pinned ||
            prevConv.name !== newConv.name ||
            prevConv.avatar !== newConv.avatar
          ) {
            hasRealChanges = true
            break
          }
        }
        
        // Vérifier aussi si une conversation a été supprimée
        if (!hasRealChanges) {
          const newIds = new Set(formattedConversations.map(c => c.id))
          hasRealChanges = prev.some(c => !newIds.has(c.id))
        }
        
        // Mettre à jour seulement s'il y a de vrais changements
        if (hasRealChanges) {
          return formattedConversations
        }
        
        // Aucun changement visible, retourner l'ancien état pour éviter le re-render
        return prev
      })
      
      console.log(`✅ [USE_SOCIAL_NETWORK] ${formattedConversations.length} conversations chargées`)
    } catch (err: any) {
      console.error('❌ [USE_SOCIAL_NETWORK] Erreur fetchConversations:', err)
      setConversationsError(err.message || 'Erreur lors de la récupération des conversations')
      // Ne pas vider les conversations en cas d'erreur pour éviter la perte de données
      // setConversations([])
    } finally {
      setIsLoadingConversations(false)
      fetchingRef.current = false
    }
  }, [isAuthenticated])
  
  // Récupérer une conversation par ID
  const getConversation = useCallback((id: string): Conversation | undefined => {
    return conversations.find(conv => conv.id === id)
  }, [conversations])
  
  // Créer une conversation
  const createConversation = useCallback(async (participantIds: number[]): Promise<Conversation | null> => {
    if (!isAuthenticated) {
      console.log('🔒 [USE_SOCIAL_NETWORK] Utilisateur non authentifié')
      return null
    }
    
    try {
      console.log('➕ [USE_SOCIAL_NETWORK] Création d\'une conversation...', { participantIds })
      const response = await api.post('/reseau-social/conversations/', {
        type: participantIds.length === 1 ? 'direct' : 'group',
        participant_ids: participantIds,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ [USE_SOCIAL_NETWORK] Conversation créée:', data)
      
      // Normaliser et ajouter à la liste
      const newConversation: Conversation = {
        id: String(data.id),
        name: data.name || data.display_name || 'Conversation',
        avatar: data.avatar || null,
        lastMessage: data.lastMessage || 'Aucun message',
        time: data.time || '',
        unread: 0,
        online: false,
        type: data.type || 'direct',
        participants: data.participants || [],
      }
      
      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (err: any) {
      console.error('❌ [USE_SOCIAL_NETWORK] Erreur createConversation:', err)
      setConversationsError(err.message || 'Erreur lors de la création de la conversation')
      return null
    }
  }, [isAuthenticated])
  
  // Créer une conversation avec un utilisateur spécifique (plus simple)
  const createConversationWithUser = useCallback(async (userId: number): Promise<Conversation | null> => {
    if (!isAuthenticated) {
      console.log('🔒 [USE_SOCIAL_NETWORK] Utilisateur non authentifié')
      return null
    }
    
    try {
      console.log('➕ [USE_SOCIAL_NETWORK] Création d\'une conversation avec l\'utilisateur...', { userId })
      const response = await api.post('/reseau-social/conversations/create-with-user/', {
        user_id: userId,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ [USE_SOCIAL_NETWORK] Conversation créée/trouvée:', data)
      
      // Normaliser et vérifier si elle existe déjà dans la liste
      const newConversation: Conversation = {
        id: String(data.id),
        name: data.name || data.display_name || 'Conversation',
        avatar: data.avatar || null,
        lastMessage: data.lastMessage || 'Aucun message',
        time: data.time || '',
        unread: data.unread ?? 0,
        online: false,
        type: data.type || 'direct',
        participants: data.participants || [],
      }
      
      // Si la conversation existe déjà, la mettre à jour, sinon l'ajouter
      setConversations(prev => {
        const existingIndex = prev.findIndex(conv => conv.id === newConversation.id)
        if (existingIndex >= 0) {
          // Mettre à jour
          const updated = [...prev]
          updated[existingIndex] = newConversation
          return updated
        } else {
          // Ajouter au début
          return [newConversation, ...prev]
        }
      })
      
      return newConversation
    } catch (err: any) {
      console.error('❌ [USE_SOCIAL_NETWORK] Erreur createConversationWithUser:', err)
      setConversationsError(err.message || 'Erreur lors de la création de la conversation')
      return null
    }
  }, [isAuthenticated])
  
  // Charger les messages d'une conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!isAuthenticated) {
      console.log('🔒 [USE_SOCIAL_NETWORK] Utilisateur non authentifié')
      return
    }
    
    setIsLoadingMessages(true)
    setMessagesError(null)
    
    try {
      console.log('💬 [USE_SOCIAL_NETWORK] Récupération des messages...', { conversationId })
      const response = await api.get(`/reseau-social/conversations/${conversationId}/messages/`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📦 [USE_SOCIAL_NETWORK] Messages reçus:', data)
      
      // Normaliser les messages
      const messagesArray: Message[] = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : []
      
      const formattedMessages: Message[] = messagesArray.map((msg: any) => ({
        id: String(msg.id),
        text: msg.text || msg.content || '',
        time: msg.time || new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        sent: msg.sent ?? (msg.sender?.id === user?.id),
        conversation: msg.conversation,
        sender: msg.sender,
        message_type: msg.message_type || 'text',
        created_at: msg.created_at,
        is_read: msg.is_read,
        attachment: msg.attachment || null,
        attachment_url: msg.attachment_url || null,
        is_deleted: msg.is_deleted ?? false,
        is_edited: msg.is_edited ?? false,
      }))
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: formattedMessages,
      }))
      
      console.log(`✅ [USE_SOCIAL_NETWORK] ${formattedMessages.length} messages chargés pour la conversation ${conversationId}`)
    } catch (err: any) {
      console.error('❌ [USE_SOCIAL_NETWORK] Erreur fetchMessages:', err)
      setMessagesError(err.message || 'Erreur lors de la récupération des messages')
      setMessages(prev => ({
        ...prev,
        [conversationId]: [],
      }))
    } finally {
      setIsLoadingMessages(false)
    }
  }, [isAuthenticated, user])
  
  // Envoyer un message
  const sendMessage = useCallback(async (
    conversationId: string,
    content: string,
    replyToId?: string,
    attachment?: File
  ): Promise<Message | null> => {
    if (!isAuthenticated || (!content.trim() && !attachment)) {
      console.log('🔒 [USE_SOCIAL_NETWORK] Utilisateur non authentifié ou message vide')
      return null
    }
    
    try {
      console.log('📤 [USE_SOCIAL_NETWORK] Envoi d\'un message...', { conversationId, content, hasAttachment: !!attachment })
      
      let response: Response
      
      // Déterminer le type de message
      let messageType: 'text' | 'image' | 'file' = 'text'
      if (attachment) {
        // Vérifier si c'est une image
        if (attachment.type.startsWith('image/')) {
          messageType = 'image'
        } else {
          messageType = 'file'
        }
      }
      
      if (attachment) {
        // Utiliser FormData pour les fichiers
        const formData = new FormData()
        formData.append('content', content.trim() || '')
        formData.append('message_type', messageType)
        formData.append('attachment', attachment)
        if (replyToId) {
          formData.append('reply_to', replyToId.toString())
        }
        
        console.log('📎 [USE_SOCIAL_NETWORK] Envoi de fichier avec FormData:', {
          content: content.trim() || '',
          message_type: messageType,
          attachment_name: attachment.name,
          attachment_size: attachment.size,
          attachment_type: attachment.type,
          reply_to: replyToId || null
        })
        
        response = await api.post(`/reseau-social/conversations/${conversationId}/messages/`, formData)
      } else {
        // Requête JSON normale
        response = await api.post(`/reseau-social/conversations/${conversationId}/messages/`, {
          content: content.trim(),
          message_type: messageType,
          ...(replyToId && { reply_to: parseInt(replyToId) }),
        })
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ [USE_SOCIAL_NETWORK] Message envoyé:', data)
      
      // Normaliser le message
      const newMessage: Message = {
        id: String(data.id),
        text: data.text || data.content || content,
        time: data.time || new Date(data.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        sent: true,
        conversation: data.conversation,
        sender: data.sender || user,
        message_type: data.message_type || messageType,
        created_at: data.created_at,
        is_read: false,
        attachment: data.attachment || null,
        attachment_url: data.attachment_url || null,
        is_deleted: data.is_deleted ?? false,
        is_edited: data.is_edited ?? false,
      }
      
      // Ajouter le message à la liste
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMessage],
      }))
      
      // Rafraîchir les conversations pour mettre à jour lastMessage (seulement si succès)
      // Utiliser setTimeout pour éviter les conflits avec d'autres appels
      setTimeout(() => {
        fetchConversations().catch(err => {
          console.error('❌ [USE_SOCIAL_NETWORK] Erreur lors du rafraîchissement des conversations:', err)
        })
      }, 500)
      
      return newMessage
    } catch (err: any) {
      console.error('❌ [USE_SOCIAL_NETWORK] Erreur sendMessage:', err)
      setMessagesError(err.message || 'Erreur lors de l\'envoi du message')
      return null
    }
  }, [isAuthenticated, user, fetchConversations])
  
  // Supprimer un message
  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!isAuthenticated) {
      console.log('🔒 [USE_SOCIAL_NETWORK] Utilisateur non authentifié')
      return
    }
    
    try {
      console.log('🗑️ [USE_SOCIAL_NETWORK] Suppression du message...', { messageId })
      const response = await api.delete(`/reseau-social/messages/${messageId}/`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }
      
      // Mettre à jour le message dans le cache local pour afficher "Message supprimé"
      setMessages(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(convId => {
          updated[convId] = updated[convId].map(msg => 
            msg.id === messageId 
              ? { ...msg, text: 'Message supprimé', is_deleted: true, attachment_url: null, attachment: null }
              : msg
          )
        })
        return updated
      })
      
      // Rafraîchir les conversations pour mettre à jour le dernier message
      setTimeout(() => {
        fetchConversations().catch(err => {
          console.error('❌ [USE_SOCIAL_NETWORK] Erreur lors du rafraîchissement des conversations:', err)
        })
      }, 500)
      
      console.log('✅ [USE_SOCIAL_NETWORK] Message supprimé avec succès')
    } catch (err: any) {
      console.error('❌ [USE_SOCIAL_NETWORK] Erreur deleteMessage:', err)
      throw err
    }
  }, [isAuthenticated, fetchConversations])

  // Modifier un message
  const updateMessage = useCallback(async (messageId: string, content: string): Promise<Message | null> => {
    if (!isAuthenticated || !content.trim()) {
      console.log('🔒 [USE_SOCIAL_NETWORK] Utilisateur non authentifié ou contenu vide')
      return null
    }
    
    try {
      console.log('✏️ [USE_SOCIAL_NETWORK] Modification du message...', { messageId, content })
      const response = await api.patch(`/reseau-social/messages/${messageId}/`, {
        content: content.trim(),
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('✅ [USE_SOCIAL_NETWORK] Message modifié:', data)
      
      // Normaliser le message
      const updatedMessage: Message = {
        id: String(data.id),
        text: data.text || data.content || content,
        time: data.time || new Date(data.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        sent: data.sent ?? (data.sender?.id === user?.id),
        conversation: data.conversation,
        sender: data.sender || user,
        message_type: data.message_type || 'text',
        created_at: data.created_at,
        is_read: data.is_read,
        attachment: data.attachment || null,
        attachment_url: data.attachment_url || null,
        is_deleted: data.is_deleted ?? false,
        is_edited: data.is_edited ?? true, // Un message modifié est toujours marqué comme édité
      }
      
      // Mettre à jour le message dans le cache local
      setMessages(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(convId => {
          updated[convId] = updated[convId].map(msg => 
            msg.id === messageId ? updatedMessage : msg
          )
        })
        return updated
      })
      
      return updatedMessage
    } catch (err: any) {
      console.error('❌ [USE_SOCIAL_NETWORK] Erreur updateMessage:', err)
      throw err
    }
  }, [isAuthenticated, user])
  
  // Marquer les messages comme lus
  const markMessagesAsRead = useCallback(async (conversationId: string, messageIds?: string[]): Promise<void> => {
    if (!isAuthenticated) {
      return
    }
    
    try {
      console.log('✅ [USE_SOCIAL_NETWORK] Marquage des messages comme lus...', { conversationId, messageIds })
      const response = await api.post(`/reseau-social/conversations/${conversationId}/mark-read/`, {
        ...(messageIds && { message_ids: messageIds.map(id => parseInt(id)) }),
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      // Mettre à jour le statut local des messages
      if (messageIds) {
        setMessages(prev => {
          const conversationMessages = prev[conversationId] || []
          return {
            ...prev,
            [conversationId]: conversationMessages.map(msg =>
              messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
            ),
          }
        })
      } else {
        // Tous les messages sont marqués comme lus
        setMessages(prev => {
          const conversationMessages = prev[conversationId] || []
          return {
            ...prev,
            [conversationId]: conversationMessages.map(msg => ({ ...msg, is_read: true })),
          }
        })
      }
      
      // Mettre à jour localement le compteur de messages non lus dans la liste des conversations
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === conversationId) {
            // Si on a marqué des messages spécifiques, décrémenter le compteur
            if (messageIds && messageIds.length > 0) {
              const unreadCount = Math.max(0, (conv.unread || 0) - messageIds.length)
              return { ...conv, unread: unreadCount }
            } else {
              // Tous les messages sont marqués comme lus, mettre le compteur à 0
              return { ...conv, unread: 0 }
            }
          }
          return conv
        })
      })
      
      // Rafraîchir les conversations après un court délai pour synchroniser avec le backend
      setTimeout(() => {
        fetchConversations().catch(err => {
          console.error('❌ [USE_SOCIAL_NETWORK] Erreur lors du rafraîchissement des conversations:', err)
        })
      }, 500)
      
      console.log('✅ [USE_SOCIAL_NETWORK] Messages marqués comme lus')
    } catch (err: any) {
      console.error('❌ [USE_SOCIAL_NETWORK] Erreur markMessagesAsRead:', err)
    }
  }, [isAuthenticated, fetchConversations])
  
  // Rechercher des utilisateurs
  const searchUsers = useCallback(async (query: string): Promise<void> => {
    if (!isAuthenticated || query.length < 2) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    setSearchError(null)
    
    try {
      console.log('🔍 [USE_SOCIAL_NETWORK] Recherche d\'utilisateurs...', { query })
      const response = await api.get(`/reseau-social/users/search/?q=${encodeURIComponent(query)}`)
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📦 [USE_SOCIAL_NETWORK] Résultats de recherche:', data)
      
      setSearchResults(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('❌ [USE_SOCIAL_NETWORK] Erreur searchUsers:', err)
      setSearchError(err.message || 'Erreur lors de la recherche')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [isAuthenticated])
  
  // Effacer les résultats de recherche
  const clearSearch = useCallback(() => {
    setSearchResults([])
    setSearchError(null)
  }, [])
  
  // Rafraîchir les conversations
  const refreshConversations = useCallback(async () => {
    await fetchConversations()
  }, [fetchConversations])
  
  // Rafraîchir les messages
  const refreshMessages = useCallback(async (conversationId: string) => {
    await fetchMessages(conversationId)
  }, [fetchMessages])

  // Vérifier les nouveaux messages d'une conversation spécifique (pour le polling)
  const checkNewMessages = useCallback(async (conversationId: string) => {
    if (!isAuthenticated) {
      return
    }

    try {
      const response = await api.get(`/reseau-social/conversations/${conversationId}/messages/`)
      
      if (!response.ok) {
        return
      }

      const data = await response.json()
      const messagesArray: Message[] = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : []

      const formattedMessages: Message[] = messagesArray.map((msg: any) => ({
        id: String(msg.id),
        text: msg.text || msg.content || '',
        time: msg.time || new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        sent: msg.sent ?? (msg.sender?.id === user?.id),
        conversation: msg.conversation,
        sender: msg.sender,
        message_type: msg.message_type || 'text',
        created_at: msg.created_at,
        is_read: msg.is_read,
        attachment: msg.attachment || null,
        attachment_url: msg.attachment_url || null,
        is_deleted: msg.is_deleted ?? false,
        is_edited: msg.is_edited ?? false,
      }))

      // Mettre à jour seulement si de nouveaux messages sont détectés
      setMessages(prev => {
        const currentMessages = prev[conversationId] || []
        const currentIds = new Set(currentMessages.map(m => m.id))
        const newMessages = formattedMessages.filter(m => !currentIds.has(m.id))

        if (newMessages.length > 0) {
          console.log(`🆕 [USE_SOCIAL_NETWORK] ${newMessages.length} nouveau(x) message(s) détecté(s) pour la conversation ${conversationId}`)
          return {
            ...prev,
            [conversationId]: formattedMessages,
          }
        }

        // Mettre à jour même s'il n'y a pas de nouveaux messages (pour les modifications)
        return {
          ...prev,
          [conversationId]: formattedMessages,
        }
      })
    } catch (err) {
      // Ignorer les erreurs silencieusement pour ne pas polluer la console
      console.debug('⚠️ [USE_SOCIAL_NETWORK] Erreur lors de la vérification des nouveaux messages:', err)
    }
  }, [isAuthenticated, user])
  
  // Marquer une conversation comme lue localement (pour arrêter le clignotement immédiatement)
  const markConversationAsRead = useCallback((conversationId: string): void => {
    setConversations(prev => {
      return prev.map(conv => {
        if (conv.id === conversationId) {
          return { ...conv, unread: 0 }
        }
        return conv
      })
    })
  }, [])
  
  // Basculer le statut favori d'une conversation
  const toggleFavorite = useCallback(async (conversationId: string): Promise<void> => {
    if (!isAuthenticated) {
      console.log('🔒 [USE_SOCIAL_NETWORK] Utilisateur non authentifié')
      return
    }
    
    try {
      // Récupérer la conversation actuelle
      const conversation = conversations.find(conv => conv.id === conversationId)
      if (!conversation) {
        throw new Error('Conversation non trouvée')
      }
      
      const newPinnedState = !conversation.is_pinned
      
      console.log('⭐ [USE_SOCIAL_NETWORK] Basculer le statut favori...', { conversationId, newPinnedState })
      const response = await api.patch(`/reseau-social/conversations/${conversationId}/`, {
        is_pinned: newPinnedState,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }
      
      // Mettre à jour localement
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, is_pinned: newPinnedState }
          : conv
      ))
      
      console.log(`✅ [USE_SOCIAL_NETWORK] Conversation ${newPinnedState ? 'mise en favoris' : 'retirée des favoris'}`)
    } catch (err: any) {
      console.error('❌ [USE_SOCIAL_NETWORK] Erreur toggleFavorite:', err)
      throw err
    }
  }, [isAuthenticated, conversations])
  
  // Supprimer une conversation (suppression locale uniquement, comme WhatsApp)
  const deleteConversation = useCallback(async (conversationId: string): Promise<void> => {
    if (!isAuthenticated) {
      console.log('🔒 [USE_SOCIAL_NETWORK] Utilisateur non authentifié')
      return
    }
    
    try {
      console.log('🗑️ [USE_SOCIAL_NETWORK] Suppression de la conversation...', { conversationId })
      const response = await api.delete(`/reseau-social/conversations/${conversationId}/`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Erreur HTTP: ${response.status}`)
      }
      
      // Retirer la conversation de la liste locale
      setConversations(prev => prev.filter(conv => conv.id !== conversationId))
      
      // Retirer les messages de cette conversation
      setMessages(prev => {
        const updated = { ...prev }
        delete updated[conversationId]
        return updated
      })
      
      console.log('✅ [USE_SOCIAL_NETWORK] Conversation supprimée avec succès')
    } catch (err: any) {
      console.error('❌ [USE_SOCIAL_NETWORK] Erreur deleteConversation:', err)
      throw err
    }
  }, [isAuthenticated])
  
  // Charger les conversations au montage si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]) // fetchConversations est déjà memoized

  // Polling automatique pour les nouveaux messages (temps réel)
  // NOTE: Polling des conversations désactivé pour éviter les re-renders constants
  // Les conversations seront mises à jour uniquement lors des actions utilisateur :
  // - Envoi de message (déjà géré dans sendMessage)
  // - Suppression de message (déjà géré dans deleteMessage)
  // - Ouverture d'une conversation (déjà géré dans fetchMessages)
  // Le polling des messages de la conversation active reste actif toutes les 2 secondes
  // 
  // Si vous voulez réactiver le polling des conversations, décommentez le code ci-dessous
  // et ajustez l'intervalle selon vos besoins (minimum 15-20 secondes recommandé)
  /*
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    // Intervalle de polling : 20 secondes (très long pour éviter le clignotement)
    const pollingInterval = 20000
    let pollingTimeout: NodeJS.Timeout | null = null

    const pollForUpdates = async () => {
      if (isPollingRef.current) {
        return
      }

      isPollingRef.current = true

      try {
        await fetchConversations()
      } catch (err) {
        console.error('❌ [USE_SOCIAL_NETWORK] Erreur lors du polling des conversations:', err)
      } finally {
        isPollingRef.current = false
      }
    }

    const initialDelay = setTimeout(() => {
      const startPolling = () => {
        pollForUpdates()
        pollingTimeout = setTimeout(startPolling, pollingInterval)
      }
      startPolling()
    }, 10000) // Attendre 10 secondes avant le premier polling

    return () => {
      if (pollingTimeout) {
        clearTimeout(pollingTimeout)
      }
      clearTimeout(initialDelay)
    }
  }, [isAuthenticated, fetchConversations])
  */
  
  return {
    // État
    conversations,
    isLoadingConversations,
    conversationsError,
    messages,
    isLoadingMessages,
    messagesError,
    searchResults,
    isSearching,
    searchError,
    
    // Fonctions conversations
    fetchConversations,
    getConversation,
    createConversation,
    createConversationWithUser,
    toggleFavorite,
    deleteConversation,
    
    // Fonctions messages
    fetchMessages,
    sendMessage,
    updateMessage,
    deleteMessage,
    markMessagesAsRead,
    
    // Fonctions recherche
    searchUsers,
    clearSearch,
    
    // Fonctions utilitaires
    refreshConversations,
    refreshMessages,
    checkNewMessages,
    markConversationAsRead,
  }
}

