import { useState, useEffect, useCallback, useRef } from 'react'
import { api } from '@/lib/api-client'
import { useAuth } from '@/contexts/AuthContext'

// Interfaces alignées avec le backend
export interface Forum {
  id: number
  name: string
  description: string
  image?: string
  image_url?: string
  is_active: boolean
  member_count: number
  conversation_count: number
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: number
  forum: number | Forum
  forumId?: number | string
  author: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    full_name: string
    avatar_url?: string
  }
  author_avatar?: string
  authorAvatar?: string
  message: string
  views: number
  replies_count: number
  replies?: number
  last_activity: string
  lastActivity?: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  conversation: number
  author: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    full_name: string
    avatar_url?: string
  }
  authorAvatar?: string
  content: string
  likes_count: number
  likes?: number
  is_liked: boolean
  timestamp: string
  created_at: string
  updated_at: string
}

interface CreateForumData {
  name: string
  description: string
  image?: File
  is_active?: boolean
}

interface CreateConversationData {
  forum: number
  content?: string
  message?: string
}

interface CreateCommentData {
  conversation: number
  content: string
}

interface UseForumReturn {
  // État des forums
  forums: Forum[]
  isLoadingForums: boolean
  forumsError: string | null
  
  // État des conversations
  conversations: Conversation[]
  isLoadingConversations: boolean
  conversationsError: string | null
  
  // État des commentaires
  comments: Record<number, Comment[]> // key = conversationId
  isLoadingComments: boolean
  commentsError: string | null
  
  // Fonctions pour les forums
  fetchForums: () => Promise<void>
  getForum: (id: number) => Forum | undefined
  createForum: (data: CreateForumData) => Promise<Forum | null>
  
  // Fonctions pour les conversations
  fetchConversations: (forumId?: number) => Promise<void>
  getConversation: (id: number) => Conversation | undefined
  createConversation: (data: CreateConversationData) => Promise<Conversation | null>
  updateConversation: (id: number, data: Partial<CreateConversationData>) => Promise<Conversation | null>
  deleteConversation: (id: number) => Promise<void>
  
  // Fonctions pour les commentaires
  fetchComments: (conversationId: number) => Promise<void>
  createComment: (data: CreateCommentData) => Promise<Comment | null>
  updateComment: (id: number, content: string) => Promise<Comment | null>
  deleteComment: (id: number) => Promise<void>
  toggleCommentLike: (commentId: number) => Promise<void>
  
  // Fonctions utilitaires
  refreshForums: () => Promise<void>
  refreshConversations: (forumId?: number) => Promise<void>
  refreshComments: (conversationId: number) => Promise<void>
}

export function useForum(): UseForumReturn {
  const { isAuthenticated, user } = useAuth()
  
  // État des forums
  const [forums, setForums] = useState<Forum[]>([])
  const [isLoadingForums, setIsLoadingForums] = useState(false)
  const [forumsError, setForumsError] = useState<string | null>(null)
  
  // État des conversations
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [conversationsError, setConversationsError] = useState<string | null>(null)
  
  // État des commentaires (organisés par conversationId)
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [commentsError, setCommentsError] = useState<string | null>(null)
  
  // Variables pour éviter les appels multiples simultanés
  const fetchingForumsRef = useRef(false)
  const fetchingConversationsRef = useRef(false)
  const fetchingCommentsRef = useRef<Record<number, boolean>>({})
  
  // ===== FONCTIONS POUR LES FORUMS =====
  
  const fetchForums = useCallback(async () => {
    console.log("=".repeat(80))
    console.log("🟢 [FORUM_HOOK] ===== DÉBUT fetchForums =====")
    console.log("🟢 [FORUM_HOOK] Timestamp:", new Date().toISOString())
    
    if (fetchingForumsRef.current) {
      console.log("🟢 [FORUM_HOOK] ⚠️ Requête déjà en cours, abandon")
      console.log("=".repeat(80))
      return
    }
    
    setIsLoadingForums(true)
    setForumsError(null)
    fetchingForumsRef.current = true
    
    try {
      const endpoint = '/forum/forums/'
      console.log("🟢 [FORUM_HOOK] Endpoint:", endpoint)
      console.log("🟢 [FORUM_HOOK] requireAuth: false")
      
      console.log("🟢 [FORUM_HOOK] Appel API en cours...")
      const response = await api.get(endpoint, { requireAuth: false })
      
      console.log("🟢 [FORUM_HOOK] Réponse reçue:")
      console.log("🟢 [FORUM_HOOK]   - Status:", response.status)
      console.log("🟢 [FORUM_HOOK]   - StatusText:", response.statusText)
      console.log("🟢 [FORUM_HOOK]   - OK:", response.ok)
      console.log("🟢 [FORUM_HOOK]   - Headers:", Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("🟢 [FORUM_HOOK] ❌ Erreur HTTP:", response.status, response.statusText)
        console.error("🟢 [FORUM_HOOK] ❌ Body erreur:", errorText)
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      console.log("🟢 [FORUM_HOOK] Parsing JSON...")
      const data = await response.json()
      console.log("🟢 [FORUM_HOOK] Données brutes reçues:", data)
      console.log("🟢 [FORUM_HOOK] Type de données:", Array.isArray(data) ? 'Array' : typeof data)
      
      const forumsList = Array.isArray(data) ? data : (data.results || [])
      console.log("🟢 [FORUM_HOOK] Forums extraits:", forumsList.length)
      
      if (forumsList.length > 0) {
        console.log("🟢 [FORUM_HOOK] Détails des forums:")
        forumsList.forEach((forum: Forum, idx: number) => {
          console.log(`🟢 [FORUM_HOOK]   Forum ${idx + 1}:`)
          console.log(`🟢 [FORUM_HOOK]     - ID: ${forum.id}`)
          console.log(`🟢 [FORUM_HOOK]     - Name: ${forum.name}`)
          console.log(`🟢 [FORUM_HOOK]     - is_active: ${forum.is_active}`)
          console.log(`🟢 [FORUM_HOOK]     - member_count: ${forum.member_count}`)
          console.log(`🟢 [FORUM_HOOK]     - conversation_count: ${forum.conversation_count}`)
          console.log(`🟢 [FORUM_HOOK]     - image_url: ${forum.image_url || forum.image || 'N/A'}`)
        })
      } else {
        console.warn("🟢 [FORUM_HOOK] ⚠️ AUCUN FORUM TROUVÉ!")
      }
      
      console.log("🟢 [FORUM_HOOK] Mise à jour de l'état...")
      setForums(forumsList)
      console.log('✅ [FORUM_HOOK] Forums récupérés et stockés:', forumsList.length)
    } catch (error) {
      console.error('❌ [FORUM_HOOK] Erreur fetchForums:', error)
      if (error instanceof Error) {
        console.error('❌ [FORUM_HOOK] Message erreur:', error.message)
        console.error('❌ [FORUM_HOOK] Stack trace:', error.stack)
      }
      setForumsError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setIsLoadingForums(false)
      fetchingForumsRef.current = false
      console.log("🟢 [FORUM_HOOK] ===== FIN fetchForums =====")
      console.log("=".repeat(80))
    }
  }, [])
  
  const getForum = useCallback((id: number): Forum | undefined => {
    return forums.find(f => f.id === id)
  }, [forums])
  
  const createForum = useCallback(async (data: CreateForumData): Promise<Forum | null> => {
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour créer un forum')
    }
    
    try {
      console.log('🟢 [FORUM_HOOK] ===== DÉBUT createForum =====')
      console.log('🟢 [FORUM_HOOK] Données:', data)
      
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('description', data.description || '')
      if (data.image) {
        formData.append('image', data.image)
      }
      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active.toString())
      } else {
        formData.append('is_active', 'true')
      }
      
      const response = await api.post('/forum/forums/', formData, { requireAuth: true })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }
      
      const newForum = await response.json()
      console.log('🟢 [FORUM_HOOK] Forum créé (brut):', newForum)
      
      // Normaliser les données
      const normalized: Forum = {
        ...newForum,
        image_url: newForum.image_url || newForum.image || '/placeholder.svg',
        member_count: newForum.member_count || 0,
        conversation_count: newForum.conversation_count || 0,
      }
      console.log('🟢 [FORUM_HOOK] Forum normalisé:', normalized)
      
      // Ajouter à la liste
      setForums(prev => [...prev, normalized].sort((a, b) => a.name.localeCompare(b.name)))
      
      console.log('✅ [FORUM_HOOK] Forum créé:', normalized.id)
      return normalized
    } catch (error) {
      console.error('❌ [FORUM_HOOK] Erreur createForum:', error)
      throw error
    }
  }, [isAuthenticated, user])
  
  // ===== FONCTIONS POUR LES CONVERSATIONS =====
  
  const fetchConversations = useCallback(async (forumId?: number) => {
    console.log('🟦 [FORUM_HOOK] ==========================================')
    console.log('🟦 [FORUM_HOOK] ===== DÉBUT fetchConversations =====')
    console.log('🟦 [FORUM_HOOK] forumId demandé:', forumId)
    console.log('🟦 [FORUM_HOOK] fetchingConversationsRef.current:', fetchingConversationsRef.current)
      // Ne pas utiliser conversations dans la closure, utiliser prev dans setConversations à la place
    
    if (fetchingConversationsRef.current) {
      console.log('⚠️ [FETCH_CONV] Requête déjà en cours, abandon')
      console.log('🔄🔄🔄 [FETCH_CONV] ===== FIN (ABANDON) =====')
      return
    }
    
    setIsLoadingConversations(true)
    setConversationsError(null)
    fetchingConversationsRef.current = true
    
    try {
      let url = '/forum/conversations/'
      if (forumId) {
        url += `?forum=${forumId}`
      }
      
      console.log('🔄 [FETCH_CONV] URL:', url)
      const response = await api.get(url, { requireAuth: false })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      const conversationsList = Array.isArray(data) ? data : (data.results || [])
      console.log('🔄 [FETCH_CONV] Conversations reçues du serveur:', conversationsList.length)
      
      // Normaliser les données
      const normalizedConversations: Conversation[] = conversationsList.map((conv: any) => {
        const forumId = typeof conv.forum === 'object' ? conv.forum.id : conv.forum
        return {
          ...conv,
          forumId: Number(forumId),
          authorAvatar: conv.author_avatar || conv.author?.avatar_url || '/photo_profil.png',
          replies: conv.replies_count,
          views: conv.views,
          lastActivity: conv.last_activity,
        }
      }).sort((a: Conversation, b: Conversation) => (a.id as number) - (b.id as number))
      
      console.log('🔄 [FETCH_CONV] Conversations normalisées:', normalizedConversations.length)
      
      // 🔀 FUSION - Préserver les conversations optimistes
      console.log('🔀🔀🔀 [FETCH_CONV] ===== DÉBUT FUSION =====')
      setConversations(prev => {
        console.log('🔀 [FETCH_CONV] État AVANT fusion:')
        console.log('🔀 [FETCH_CONV]   - prev.length:', prev.length)
        prev.forEach((c, idx) => {
          console.log(`🔀 [FETCH_CONV]     ${idx + 1}. ID=${c.id}, forumId=${c.forumId}, message="${c.message?.substring(0, 30)}"`)
        })
        console.log('🔀 [FETCH_CONV] Nouvelles conversations du serveur:')
        console.log('🔀 [FETCH_CONV]   - new.length:', normalizedConversations.length)
        normalizedConversations.forEach((c, idx) => {
          console.log(`🔀 [FETCH_CONV]     ${idx + 1}. ID=${c.id}, forumId=${c.forumId}, message="${c.message?.substring(0, 30)}"`)
        })
        
        const prevIds = new Set(prev.map(c => c.id))
        const newIds = new Set(normalizedConversations.map(c => c.id))
        
        // Identifier les conversations optimistes à préserver
        const optimistesAPreserver: Conversation[] = []
        prev.forEach(conv => {
          if (!newIds.has(conv.id)) {
            if (forumId) {
              const convForumId = typeof conv.forumId === 'string' ? parseInt(String(conv.forumId)) : Number(conv.forumId)
              const targetForumId = typeof forumId === 'string' ? parseInt(String(forumId)) : Number(forumId)
              if (convForumId === targetForumId) {
                optimistesAPreserver.push(conv)
                console.log(`🔀 [FETCH_CONV] ⚡ Conversation optimiste à préserver: ID=${conv.id}, forumId=${conv.forumId}`)
              }
            } else {
              optimistesAPreserver.push(conv)
              console.log(`🔀 [FETCH_CONV] ⚡ Conversation optimiste à préserver: ID=${conv.id}`)
            }
          }
        })
        
        // Fusionner
        const merged = [...normalizedConversations, ...optimistesAPreserver]
        const unique = merged.filter((conv, index, self) => 
          index === self.findIndex(c => c.id === conv.id)
        )
        const sorted = unique.sort((a, b) => (a.id as number) - (b.id as number))
        
        console.log('🔀 [FETCH_CONV] État APRÈS fusion:')
        console.log('🔀 [FETCH_CONV]   - sorted.length:', sorted.length)
        console.log('🔀 [FETCH_CONV]   - optimistes préservées:', optimistesAPreserver.length)
        sorted.forEach((c, idx) => {
          const isOptimiste = optimistesAPreserver.some(o => o.id === c.id)
          console.log(`🔀 [FETCH_CONV]     ${idx + 1}. ID=${c.id}, forumId=${c.forumId}, message="${c.message?.substring(0, 30)}" ${isOptimiste ? '⚡OPTIMISTE' : ''}`)
        })
        console.log('🔀🔀🔀 [FETCH_CONV] ===== FIN FUSION =====')
        return sorted
      })
      console.log('✅ [FETCH_CONV] Fusion terminée')
      console.log('🔄🔄🔄 [FETCH_CONV] ===== FIN fetchConversations =====')
    } catch (error) {
      console.error('❌ [FETCH_CONV] Erreur:', error)
      setConversationsError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setIsLoadingConversations(false)
      fetchingConversationsRef.current = false
    }
  }, [])
  
  const getConversation = useCallback((id: number): Conversation | undefined => {
    return conversations.find(c => c.id === id)
  }, [conversations])
  
  const createConversation = useCallback(async (data: CreateConversationData): Promise<Conversation | null> => {
    console.log('🚀🚀🚀 [CREATE_CONV] ===== DÉBUT CRÉATION CONVERSATION =====')
    console.log('🚀 [CREATE_CONV] Timestamp:', new Date().toISOString())
    console.log('🚀 [CREATE_CONV] Données reçues:', { forum: data.forum, contentLength: data.content?.length, messageLength: data.message?.length })
    console.log('🚀 [CREATE_CONV] État actuel conversations AVANT création:', conversations.length)
    conversations.forEach((c, idx) => {
      console.log(`🚀 [CREATE_CONV]   Conv existante ${idx + 1}: ID=${c.id}, forumId=${c.forumId}, message="${c.message?.substring(0, 30)}"`)
    })
    
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour créer une conversation')
    }
    
    try {
      // Valider que forum est un nombre valide
      const validatedForumId = typeof data.forum === 'string' ? parseInt(data.forum) : Number(data.forum)
      if (isNaN(validatedForumId) || validatedForumId <= 0) {
        throw new Error('Le forum ID est invalide')
      }
      
      const formData = new FormData()
      formData.append('forum', validatedForumId.toString())
      
      // Mode simple : utiliser content si fourni
      if (data.content && data.content.trim()) {
        const trimmedContent = data.content.trim()
        // Vérifier que le contenu a au moins 3 caractères (comme le backend)
        if (trimmedContent.length < 3) {
          throw new Error('Le contenu doit contenir au moins 3 caractères.')
        }
        formData.append('content', trimmedContent)
      } else if (data.message && data.message.trim()) {
        const trimmedMessage = data.message.trim()
        if (trimmedMessage.length < 3) {
          throw new Error('Le message doit contenir au moins 3 caractères.')
        }
        formData.append('message', trimmedMessage)
      } else {
        throw new Error('Vous devez fournir soit content (au moins 3 caractères), soit message (au moins 3 caractères)')
      }
      
      console.log('🚀 [CREATE_CONV] Envoi requête POST...')
      const response = await api.post('/forum/conversations/', formData, { requireAuth: true })
      console.log('🚀 [CREATE_CONV] Réponse HTTP:', response.status, response.ok)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [FORUM_HOOK] Erreur de réponse:', errorData)
        console.error('❌ [FORUM_HOOK] Status:', response.status)
        console.error('❌ [FORUM_HOOK] StatusText:', response.statusText)
        console.error('❌ [FORUM_HOOK] Données envoyées:', {
          forum: data.forum,
          content: data.content,
          message: data.message
        })
        
        // Extraire le message d'erreur détaillé
        let errorMessage = `Erreur ${response.status}: ${response.statusText}`
        if (errorData.detail) {
          errorMessage = errorData.detail
        } else if (errorData.content) {
          errorMessage = Array.isArray(errorData.content) ? errorData.content.join(', ') : errorData.content
        } else if (errorData.message) {
          errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors.join(', ') : errorData.non_field_errors
        }
        
        throw new Error(errorMessage)
      }
      
      const newConversation = await response.json()
      console.log('🚀 [CREATE_CONV] Réponse serveur reçue:', {
        id: newConversation.id,
        message: newConversation.message?.substring(0, 50),
        forum: newConversation.forum,
        forumId: newConversation.forum?.id || newConversation.forum
      })
      
      // Normaliser les données - CRITIQUE : s'assurer que forumId est correct
      const forumId = typeof newConversation.forum === 'object' ? newConversation.forum.id : newConversation.forum
      // S'assurer que forumId est un nombre (pas une string) et correspond exactement au forumId passé en paramètre
      const validatedForumIdNum = typeof data.forum === 'string' ? parseInt(data.forum) : Number(data.forum)
      const normalizedForumId = forumId !== null && forumId !== undefined 
        ? (typeof forumId === 'string' ? parseInt(forumId) : Number(forumId))
        : validatedForumIdNum // Fallback sur le forumId passé en paramètre
      
      // S'assurer que le forumId correspond exactement au forumId passé en paramètre
      // Cela garantit que la conversation sera filtrée correctement dans forum-page.tsx
      const finalForumId = normalizedForumId === validatedForumIdNum ? normalizedForumId : validatedForumIdNum
      
      console.log('🚀 [CREATE_CONV] forumId calculé:', {
        original: forumId,
        normalized: normalizedForumId,
        validated: validatedForumIdNum,
        final: finalForumId
      })
      
      // CRITIQUE : Le forumId doit être un nombre pour correspondre au selectedForum.id dans forum-page.tsx
      // Dans forum-page.tsx, selectedForum.id peut être string ou number, mais on normalise toujours en nombre pour la comparaison
      const normalized: Conversation = {
        ...newConversation,
        forumId: Number(finalForumId), // TOUJOURS utiliser un nombre pour correspondre au selectedForum.id normalisé
        authorAvatar: newConversation.author_avatar || newConversation.author?.avatar_url || '/photo_profil.png',
        replies: newConversation.replies_count || 0,
        views: newConversation.views || 0,
        lastActivity: newConversation.last_activity || 'À l\'instant',
        message: newConversation.message || newConversation.content || 'Nouvelle conversation',
      }
      
      console.log('🚀 [CREATE_CONV] Conversation normalisée:', {
        id: normalized.id,
        message: normalized.message?.substring(0, 50),
        forumId: normalized.forumId,
        forumIdType: typeof normalized.forumId
      })
      
      // ⚡ OPTIMISTIC UPDATE - Ajouter à la liste IMMÉDIATEMENT
      console.log('⚡⚡⚡ [CREATE_CONV] ===== OPTIMISTIC UPDATE =====')
      console.log('⚡ [CREATE_CONV] Conversation normalisée à ajouter:', {
        id: normalized.id,
        message: normalized.message?.substring(0, 50),
        forumId: normalized.forumId,
        forumIdType: typeof normalized.forumId
      })
      
      setConversations(prev => {
        console.log('⚡ [CREATE_CONV] setConversations appelé - prev.length:', prev.length)
        console.log('⚡ [CREATE_CONV] Conversations AVANT ajout:')
        prev.forEach((c, idx) => {
          console.log(`⚡ [CREATE_CONV]   ${idx + 1}. ID=${c.id}, forumId=${c.forumId}, message="${c.message?.substring(0, 30)}"`)
        })
        
        const exists = prev.some(c => c.id === normalized.id)
        if (exists) {
          console.log('⚠️ [CREATE_CONV] Conversation déjà présente, mise à jour')
          const updated = prev.map(c => c.id === normalized.id ? normalized : c)
          const sorted = updated.sort((a, b) => (a.id as number) - (b.id as number))
          console.log('⚡ [CREATE_CONV] Liste APRÈS mise à jour:', sorted.length, 'conversations')
          return sorted
        }
        
        const newList = [...prev, normalized]
        const sorted = newList.sort((a, b) => (a.id as number) - (b.id as number))
        console.log('⚡ [CREATE_CONV] Liste APRÈS ajout:', sorted.length, 'conversations')
        sorted.forEach((c, idx) => {
          console.log(`⚡ [CREATE_CONV]   ${idx + 1}. ID=${c.id}, forumId=${c.forumId}, message="${c.message?.substring(0, 30)}"`)
        })
        console.log('⚡⚡⚡ [CREATE_CONV] ===== FIN OPTIMISTIC UPDATE =====')
        return sorted
      })
      
      console.log('✅ [CREATE_CONV] Optimistic update terminé - conversation ajoutée à l\'état')
      
      // 🔄 RECHARGEMENT - Synchroniser avec le serveur
      const forumIdToFetch = finalForumId || validatedForumIdNum
      console.log('🔄 [CREATE_CONV] ===== DÉBUT RECHARGEMENT =====')
      console.log('🔄 [CREATE_CONV] forumId à recharger:', forumIdToFetch)
      console.log('🔄 [CREATE_CONV] Attente 200ms pour laisser le serveur enregistrer...')
      
      await new Promise(resolve => setTimeout(resolve, 200))
      console.log('🔄 [CREATE_CONV] Délai terminé, appel fetchConversations...')
      
      await fetchConversations(forumIdToFetch)
      
      console.log('✅ [CREATE_CONV] Rechargement terminé')
      console.log('🚀🚀🚀 [CREATE_CONV] ===== FIN CRÉATION CONVERSATION =====')
      return normalized
    } catch (error) {
      console.error('❌ [CREATE_CONV] Erreur:', error)
      console.log('🚀🚀🚀 [CREATE_CONV] ===== FIN (ERREUR) =====')
      throw error
    }
  }, [isAuthenticated, user, fetchConversations])
  
  const updateConversation = useCallback(async (id: number, data: Partial<CreateConversationData>): Promise<Conversation | null> => {
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour modifier une conversation')
    }
    
    try {
      const formData = new FormData()
      if (data.message) formData.append('message', data.message)
      
      const response = await api.patch(`/forum/conversations/${id}/`, formData, { requireAuth: true })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }
      
      const updatedConversation = await response.json()
      
      // Normaliser les données
      const normalized: Conversation = {
        ...updatedConversation,
        forumId: typeof updatedConversation.forum === 'object' ? updatedConversation.forum.id : updatedConversation.forum,
        authorAvatar: updatedConversation.author_avatar || updatedConversation.author?.avatar_url || '/photo_profil.png',
        replies: updatedConversation.replies_count,
        views: updatedConversation.views,
        lastActivity: updatedConversation.last_activity,
      }
      
      // Mettre à jour dans la liste
      setConversations(prev => prev.map(c => c.id === id ? normalized : c))
      
      console.log('✅ [FORUM_HOOK] Conversation mise à jour:', id)
      return normalized
    } catch (error) {
      console.error('❌ [FORUM_HOOK] Erreur updateConversation:', error)
      throw error
    }
  }, [isAuthenticated, user])
  
  const deleteConversation = useCallback(async (id: number): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour supprimer une conversation')
    }
    
    try {
      const response = await api.delete(`/forum/conversations/${id}/`, { requireAuth: true })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Retirer de la liste
      setConversations(prev => prev.filter(c => c.id !== id))
      
      console.log('✅ [FORUM_HOOK] Conversation supprimée:', id)
    } catch (error) {
      console.error('❌ [FORUM_HOOK] Erreur deleteConversation:', error)
      throw error
    }
  }, [isAuthenticated, user])
  
  // ===== FONCTIONS POUR LES COMMENTAIRES =====
  
  const fetchComments = useCallback(async (conversationId: number) => {
    if (fetchingCommentsRef.current[conversationId]) return
    
    setIsLoadingComments(true)
    setCommentsError(null)
    fetchingCommentsRef.current[conversationId] = true
    
    try {
      const response = await api.get(`/forum/comments/?conversation=${conversationId}`, { requireAuth: false })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      const commentsList = Array.isArray(data) ? data : (data.results || [])
      
      // Normaliser les données
      const normalizedComments: Comment[] = commentsList.map((comment: any) => ({
        ...comment,
        authorAvatar: comment.author_avatar || comment.author?.avatar_url || '/photo_profil.png',
        author: comment.author?.full_name || comment.author?.username || 'Utilisateur',
        likes: comment.likes_count || 0,
        timestamp: comment.timestamp || comment.created_at,
      }))
      
      console.log('🟢 [FORUM_HOOK] Commentaires normalisés:', normalizedComments.length)
      normalizedComments.forEach((c, idx) => {
        console.log(`🟢 [FORUM_HOOK]   Commentaire ${idx + 1}:`, {
          id: c.id,
          author: c.author,
          authorAvatar: c.authorAvatar,
          content: c.content?.substring(0, 50),
          likes: c.likes
        })
      })
      
      setComments(prev => ({
        ...prev,
        [conversationId]: normalizedComments
      }))
      
      console.log('✅ [FORUM_HOOK] Commentaires récupérés pour conversation', conversationId, ':', normalizedComments.length)
    } catch (error) {
      console.error('❌ [FORUM_HOOK] Erreur fetchComments:', error)
      setCommentsError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setIsLoadingComments(false)
      fetchingCommentsRef.current[conversationId] = false
    }
  }, [])
  
  const createComment = useCallback(async (data: CreateCommentData): Promise<Comment | null> => {
    console.log('🟢 [FORUM_HOOK] ===== DÉBUT createComment =====')
    console.log('🟢 [FORUM_HOOK] Données:', data)
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour commenter')
    }
    
    try {
      const response = await api.post('/forum/comments/', {
        conversation: data.conversation,
        content: data.content
      }, { requireAuth: true })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }
      
      const newComment = await response.json()
      console.log('🟢 [FORUM_HOOK] Commentaire créé (brut):', newComment)
      
      // Normaliser les données
      const normalized: Comment = {
        ...newComment,
        authorAvatar: newComment.author_avatar || newComment.author?.avatar_url || '/photo_profil.png',
        author: newComment.author?.full_name || newComment.author?.username || 'Utilisateur',
        likes: newComment.likes_count || 0,
        timestamp: newComment.timestamp || newComment.created_at,
      }
      console.log('🟢 [FORUM_HOOK] Commentaire normalisé:', normalized)
      
      // Recharger les commentaires pour avoir les données complètes du backend
      await fetchComments(data.conversation)
      
      console.log('✅ [FORUM_HOOK] Commentaire créé et commentaires rechargés')
      
      // Mettre à jour le nombre de réponses dans la conversation
      setConversations(prev => prev.map(c => 
        c.id === data.conversation 
          ? { ...c, replies: (c.replies || 0) + 1, replies_count: (c.replies_count || 0) + 1 }
          : c
      ))
      
      console.log('✅ [FORUM_HOOK] Commentaire créé:', normalized.id)
      return normalized
    } catch (error) {
      console.error('❌ [FORUM_HOOK] Erreur createComment:', error)
      throw error
    }
  }, [isAuthenticated, user, fetchComments])
  
  const updateComment = useCallback(async (id: number, content: string): Promise<Comment | null> => {
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour modifier un commentaire')
    }
    
    try {
      const response = await api.patch(`/forum/comments/${id}/`, {
        content
      }, { requireAuth: true })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }
      
      const updatedComment = await response.json()
      
      // Normaliser les données
      const normalized: Comment = {
        ...updatedComment,
        authorAvatar: updatedComment.author?.avatar_url || '/photo_profil.png',
        likes: updatedComment.likes_count,
        timestamp: updatedComment.timestamp,
      }
      
      // Trouver la conversation et mettre à jour le commentaire
      const conversationId = normalized.conversation
      setComments(prev => ({
        ...prev,
        [conversationId]: (prev[conversationId] || []).map(c => c.id === id ? normalized : c)
      }))
      
      console.log('✅ [FORUM_HOOK] Commentaire mis à jour:', id)
      return normalized
    } catch (error) {
      console.error('❌ [FORUM_HOOK] Erreur updateComment:', error)
      throw error
    }
  }, [isAuthenticated, user])
  
  const deleteComment = useCallback(async (id: number): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour supprimer un commentaire')
    }
    
    try {
      const response = await api.delete(`/forum/comments/${id}/`, { requireAuth: true })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }
      
      // Trouver et retirer le commentaire
      let conversationId: number | null = null
      setComments(prev => {
        const updated = { ...prev }
        for (const [convId, commentList] of Object.entries(prev)) {
          const found = commentList.find(c => c.id === id)
          if (found) {
            conversationId = parseInt(convId)
            updated[conversationId] = commentList.filter(c => c.id !== id)
            break
          }
        }
        return updated
      })
      
      // Mettre à jour le nombre de réponses dans la conversation
      if (conversationId !== null) {
        setConversations(prev => prev.map(c => 
          c.id === conversationId 
            ? { ...c, replies: Math.max(0, (c.replies || 0) - 1), replies_count: Math.max(0, (c.replies_count || 0) - 1) }
            : c
        ))
      }
      
      console.log('✅ [FORUM_HOOK] Commentaire supprimé:', id)
    } catch (error) {
      console.error('❌ [FORUM_HOOK] Erreur deleteComment:', error)
      throw error
    }
  }, [isAuthenticated, user])
  
  const toggleCommentLike = useCallback(async (commentId: number): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour liker un commentaire')
    }
    
    try {
      // Trouver le commentaire pour savoir s'il est déjà liké
      let conversationId: number | null = null
      let currentComment: Comment | null = null
      
      for (const [convId, commentList] of Object.entries(comments)) {
        const found = commentList.find(c => c.id === commentId)
        if (found) {
          conversationId = parseInt(convId)
          currentComment = found
          break
        }
      }
      
      if (!currentComment) {
        throw new Error('Commentaire non trouvé')
      }
      
      const isLiked = currentComment.is_liked
      
      const response = isLiked 
        ? await api.delete(`/forum/comments/${commentId}/like/`, { requireAuth: true })
        : await api.post(`/forum/comments/${commentId}/like/`, undefined, { requireAuth: true })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      // Mettre à jour le commentaire dans la liste
      if (conversationId !== null) {
        setComments(prev => ({
          ...prev,
          [conversationId!]: (prev[conversationId!] || []).map(c => 
            c.id === commentId 
              ? { ...c, is_liked: result.liked, likes: result.likes_count, likes_count: result.likes_count }
              : c
          )
        }))
      }
      
      console.log('✅ [FORUM_HOOK] Like togglé pour commentaire', commentId, ':', result.liked)
    } catch (error) {
      console.error('❌ [FORUM_HOOK] Erreur toggleCommentLike:', error)
      throw error
    }
  }, [isAuthenticated, user, comments])
  
  // ===== FONCTIONS UTILITAIRES =====
  
  const refreshForums = useCallback(async () => {
    await fetchForums()
  }, [fetchForums])
  
  const refreshConversations = useCallback(async (forumId?: number) => {
    await fetchConversations(forumId)
  }, [fetchConversations])
  
  const refreshComments = useCallback(async (conversationId: number) => {
    await fetchComments(conversationId)
  }, [fetchComments])
  
  // Charger les forums au montage
  useEffect(() => {
    fetchForums()
  }, [fetchForums])
  
  return {
    // État des forums
    forums,
    isLoadingForums,
    forumsError,
    
    // État des conversations
    conversations,
    isLoadingConversations,
    conversationsError,
    
    // État des commentaires
    comments,
    isLoadingComments,
    commentsError,
    
    // Fonctions pour les forums
    fetchForums,
    getForum,
    createForum,
    
    // Fonctions pour les conversations
    fetchConversations,
    getConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    
    // Fonctions pour les commentaires
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
    
    // Fonctions utilitaires
    refreshForums,
    refreshConversations,
    refreshComments,
  }
}

