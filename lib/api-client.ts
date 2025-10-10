/**
 * Client API avec gestion automatique des cookies de session
 */

// Configuration de base pour toutes les requêtes
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Fonction pour récupérer le token CSRF
async function getCSRFToken(): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.csrfToken
    }
    return null
  } catch (error) {
    console.error('Erreur lors de la récupération du token CSRF:', error)
    return null
  }
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
      const csrfToken = await getCSRFToken()
      if (csrfToken) {
        defaultHeaders['X-CSRFToken'] = csrfToken
      }
    }

    // Headers finaux
    const finalHeaders = { ...defaultHeaders, ...headers }

    // Configuration de la requête
    const requestConfig: RequestInit = {
      method,
      credentials: 'include', // CRUCIAL: Inclure les cookies de session
      headers: finalHeaders,
    }

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
    console.log('🌐 [API_CLIENT] Requête:', {
      url: `${API_BASE_URL}${endpoint}`,
      method,
      headers: finalHeaders,
      body: body ? (body instanceof FormData ? 'FormData' : JSON.stringify(body)) : undefined,
      requireAuth,
      isDocumentsEndpoint: endpoint.includes('/documents/'),
      credentials: requestConfig.credentials
    })
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, requestConfig)
    
    console.log('📡 [API_CLIENT] Réponse:', {
      url: `${API_BASE_URL}${endpoint}`,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      requireAuth,
      isDocumentsEndpoint: endpoint.includes('/documents/')
    })

    // Vérifier l'authentification si requise
    if (requireAuth && (response.status === 401 || response.status === 403)) {
      console.log('🔍 [API_CLIENT] Erreur d\'authentification:', {
        status: response.status,
        url: `${API_BASE_URL}${endpoint}`,
        requireAuth,
        isDocumentsEndpoint: endpoint.includes('/documents/')
      })
      // Ne pas rediriger automatiquement - laisser le contexte d'authentification gérer cela
      // pour éviter les boucles infinies
    } else if (!requireAuth && (response.status === 401 || response.status === 403)) {
      console.log('⚠️ [API_CLIENT] Erreur d\'authentification sur endpoint sans auth:', {
        status: response.status,
        url: `${API_BASE_URL}${endpoint}`,
        requireAuth,
        isDocumentsEndpoint: endpoint.includes('/documents/')
      })
    }

    return response
  }

  // Méthodes HTTP
  static async get(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) {
    // Désactiver l'authentification pour les endpoints de documents
    const isDocumentsEndpoint = endpoint.includes('/documents/')
    return APIClient.makeRequest(endpoint, { ...options, method: 'GET', requireAuth: !isDocumentsEndpoint })
  }

  static async post(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    // Désactiver l'authentification pour les endpoints de documents
    const isDocumentsEndpoint = endpoint.includes('/documents/')
    return APIClient.makeRequest(endpoint, { ...options, method: 'POST', body, requireAuth: !isDocumentsEndpoint })
  }

  static async put(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    // Désactiver l'authentification pour les endpoints de documents
    const isDocumentsEndpoint = endpoint.includes('/documents/')
    return APIClient.makeRequest(endpoint, { ...options, method: 'PUT', body, requireAuth: !isDocumentsEndpoint })
  }

  static async patch(endpoint: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) {
    // Désactiver l'authentification pour les endpoints de documents
    const isDocumentsEndpoint = endpoint.includes('/documents/')
    return APIClient.makeRequest(endpoint, { ...options, method: 'PATCH', body, requireAuth: !isDocumentsEndpoint })
  }

  static async delete(endpoint: string, options: Omit<RequestOptions, 'method'> = {}) {
    // Désactiver l'authentification pour les endpoints de documents
    const isDocumentsEndpoint = endpoint.includes('/documents/')
    return APIClient.makeRequest(endpoint, { ...options, method: 'DELETE', requireAuth: !isDocumentsEndpoint })
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
