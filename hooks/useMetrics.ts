import { useState, useEffect } from 'react'
import { APIClient } from '@/lib/api-client'

export interface MetricsSummary {
  daily_logins: number
  weekly_logins: number
  monthly_logins: number
  total_users: number
  active_users_today: number
  active_users_week: number
  active_users_month: number
  total_articles: number
  total_documents: number
  total_forum_posts: number
  total_employees: number
  login_trend_daily: Array<{ date: string; count: number }>
  login_trend_weekly: Array<{ week_start: string; week_end: string; count: number }>
  login_trend_monthly: Array<{ month_start: string; month_end: string; count: number }>
  login_trend_yearly: Array<{ year_start: string; year_end: string; year: number; count: number }>
  top_users: Array<{ email: string; name: string; login_count: number }>
  // Nouvelles métriques
  avg_session_duration_minutes: number
  engagement_rate: number
  hourly_logins: Array<{ hour: number; count: number; avg_count?: number; total_count?: number }>
  weekday_activity: Array<{ day: string; day_fr: string; date: string; count: number }>
  department_stats: Array<{ name: string; login_count: number; unique_users: number }>
  top_documents: Array<{ title: string; download_count: number; category: string }>
  new_users_count: number
  total_downloads: number
}

export interface LoginStats {
  period: 'daily' | 'weekly' | 'monthly'
  stats: Array<{
    date?: string
    week_start?: string
    week_end?: string
    month_start?: string
    month_end?: string
    logins: number
    unique_users: number
  }>
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null)
  const [loginStats, setLoginStats] = useState<LoginStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      const [summaryResponse, statsResponse] = await Promise.all([
        APIClient.get('/metriques/summary/'),
        APIClient.get('/metriques/login-stats/?period=daily'),
      ])

      if (!summaryResponse.ok || !statsResponse.ok) {
        throw new Error('Erreur lors de la récupération des métriques')
      }

      const summaryData = await summaryResponse.json()
      const statsData = await statsResponse.json()

      setMetrics(summaryData)
      setLoginStats(statsData)
    } catch (err: any) {
      console.error('Erreur lors de la récupération des métriques:', err)
      setError(err.message || 'Erreur lors du chargement des métriques')
    } finally {
      setLoading(false)
    }
  }

  const fetchLoginStats = async (period: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily') => {
    try {
      const response = await APIClient.get(`/metriques/login-stats/?period=${period}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques')
      }

      const data = await response.json()
      setLoginStats(data)
    } catch (err: any) {
      console.error('Erreur lors de la récupération des statistiques de connexion:', err)
      setError(err.message || 'Erreur lors du chargement des statistiques')
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  return {
    metrics,
    loginStats,
    loading,
    error,
    refetch: fetchMetrics,
    fetchLoginStats,
  }
}
