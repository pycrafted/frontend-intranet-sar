import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Article {
  id: number;
  type: 'news' | 'announcement';
  title: string | null;
  content: string | null;
  date: string;
  time: string;
  author: string | null;
  author_role: string | null;
  author_avatar_url: string | null;
  category: string;
  image_url: string | null;
  is_pinned: boolean;
  content_type: string;
  video_url: string | null;
  video_poster_url: string | null;
  gallery_images: string[] | null;
  gallery_title: string | null;
  created_at: string;
  updated_at: string;
}

interface ArticleFormData {
  type: 'news' | 'announcement';
  title: string;
  content: string;
  date: string;
  time: string;
  author: string;
  author_role: string;
  category: string;
  is_pinned: boolean;
  content_type: 'text_only' | 'image_only' | 'text_image' | 'gallery' | 'video';
  gallery_title: string;
  // Fichiers
  author_avatar?: File;
  image?: File;
  video?: File;
  video_poster?: File;
}

interface Filters {
  type: string;
  category: string;
  pinned: string;
  time_filter: string;
  search: string;
  page: number;
  page_size: number;
}

interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  start: number;
  end: number;
}

export const useArticlesAdmin = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    page_size: 20,
    total: 0,
    total_pages: 0,
    start: 0,
    end: 0
  });
  const [filters, setFilters] = useState<Filters>({
    type: 'all',
    category: 'Toutes',
    pinned: 'all',
    time_filter: 'all',
    search: '',
    page: 1,
    page_size: 20
  });
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const ARTICLES_URL = `${BASE_URL}actualites/`;

  // Fonction pour construire les paramètres de requête
  const buildQueryParams = useCallback((filters: Filters) => {
    const params = new URLSearchParams();
    
    if (filters.type && filters.type !== 'all') {
      params.append('type', filters.type);
    }
    if (filters.category && filters.category !== 'Toutes') {
      params.append('category', filters.category);
    }
    if (filters.pinned && filters.pinned !== 'all') {
      params.append('pinned', filters.pinned);
    }
    if (filters.time_filter && filters.time_filter !== 'all') {
      params.append('time_filter', filters.time_filter);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.page_size) {
      params.append('page_size', filters.page_size.toString());
    }

    return params.toString();
  }, []);

  // Récupérer les articles
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = buildQueryParams(filters);
      const url = queryParams ? `${ARTICLES_URL}?${queryParams}` : ARTICLES_URL;
      
      const response = await axios.get(url);
      setArticles(response.data.results || response.data);
      
      // Mettre à jour la pagination si disponible
      if (response.data.count !== undefined) {
        setPagination({
          page: filters.page,
          page_size: filters.page_size,
          total: response.data.count,
          total_pages: Math.ceil(response.data.count / filters.page_size),
          start: (filters.page - 1) * filters.page_size + 1,
          end: Math.min(filters.page * filters.page_size, response.data.count)
        });
      }
    } catch (err: any) {
      console.error('Erreur lors de la récupération des articles:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
  }, [filters, ARTICLES_URL, buildQueryParams]);

  // Créer un article
  const createArticle = async (data: ArticleFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Ajouter les champs textuels
      formData.append('type', data.type);
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('date', data.date);
      formData.append('time', data.time);
      formData.append('author', data.author);
      formData.append('author_role', data.author_role);
      formData.append('category', data.category);
      formData.append('is_pinned', data.is_pinned.toString());
      formData.append('content_type', data.content_type);
      formData.append('gallery_title', data.gallery_title);
      
      // Ajouter les fichiers
      if (data.author_avatar) {
        formData.append('author_avatar', data.author_avatar);
      }
      if (data.image) {
        formData.append('image', data.image);
      }
      if (data.video) {
        formData.append('video', data.video);
      }
      if (data.video_poster) {
        formData.append('video_poster', data.video_poster);
      }

      const response = await axios.post(`${ARTICLES_URL}create/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Rafraîchir la liste des articles
      await fetchArticles();
      
      return { success: true, data: response.data };
    } catch (err: any) {
      console.error('Erreur lors de la création de l\'article:', err);
      setError(err.response?.data?.error || 'Erreur lors de la création de l\'article');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour un article
  const updateArticle = async (id: number, data: ArticleFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Ajouter les champs textuels
      formData.append('type', data.type);
      formData.append('title', data.title);
      formData.append('content', data.content);
      formData.append('date', data.date);
      formData.append('time', data.time);
      formData.append('author', data.author);
      formData.append('author_role', data.author_role);
      formData.append('category', data.category);
      formData.append('is_pinned', data.is_pinned.toString());
      formData.append('content_type', data.content_type);
      formData.append('gallery_title', data.gallery_title);
      
      // Ajouter les fichiers
      if (data.author_avatar) {
        formData.append('author_avatar', data.author_avatar);
      }
      if (data.image) {
        formData.append('image', data.image);
      }
      if (data.video) {
        formData.append('video', data.video);
      }
      if (data.video_poster) {
        formData.append('video_poster', data.video_poster);
      }

      const response = await axios.patch(`${ARTICLES_URL}${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Rafraîchir la liste des articles
      await fetchArticles();
      
      return { success: true, data: response.data };
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour de l\'article:', err);
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour de l\'article');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un article
  const deleteArticle = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`${ARTICLES_URL}${id}/`);
      
      // Rafraîchir la liste des articles
      await fetchArticles();
      
      return { success: true };
    } catch (err: any) {
      console.error('Erreur lors de la suppression de l\'article:', err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression de l\'article');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Supprimer plusieurs articles
  const deleteMultipleArticles = async (ids: number[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Supprimer les articles un par un
      for (const id of ids) {
        await axios.delete(`${ARTICLES_URL}${id}/`);
      }
      
      // Rafraîchir la liste des articles
      await fetchArticles();
      
      return { success: true };
    } catch (err: any) {
      console.error('Erreur lors de la suppression des articles:', err);
      setError(err.response?.data?.error || 'Erreur lors de la suppression des articles');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Basculer l'état épinglé d'un article
  const togglePinArticle = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const article = articles.find(a => a.id === id);
      if (!article) {
        throw new Error('Article non trouvé');
      }

      const formData = new FormData();
      formData.append('is_pinned', (!article.is_pinned).toString());

      await axios.patch(`${ARTICLES_URL}${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Rafraîchir la liste des articles
      await fetchArticles();
      
      return { success: true };
    } catch (err: any) {
      console.error('Erreur lors du basculement de l\'état épinglé:', err);
      setError(err.response?.data?.error || 'Erreur lors du basculement de l\'état épinglé');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Basculer l'état épinglé de plusieurs articles
  const togglePinMultipleArticles = async (ids: number[]) => {
    setLoading(true);
    setError(null);
    
    try {
      // Basculer l'état épinglé pour chaque article
      for (const id of ids) {
        const article = articles.find(a => a.id === id);
        if (article) {
          const formData = new FormData();
          formData.append('is_pinned', (!article.is_pinned).toString());

          await axios.patch(`${ARTICLES_URL}${id}/`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
      }

      // Rafraîchir la liste des articles
      await fetchArticles();
      
      return { success: true };
    } catch (err: any) {
      console.error('Erreur lors du basculement de l\'état épinglé:', err);
      setError(err.response?.data?.error || 'Erreur lors du basculement de l\'état épinglé');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  };

  // Effacer la sélection
  const clearSelection = () => {
    setSelectedArticles([]);
  };

  // Charger les articles au montage du composant
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    loading,
    error,
    pagination,
    filters,
    selectedArticles,
    fetchArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    deleteMultipleArticles,
    togglePinArticle,
    togglePinMultipleArticles,
    setFilters,
    setSelectedArticles,
    clearSelection
  };
};
