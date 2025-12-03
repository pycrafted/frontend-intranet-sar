/**
 * Configuration centralisée de l'application
 * Toutes les URLs et configurations doivent venir des variables d'environnement
 */

/**
 * URL de base de l'API backend
 * Doit être définie dans .env.local ou .env.production
 * Format attendu: http://host:port/api ou https://domain.com/api
 */
export const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  // La variable d'environnement est obligatoire
  if (!apiUrl) {
    const errorMsg = '⚠️ [CONFIG] NEXT_PUBLIC_API_URL n\'est pas définie. Veuillez la définir dans .env.local'
    if (typeof window !== 'undefined') {
      console.error(errorMsg)
    } else {
      throw new Error(errorMsg)
    }
    return ''
  }
  
  // S'assurer que l'URL se termine par /api si ce n'est pas déjà le cas
  if (!apiUrl.endsWith('/api')) {
    return `${apiUrl}/api`
  }
  
  return apiUrl
}

/**
 * URL de base de l'API sans le suffixe /api
 */
export const getApiBaseUrl = (): string => {
  const apiUrl = getApiUrl()
  return apiUrl.replace(/\/api$/, '')
}

/**
 * Configuration de l'API pour les différents endpoints
 * Utilise des fonctions pour éviter les erreurs d'initialisation
 */
export const API_CONFIG = {
  get BASE_URL() { return getApiUrl() },
  get BASE_URL_WITHOUT_API() { return getApiBaseUrl() },
  get ANNUAIRE() { return `${getApiUrl()}/annuaire` },
  get ORGANIGRAMME() { return `${getApiUrl()}/organigramme` },
  get ACTUALITES() { return `${getApiUrl()}/actualites` },
  get ACCUEIL() { return `${getApiUrl()}/accueil` },
  get AUTH() { return `${getApiUrl()}/auth` },
  get DOCUMENTS() { return `${getApiUrl()}/documents` },
}

/**
 * Configuration complète de l'application
 * Compatible avec l'ancien format pour maintenir la compatibilité
 * Utilise des getters pour éviter les erreurs d'initialisation
 */
export const config = {
  claude: {
    get apiKey() { 
      return process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '' 
    },
    get apiUrl() { 
      return process.env.NEXT_PUBLIC_CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages' 
    },
    get model() { 
      return process.env.NEXT_PUBLIC_CLAUDE_MODEL || 'claude-3-5-sonnet-20241022' 
    },
    get maxTokens() { 
      return parseInt(process.env.NEXT_PUBLIC_CLAUDE_MAX_TOKENS || '4096', 10) 
    },
    get maxHistory() { 
      return parseInt(process.env.NEXT_PUBLIC_CLAUDE_MAX_HISTORY || '10', 10) 
    },
  },
  chatbot: {
    get welcomeMessage() { 
      return process.env.NEXT_PUBLIC_CHATBOT_WELCOME_MESSAGE || 'Bonjour ! Je suis MAÏ, votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?' 
    },
  },
  backend: {
    get apiUrl() { 
      // Pour les routes API server-side, utiliser BACKEND_URL si disponible, sinon getApiBaseUrl()
      return process.env.BACKEND_URL || getApiBaseUrl()
    },
    get apiUrlWithApi() {
      // URL avec /api pour les endpoints
      return getApiUrl()
    },
  },
}
