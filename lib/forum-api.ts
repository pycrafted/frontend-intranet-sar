/**
 * API client pour le module Forum
 */

import { api } from './api-client'
import type {
  Forum,
  ForumMessage,
  ForumCreateData,
  ForumUpdateData,
  ForumMessageCreateData,
  ForumFilters,
} from './types/forum'

const BASE_ENDPOINT = '/forum'

/**
 * Récupère la liste des forums avec filtres optionnels
 */
export async function getForums(filters?: ForumFilters): Promise<Forum[]> {
  const params = new URLSearchParams()
  
  if (filters?.search) {
    params.append('search', filters.search)
  }
  
  if (filters?.sort) {
    params.append('sort', filters.sort)
  }
  
  const queryString = params.toString()
  const endpoint = queryString ? `${BASE_ENDPOINT}/?${queryString}` : `${BASE_ENDPOINT}/`
  
  const response = await api.get(endpoint)
  
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des forums: ${response.statusText}`)
  }
  
  const data = await response.json()
  return Array.isArray(data) ? data : data.results || []
}

/**
 * Récupère les détails d'un forum
 */
export async function getForum(id: number): Promise<Forum> {
  const response = await api.get(`${BASE_ENDPOINT}/${id}/`)
  
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération du forum: ${response.statusText}`)
  }
  
  return await response.json()
}

/**
 * Crée un nouveau forum
 */
export async function createForum(data: ForumCreateData): Promise<Forum> {
  const formData = new FormData()
  formData.append('title', data.title)
  if (data.image) {
    formData.append('image', data.image)
  }
  
  const response = await api.post(`${BASE_ENDPOINT}/create/`, formData, {
    headers: {
      // Ne pas définir Content-Type, le navigateur le fera automatiquement avec FormData
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `Erreur lors de la création du forum: ${response.statusText}`)
  }
  
  return await response.json()
}

/**
 * Met à jour un forum
 */
export async function updateForum(id: number, data: ForumUpdateData): Promise<Forum> {
  const formData = new FormData()
  if (data.title) {
    formData.append('title', data.title)
  }
  if (data.image) {
    formData.append('image', data.image)
  }
  
  const response = await api.put(`${BASE_ENDPOINT}/${id}/update/`, formData, {
    headers: {
      // Ne pas définir Content-Type, le navigateur le fera automatiquement avec FormData
    },
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `Erreur lors de la mise à jour du forum: ${response.statusText}`)
  }
  
  return await response.json()
}

/**
 * Supprime un forum (soft delete)
 */
export async function deleteForum(id: number): Promise<void> {
  const response = await api.delete(`${BASE_ENDPOINT}/${id}/delete/`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `Erreur lors de la suppression du forum: ${response.statusText}`)
  }
}

/**
 * Récupère les messages d'un forum
 */
export async function getForumMessages(forumId: number): Promise<ForumMessage[]> {
  const response = await api.get(`${BASE_ENDPOINT}/${forumId}/messages/`)
  
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des messages: ${response.statusText}`)
  }
  
  const data = await response.json()
  return Array.isArray(data) ? data : data.results || []
}

/**
 * Crée un nouveau message dans un forum
 */
export async function createForumMessage(
  forumId: number,
  data: ForumMessageCreateData
): Promise<ForumMessage> {
  // Si une image est fournie, utiliser FormData
  if (data.image) {
    const formData = new FormData()
    // Toujours envoyer le contenu, même s'il est vide
    formData.append('content', data.content || '')
    formData.append('image', data.image)
    const response = await api.post(`${BASE_ENDPOINT}/${forumId}/messages/create/`, formData)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }))
      console.error("Erreur backend:", errorData)
      // Gérer les erreurs de validation Django
      const errorMessage = errorData.detail || errorData.content?.[0] || errorData.image?.[0] || response.statusText
      throw new Error(errorMessage || `Erreur lors de la création du message: ${response.statusText}`)
    }
    
    return await response.json()
  } else {
    // Sans image, utiliser JSON normal
    const response = await api.post(`${BASE_ENDPOINT}/${forumId}/messages/create/`, data)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }))
      console.error("Erreur backend:", errorData)
      // Gérer les erreurs de validation Django
      const errorMessage = errorData.detail || errorData.content?.[0] || errorData.image?.[0] || response.statusText
      throw new Error(errorMessage || `Erreur lors de la création du message: ${response.statusText}`)
    }
    
    return await response.json()
  }
}

/**
 * Met à jour un message
 */
export async function updateForumMessage(
  messageId: number,
  data: ForumMessageCreateData
): Promise<ForumMessage> {
  const response = await api.put(`${BASE_ENDPOINT}/messages/${messageId}/update/`, data)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `Erreur lors de la mise à jour du message: ${response.statusText}`)
  }
  
  return await response.json()
}

/**
 * Supprime un message
 */
export async function deleteForumMessage(messageId: number): Promise<void> {
  const response = await api.delete(`${BASE_ENDPOINT}/messages/${messageId}/delete/`)
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(error.detail || `Erreur lors de la suppression du message: ${response.statusText}`)
  }
}

