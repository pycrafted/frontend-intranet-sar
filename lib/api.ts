// Configuration de l'API
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/actualites`;

// Types TypeScript pour les données

export interface Article {
  id: number;
  type: 'news' | 'event' | 'announcement';
  title: string;
  content: string;
  date: string;
  time: string;
  image?: string;
  image_url?: string;
  event_date?: string;
  // Nouveaux champs pour les cartes adaptatives
  video?: string;
  video_url?: string;
  video_poster?: string;
  video_poster_url?: string;
  content_type: 'text_only' | 'image_only' | 'text_image' | 'video' | 'event';
}

export interface ArticleListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Article[];
}

export interface ArticleStats {
  filters: {
    all: number;
    announcements: number;
    events: number;
    publications: number;
  };
  categories: {
    [key: string]: number;
  };
  timeFilters?: {
    today: number;
    week: number;
    month: number;
  };
}

export interface CreateArticleData {
  type: 'news' | 'announcement';
  title?: string;
  content?: string;
  event_date?: string;
  content_type?: 'text_only' | 'image_only' | 'text_image' | 'video' | 'event';
  image?: File;
  video?: File;
  video_poster?: File;
}

// Fonctions API
export const api = {
  // Récupérer la liste des articles avec filtrage
  async getArticles(params?: {
    type?: string;
    search?: string;
    time_filter?: string;
    page?: number;
    page_size?: number;
  }): Promise<ArticleListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.type) searchParams.append('type', params.type);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.time_filter) searchParams.append('time_filter', params.time_filter);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.page_size) searchParams.append('page_size', params.page_size.toString());

    const url = `${API_BASE_URL}/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      credentials: 'omit' // Désactiver l'authentification temporairement
    });
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    
    return response.json();
  },

  // Récupérer le détail d'un article
  async getArticle(id: number): Promise<Article> {
    const response = await fetch(`${API_BASE_URL}/${id}/`, {
      credentials: 'omit' // Désactiver l'authentification temporairement
    });
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    return response.json();
  },


  // Récupérer les statistiques
  async getStats(): Promise<ArticleStats> {
    const response = await fetch(`${API_BASE_URL}/stats/`, {
      credentials: 'omit' // Désactiver l'authentification temporairement
    });
    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }
    return response.json();
  },

  // Supprimer un article
  async deleteArticle(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}/`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Erreur inconnue' };
      }
      throw new Error(`Erreur API: ${response.status} - ${JSON.stringify(errorData)}`);
    }
  },

  // Modifier un article
  async updateArticle(id: number, articleData: CreateArticleData): Promise<Article> {
    // Préparer FormData pour gérer les fichiers
    const formData = new FormData();
    
    // Ajouter tous les champs textuels
    formData.append('type', articleData.type);
    if (articleData.title) formData.append('title', articleData.title);
    if (articleData.content) formData.append('content', articleData.content);
    
    if (articleData.question) formData.append('question', articleData.question);
    if (articleData.end_date) formData.append('end_date', articleData.end_date);
    if (articleData.event_date) formData.append('event_date', articleData.event_date);
    if (articleData.content_type) formData.append('content_type', articleData.content_type);
    
    // Ajouter l'image si présente
    if (articleData.image) {
      formData.append('image', articleData.image);
    }
    
    // Ajouter la vidéo si présente
    if (articleData.video) {
      formData.append('video', articleData.video);
    }
    
    // Ajouter l'image de couverture de la vidéo si présente
    if (articleData.video_poster) {
      formData.append('video_poster', articleData.video_poster);
    }
    
    const response = await fetch(`${API_BASE_URL}/${id}/`, {
      method: 'PUT',
      // Ne pas définir Content-Type, laissez le navigateur le faire pour FormData
      body: formData,
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Erreur inconnue' };
      }
      throw new Error(`Erreur API: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const result = await response.json();
    return result;
  },

  // Créer un nouvel article
  async createArticle(articleData: CreateArticleData): Promise<Article> {
    // Préparer FormData pour gérer les fichiers
    const formData = new FormData();
    
    // Ajouter tous les champs textuels
    formData.append('type', articleData.type);
    if (articleData.title) formData.append('title', articleData.title);
    if (articleData.content) formData.append('content', articleData.content);
    
    if (articleData.question) formData.append('question', articleData.question);
    if (articleData.end_date) formData.append('end_date', articleData.end_date);
    if (articleData.event_date) formData.append('event_date', articleData.event_date);
    if (articleData.content_type) formData.append('content_type', articleData.content_type);
    
    // Ajouter l'image si présente
    if (articleData.image) {
      formData.append('image', articleData.image);
    }
    
    // Ajouter la vidéo si présente
    if (articleData.video) {
      formData.append('video', articleData.video);
    }
    
    // Ajouter l'image de couverture de la vidéo si présente
    if (articleData.video_poster) {
      formData.append('video_poster', articleData.video_poster);
    }
    
    const response = await fetch(`${API_BASE_URL}/create/`, {
      method: 'POST',
      // Ne pas définir Content-Type, laissez le navigateur le faire pour FormData
      body: formData,
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Erreur inconnue' };
      }
      throw new Error(`Erreur API: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const result = await response.json();
    return result;
  },
};
