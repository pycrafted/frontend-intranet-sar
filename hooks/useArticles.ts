import { useState, useEffect } from 'react';
import { api, Article, ArticleListResponse, ArticleStats } from '@/lib/api';

interface UseArticlesParams {
  type?: string;
  category?: string;
  search?: string;
  pinned?: boolean;
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
        category: params.category,
        search: params.search,
        pinned: params.pinned,
        time_filter: params.timeFilter,
        page: params.page,
        page_size: params.pageSize,
      });

      setArticles(response.results);
      setTotalCount(response.count);
      setHasNext(!!response.next);
      setHasPrevious(!!response.previous);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des articles');
      console.error('Erreur lors du chargement des articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [params.type, params.category, params.search, params.pinned, params.timeFilter, params.page, params.pageSize]);

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

