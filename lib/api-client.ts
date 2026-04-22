/**
 * Client API avec gestion automatique des cookies de session
 */

import { getApiUrl } from './config'

// Validation de l'URL de l'API pour éviter les fautes de frappe
function validateApiUrl(url: string): string {
  // Vérifier les fautes de frappe communes
  if (url.includes('sar-intrant')) {
    console.warn('⚠️ [API_CLIENT] URL incorrecte détectée: "sar-intrant" devrait être "sar-intranet"')
    return url.replace('sar-intrant', 'sar-intranet')
  }
  return url
}

// Fonction lazy pour obtenir l'URL de base de l'API
function getApiBaseUrl(): string {
  const rawApiUrl = getApiUrl()
  return validateApiUrl(rawApiUrl)
}

// Note: Ne pas appeler getApiBaseUrl() au niveau du module pour éviter les erreurs
// lors du chargement du module. L'URL sera obtenue à la demande dans les fonctions.

// Lire le token CSRF depuis le cookie (csrftoken) — pas de fetch nécessaire
function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null
  return document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? null
}

// Interface pour les options de requête
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  headers?: Record<string, string>
  requireAuth?: boolean
}

// Client API principal
export class APIClient {
  private static async makeRequest(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<Response> {
    const {
      method = 'GET',
      body,
      headers = {},
      requireAuth = true
    } = options

    // Headers par défaut
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    // Ajouter le token CSRF si nécessaire
    if (method !== 'GET') {
      const csrfToken = getCSRFToken()
      if (csrfToken) {
        defaultHeaders['X-CSRFToken'] = csrfToken
      }
    }

    // Headers finaux
    const finalHeaders = { ...defaultHeaders, ...headers }

    // Configuration de la requête
    const requestConfig: RequestInit = {
      method,
      credentials: 'include', // INCLURE les cookies pour la session
      headers: finalHeaders,
    }
    
    console.log('🍪 [API_CLIENT] Cookies avant requête:', {
      cookies: document.cookie,
      hasSessionCookie: document.cookie.includes('sessionid'),
      hasCSRFToken: document.cookie.includes('csrftoken')
    })

    // Ajouter le body si nécessaire
    if (body && method !== 'GET') {
      if (body instanceof FormData) {
        // Pour FormData, ne pas définir Content-Type (le navigateur le fait automatiquement)
        requestConfig.body = body
        // Supprimer Content-Type pour FormData
        delete (requestConfig.headers as any)['Content-Type']
      } else {
        requestConfig.body = JSON.stringify(body)
      }
    }

    // Faire la requête
    const apiBaseUrl = getApiBaseUrl()
    const fullUrl = `${apiBaseUrl}${endpoint}`
    console.log('🌐 [API_CLIENT] ===== DÉBUT REQUÊTE =====')
    console.log('🌐 [API_CLIENT] Timestamp:', new Date().toISOString())
    console.log('🌐 [API_CLIENT] URL complète:', fullUrl)
    console.log('🌐 [API_CLIENT] Méthode:', method)
    console.log('🌐 [API_CLIENT] Endpoint:', endpoint)
    console.log('🌐 [API_CLIENT] API_BASE_URL:', apiBaseUrl)
    console.log('🌐 [API_CLIENT] Headers:', finalHeaders)
    console.log('🌐 [API_CLIENT] Body:', body ? (body instanceof FormData ? 'FormData' : JSON.stringify(body)) : 'Aucun')
    console.log('🌐 [API_CLIENT] requireAuth:', requireAuth)
    console.log('🌐 [API_CLIENT] credentials:', requestConfig.credentials)
    console.log('🌐 [API_CLIENT] isDocumentsEndpoint:', endpoint.includes('/documents/'))
    
    const response = await fetch(fullUrl, requestConfig)
    
    // Log des cookies après la requête
    console.log('🍪 [API_CLIENT] Cookies après requête:', {
      cookies: document.cookie,
      hasSessionCookie: document.cookie.includes('sessionid'),
      hasCSRFToken: document.cookie.includes('csrftoken'),
      setCookieHeader: response.headers.get('Set-Cookie')
    })
    
    console.log('📡 [API_CLIENT] ===== RÉPONSE REÇUE =====')
    console.log('📡 [API_CLIENT] URL:', `${apiBaseUrl}${endpoint}`)
    console.log('📡 [API_CLIENT] Status:', response.status)
    console.log('📡 [API_CLIENT] StatusText:', response.statusText)
    console.log('📡 [API_CLIENT] OK:', response.ok)
    console.log('📡 [API_CLIENT] Headers:', Object.fromEntries(response.headers.entries()))
    console.log('📡 [API_CLIENT] Content-Type:', response.headers.get('Content-Type'))
    console.log('📡 [API_CLIENT] Content-Length:', response.headers.get('Content-Length'))
    console.log('📡 [API_CLIENT] requireAuth:', requireAuth)
    console.log('📡 [API_CLIENT] isDocumentsEndpoint:', endpoint.includes('/documents/'))
    console.log('📡 [API_CLIENT] ===== FIN RÉPONSE =====')

    // Vérifier l'authentification si requise
    if (requireAuth && (response.status === 401 || response.status === 403)) {
      console.log('🔍 [API_CLIENT] Erreur d\'authentification:', {
        status: response.status,
        url: `${apiBaseUrl}${endpoint}`,
        requireAuth,
        isDocumentsEndpoint: endpoint.includes('/documents/')
      })
      // Ne pas rediriger automatiquement - laisser le contexte d'authentification gérer cela
      // pour éviter les boucles infinies
    } else if (!requireAuth && (response.status === 401 || response.status === 403)) {
      console.log('⚠️ [API_CLIENT] Erreur d\'authentification sur endpoint sans auth:', {
        status: response.status,
        url: `${apiBaseUrl}${endpoint}`,
        requireAuth,
        isDocumentsEndpoint: endpoint.includes('/documents/')
      })
    }

    return response
  }

  // Méthodes HTTP
  static async get(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) {
    return APIClient.makeRequest(endpoint, { ...options, method: 'GET' })
  }

  static async post(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return APIClient.makeRequest(endpoint, { ...options, method: 'POST', body })
  }

  static async put(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return APIClient.makeRequest(endpoint, { ...options, method: 'PUT', body })
  }

  static async patch(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    return APIClient.makeRequest(endpoint, { ...options, method: 'PATCH', body })
  }

  static async delete(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) {
    return APIClient.makeRequest(endpoint, { ...options, method: 'DELETE' })
  }
}

// Export des méthodes pour faciliter l'utilisation
export const api = {
  get: APIClient.get,
  post: APIClient.post,
  put: APIClient.put,
  patch: APIClient.patch,
  delete: APIClient.delete,
}
