import { useState, useEffect } from 'react';
import { api, Article, ArticleListResponse, ArticleStats } from '@/lib/api';

interface UseArticlesParams {
  type?: string;
  search?: string;
  timeFilter?: string;
  page?: number;
  pageSize?: number;
}

export function useArticles(params: UseArticlesParams = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ArticleListResponse = await api.getArticles({
        type: params.type,
        search: params.search,
        time_filter: params.timeFilter,
        page: params.page,
        page_size: params.pageSize,
      });

      setArticles(response.results);
      setTotalCount(response.count);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
      
      // Log des URLs d'images pour débogage
      console.log('🖼️ [USE_ARTICLES] URLs d\'images reçues:', 
        response.results.map((article: any) => ({
          id: article.id,
          title: article.title,
          type: article.type,
          content_type: article.content_type,
          image_url: article.image_url,
          image: article.image,
          final_url: article.image_url || article.image,
          has_image: !!(article.image_url || article.image)
        }))
      );
      
      // Tester une URL d'image si elle existe
      const articleWithImage = response.results.find((article: any) => article.image_url || article.image);
      if (articleWithImage) {
        const imageUrl = articleWithImage.image_url || articleWithImage.image;
        console.log('🔍 [USE_ARTICLES] Test de l\'URL d\'image:', imageUrl);
        
        // Tester l'URL avec fetch
        fetch(imageUrl, { method: 'HEAD' })
          .then(response => {
            console.log('🔍 [USE_ARTICLES] Test fetch image:', {
              url: imageUrl,
              status: response.status,
              statusText: response.statusText,
              ok: response.ok,
              contentType: response.headers.get('content-type')
            });
          })
          .catch(error => {
            console.error('❌ [USE_ARTICLES] Erreur fetch image:', {
              url: imageUrl,
              error: error.message
            });
          });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des articles');
      console.error('Erreur lors du chargement des articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [params.type, params.search, params.timeFilter, params.page, params.pageSize]);

  return {
    articles,
    loading,
    error,
    totalCount,
    hasNext,
    hasPrevious,
    refetch: fetchArticles,
  };
}

export function useArticleStats() {
  const [stats, setStats] = useState<ArticleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.getStats();
      setStats(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques');
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}

