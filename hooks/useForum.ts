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
  title: string
  description: string
  image?: string
  image_url?: string
  is_resolved: boolean
  isResolved?: boolean
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
  title?: string
  description?: string
  image?: File
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
    console.log('🟦 [FORUM_HOOK] État actuel des conversations AVANT fetch:', conversations.length)
    
    if (fetchingConversationsRef.current) {
      console.log('⚠️ [FORUM_HOOK] Requête déjà en cours, abandon')
      console.log('🟦 [FORUM_HOOK] ===== FIN fetchConversations (ABANDON) =====')
      console.log('🟦 [FORUM_HOOK] ==========================================')
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
      
      console.log('🟦 [FORUM_HOOK] URL de la requête:', url)
      console.log('🟦 [FORUM_HOOK] Envoi de la requête GET...')
      const response = await api.get(url, { requireAuth: false })
      
      console.log('🟦 [FORUM_HOOK] Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('🟦 [FORUM_HOOK] Données brutes reçues:', data)
      const conversationsList = Array.isArray(data) ? data : (data.results || [])
      console.log('🟦 [FORUM_HOOK] conversationsList extraite:', conversationsList.length, 'conversations')
      
      // Normaliser les données pour le frontend
      const normalizedConversations: Conversation[] = conversationsList.map((conv: any) => {
        const forumId = typeof conv.forum === 'object' ? conv.forum.id : conv.forum
        
        console.log("🟦 [FORUM_HOOK] Normalisation conversation:", {
          id: conv.id,
          title: conv.title,
          forum: conv.forum,
          forumId,
          forumType: typeof conv.forum,
          forumIdType: typeof forumId
        })
        
        return {
          ...conv,
          forumId: forumId,
          authorAvatar: conv.author_avatar || conv.author?.avatar_url || '/photo_profil.png',
          replies: conv.replies_count,
          views: conv.views,
          lastActivity: conv.last_activity,
          isResolved: conv.is_resolved,
          image: conv.image_url || conv.image || '/placeholder.svg',
        }
      }).sort((a, b) => (a.id as number) - (b.id as number)) // Trier par ID croissant (plus récentes en bas)
      
      console.log('🟦 [FORUM_HOOK] Conversations normalisées:', normalizedConversations.length)
      normalizedConversations.forEach((c, idx) => {
        console.log(`🟦 [FORUM_HOOK]   Conversation normalisée ${idx + 1}: ID=${c.id}, title="${c.title}", forumId=${c.forumId}`)
      })
      
      console.log('🟦 [FORUM_HOOK] État actuel des conversations AVANT setConversations:', conversations.length)
      conversations.forEach((c, idx) => {
        console.log(`🟦 [FORUM_HOOK]   Conversation actuelle ${idx + 1}: ID=${c.id}, title="${c.title}", forumId=${c.forumId}`)
      })
      
      // Fusionner intelligemment : garder les conversations existantes si la nouvelle n'est pas encore dans la réponse
      // Cela garantit que la nouvelle conversation apparaît immédiatement même si le serveur n'a pas encore mis à jour
      setConversations(prev => {
        const prevIds = new Set(prev.map(c => c.id))
        const newIds = new Set(normalizedConversations.map(c => c.id))
        
        // Identifier les conversations de prev qui ne sont pas dans la nouvelle liste
        const missingInNew = prev.filter(conv => !newIds.has(conv.id))
        
        console.log('🟦 [FORUM_HOOK] Fusion des conversations:', {
          prevLength: prev.length,
          newLength: normalizedConversations.length,
          missingCount: missingInNew.length,
          missingIds: missingInNew.map(c => c.id)
        })
        
        // Si des conversations de prev ne sont pas dans la nouvelle liste, les fusionner
        if (missingInNew.length > 0) {
          console.log('🟦 [FORUM_HOOK] Fusion nécessaire - conversations manquantes:', missingInNew.map(c => ({ id: c.id, title: c.title, forumId: c.forumId })))
          const merged = [...normalizedConversations, ...missingInNew]
          const sorted = merged.sort((a, b) => (a.id as number) - (b.id as number))
          console.log('🟦 [FORUM_HOOK] Liste fusionnée:', sorted.length, 'conversations')
          return sorted
        }
        
        // Sinon utiliser la nouvelle liste (déjà triée par ID croissant)
        console.log('🟦 [FORUM_HOOK] Utilisation de la nouvelle liste complète')
        return normalizedConversations
      })
      console.log('✅ [FORUM_HOOK] setConversations appelé avec', normalizedConversations.length, 'conversations')
      console.log('✅ [FORUM_HOOK] Conversations récupérées et liste mise à jour:', normalizedConversations.length)
      console.log('✅ [FORUM_HOOK] Détails des conversations:', normalizedConversations.map(c => ({
        id: c.id,
        title: c.title,
        forumId: c.forumId,
        isResolved: c.isResolved
      })))
      normalizedConversations.forEach((c, idx) => {
        console.log(`🟦 [FORUM_HOOK]   Conversation ${idx + 1}: ID=${c.id}, title="${c.title}", forumId=${c.forumId}`)
      })
      console.log('🟦 [FORUM_HOOK] ===== FIN fetchConversations (SUCCÈS) =====')
      console.log('🟦 [FORUM_HOOK] ==========================================')
    } catch (error) {
      console.error('❌ [FORUM_HOOK] Erreur fetchConversations:', error)
      console.log('🟦 [FORUM_HOOK] ===== FIN fetchConversations (ERREUR) =====')
      console.log('🟦 [FORUM_HOOK] ==========================================')
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
    console.log('🔵 [FORUM_HOOK] ==========================================')
    console.log('🔵 [FORUM_HOOK] ===== DÉBUT createConversation =====')
    console.log('🔵 [FORUM_HOOK] Données reçues:', data)
    console.log('🔵 [FORUM_HOOK] isAuthenticated:', isAuthenticated)
    console.log('🔵 [FORUM_HOOK] user:', user?.id)
    
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour créer une conversation')
    }
    
    try {
      const formData = new FormData()
      formData.append('forum', data.forum.toString())
      
      // Mode simple : utiliser content si fourni
      if (data.content) {
        formData.append('content', data.content)
        console.log('🔵 [FORUM_HOOK] Mode simple: content ajouté:', data.content)
      } else if (data.title && data.description) {
        // Mode complet : title et description (pour compatibilité)
        formData.append('title', data.title)
        formData.append('description', data.description)
        console.log('🔵 [FORUM_HOOK] Mode complet: title et description ajoutés')
      } else {
        throw new Error('Vous devez fournir soit content, soit title et description')
      }
      
      if (data.image) {
        formData.append('image', data.image)
        console.log('🔵 [FORUM_HOOK] Image ajoutée')
      }
      
      console.log('🔵 [FORUM_HOOK] Envoi de la requête POST à /forum/conversations/')
      const response = await api.post('/forum/conversations/', formData, { requireAuth: true })
      
      console.log('🔵 [FORUM_HOOK] Réponse reçue:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ [FORUM_HOOK] Erreur de réponse:', errorData)
        throw new Error(errorData.detail || `Erreur ${response.status}: ${response.statusText}`)
      }
      
      const newConversation = await response.json()
      console.log('🔵 [FORUM_HOOK] Conversation brute reçue du serveur:', newConversation)
      console.log('🔵 [FORUM_HOOK] Détails de la conversation brute:', {
        id: newConversation.id,
        title: newConversation.title,
        content: newConversation.content,
        forum: newConversation.forum,
        forumId: newConversation.forum?.id || newConversation.forum,
        is_resolved: newConversation.is_resolved,
        author: newConversation.author?.full_name || newConversation.author?.username
      })
      
      // Normaliser les données - CRITIQUE : s'assurer que forumId est correct
      const forumId = typeof newConversation.forum === 'object' ? newConversation.forum.id : newConversation.forum
      // S'assurer que forumId est un nombre (pas une string)
      const normalizedForumId = forumId !== null && forumId !== undefined 
        ? (typeof forumId === 'string' ? parseInt(forumId) : Number(forumId))
        : data.forum // Fallback sur le forumId passé en paramètre
      
      console.log('🔵 [FORUM_HOOK] forumId extrait:', {
        original: forumId,
        normalized: normalizedForumId,
        type: typeof normalizedForumId,
        fromData: data.forum
      })
      
      const normalized: Conversation = {
        ...newConversation,
        forumId: normalizedForumId, // Utiliser le forumId normalisé
        authorAvatar: newConversation.author_avatar || newConversation.author?.avatar_url || '/photo_profil.png',
        replies: newConversation.replies_count || 0,
        views: newConversation.views || 0,
        lastActivity: newConversation.last_activity || 'À l\'instant',
        isResolved: newConversation.is_resolved !== undefined ? newConversation.is_resolved : true,
        image: newConversation.image_url || newConversation.image || '/placeholder.svg',
        title: newConversation.title || newConversation.content?.substring(0, 100) || 'Nouvelle conversation',
        description: newConversation.description || newConversation.content || '',
      }
      
      console.log('🔵 [FORUM_HOOK] Conversation normalisée avec forumId:', {
        id: normalized.id,
        title: normalized.title,
        forumId: normalized.forumId,
        forumIdType: typeof normalized.forumId
      })
      
      console.log('🔵 [FORUM_HOOK] Conversation normalisée:', normalized)
      console.log('🔵 [FORUM_HOOK] État actuel des conversations AVANT ajout:', conversations.length)
      conversations.forEach((c, idx) => {
        console.log(`🔵 [FORUM_HOOK]   Conversation ${idx + 1} actuelle: ID=${c.id}, title="${c.title}", forumId=${c.forumId}`)
      })
      
      // Ajouter à la liste en fin (plus récent en bas)
      setConversations(prev => {
        console.log('🔵 [FORUM_HOOK] setConversations appelé avec prev.length:', prev.length)
        // Vérifier si la conversation n'existe pas déjà pour éviter les doublons
        const exists = prev.some(c => c.id === normalized.id)
        if (exists) {
          console.log('⚠️ [FORUM_HOOK] Conversation déjà présente, mise à jour:', normalized.id)
          const updated = prev.map(c => c.id === normalized.id ? normalized : c)
          // Trier par ID pour maintenir l'ordre (plus récentes en bas)
          const sorted = updated.sort((a, b) => (a.id as number) - (b.id as number))
          console.log('🔵 [FORUM_HOOK] Liste mise à jour (conversation existante):', sorted.length)
          return sorted
        }
        // Ajouter en fin de liste (plus récent en bas)
        const newList = [...prev, normalized]
        // Trier par ID pour maintenir l'ordre (plus récentes en bas)
        const sorted = newList.sort((a, b) => (a.id as number) - (b.id as number))
        console.log('🔵 [FORUM_HOOK] Nouvelle liste créée avec la conversation:', sorted.length)
        sorted.forEach((c, idx) => {
          console.log(`🔵 [FORUM_HOOK]   Nouvelle conversation ${idx + 1}: ID=${c.id}, title="${c.title}", forumId=${c.forumId}`)
        })
        return sorted
      })
      
      console.log('✅ [FORUM_HOOK] Conversation créée et ajoutée à la liste:', normalized.id)
      console.log('✅ [FORUM_HOOK] Détails de la conversation normalisée:', {
        id: normalized.id,
        title: normalized.title,
        forumId: normalized.forumId,
        authorAvatar: normalized.authorAvatar,
        isResolved: normalized.isResolved
      })
      
      // Recharger les conversations depuis le serveur pour avoir les données complètes
      // Cela garantit que la nouvelle conversation apparaît automatiquement, comme pour les commentaires
      console.log('🟦 [FORUM_HOOK] Rechargement des conversations pour le forum:', forumId)
      await fetchConversations(forumId)
      
      console.log('✅ [FORUM_HOOK] Conversation créée et conversations rechargées')
      console.log('🔵 [FORUM_HOOK] ===== FIN createConversation =====')
      console.log('🔵 [FORUM_HOOK] ==========================================')
      return normalized
    } catch (error) {
      console.error('❌ [FORUM_HOOK] Erreur createConversation:', error)
      console.log('🔵 [FORUM_HOOK] ===== FIN createConversation (ERREUR) =====')
      console.log('🔵 [FORUM_HOOK] ==========================================')
      throw error
    }
  }, [isAuthenticated, user, conversations, fetchConversations])
  
  const updateConversation = useCallback(async (id: number, data: Partial<CreateConversationData>): Promise<Conversation | null> => {
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté pour modifier une conversation')
    }
    
    try {
      const formData = new FormData()
      if (data.title) formData.append('title', data.title)
      if (data.description) formData.append('description', data.description)
      if (data.image) formData.append('image', data.image)
      
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
        isResolved: updatedConversation.is_resolved,
        image: updatedConversation.image_url || updatedConversation.image || '/placeholder.svg',
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

