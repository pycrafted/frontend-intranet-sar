"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { AuthGuard } from "@/components/auth-guard"
import { useMetrics } from "@/hooks/useMetrics"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StandardLoader } from "@/components/ui/standard-loader"
import { 
  BarChart3, 
  Users, 
  LogIn, 
  FileText, 
  MessageSquare,
  TrendingUp,
  Calendar,
  Clock,
  Activity,
  Download,
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']

export default function MetriquesPage() {
  const { metrics, loginStats, loading, error, fetchLoginStats } = useMetrics()
  const [statsPeriod, setStatsPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setStatsPeriod(period)
    fetchLoginStats(period)
  }


  if (loading) {
    return (
      <AuthGuard fallback={null} redirectTo="/">
        <LayoutWrapper>
          <StandardLoader />
        </LayoutWrapper>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard fallback={null} redirectTo="/">
        <LayoutWrapper>
          <StandardLoader 
            error={error}
            showRetry={true}
            onRetry={() => window.location.reload()}
          />
        </LayoutWrapper>
      </AuthGuard>
    )
  }

  if (!metrics) {
    return (
      <AuthGuard fallback={null} redirectTo="/">
        <LayoutWrapper>
          <div className="w-full space-y-4 xs:space-y-6">
            <div className="max-w-7xl mx-auto">
              <Card className="p-8 xs:p-12 text-center rounded-lg">
                <div className="space-y-3 xs:space-y-4">
                  <div className="w-12 h-12 xs:w-16 xs:h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <BarChart3 className="h-6 w-6 xs:h-8 xs:w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base xs:text-lg font-semibold">Aucune donnée disponible</h3>
                    <p className="text-sm text-gray-500 mt-1">Les métriques seront disponibles après les premières connexions</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </LayoutWrapper>
      </AuthGuard>
    )
  }

  // Préparer les données pour les graphiques
  const dailyChartData = metrics.login_trend_daily.map(item => ({
    date: format(parseISO(item.date), 'dd/MM', { locale: fr }),
    fullDate: item.date,
    connexions: item.count
  }))

  const weeklyChartData = metrics.login_trend_weekly.map((item, index) => ({
    semaine: `Sem ${index + 1}`,
    fullWeek: item.week_start,
    connexions: item.count
  }))

  const monthlyChartData = metrics.login_trend_monthly.map((item, index) => ({
    mois: format(parseISO(item.month_start), 'MMM yyyy', { locale: fr }),
    fullMonth: item.month_start,
    connexions: item.count
  }))

  const yearlyChartData = metrics.login_trend_yearly?.map((item, index) => ({
    annee: item.year.toString(),
    fullYear: item.year_start,
    connexions: item.count
  })) || []

  return (
    <AuthGuard fallback={null} redirectTo="/">
      <LayoutWrapper>
        <div className="w-full space-y-4 xs:space-y-6">
          {/* En-tête - Style actualités */}
          <div className="flex items-center gap-2 mb-3 xs:mb-4 px-1 max-w-7xl mx-auto">
            <div className="w-1 h-4 xs:h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-sm"></div>
            <h1 className="text-base xs:text-lg font-semibold text-gray-900">Métriques et Analytics</h1>
            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs xs:text-sm px-2 py-1">
              Dashboard
            </Badge>
          </div>

          {/* Métriques principales - Style feed */}
          <div className="space-y-3 xs:space-y-4 max-w-7xl mx-auto stagger-animation">
            {/* Section: Vue d'ensemble */}
            <div className="space-y-3 xs:space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-4 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full"></div>
                <h2 className="text-sm xs:text-base font-semibold text-gray-800">Vue d'ensemble</h2>
              </div>
              
              <div className="grid gap-3 xs:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <LogIn className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        Aujourd'hui
                      </Badge>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.daily_logins}
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">
                      {metrics.active_users_today} utilisateurs actifs
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <Calendar className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        Cette semaine
                      </Badge>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.weekly_logins}
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">
                      {metrics.active_users_week} utilisateurs actifs
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <TrendingUp className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        Ce mois
                      </Badge>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.monthly_logins}
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">
                      {metrics.active_users_month} utilisateurs actifs
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <Users className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        Total
                      </Badge>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.total_users}
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">
                      Utilisateurs enregistrés
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section: Engagement */}
            <div className="space-y-3 xs:space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-4 bg-gradient-to-b from-pink-400 to-rose-400 rounded-full"></div>
                <h2 className="text-sm xs:text-base font-semibold text-gray-800">Engagement</h2>
              </div>
              
              <div className="grid gap-3 xs:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <Clock className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.avg_session_duration_minutes} min
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">Durée moyenne de session</p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <Activity className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.engagement_rate}%
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">
                      {metrics.active_users_month} / {metrics.total_users} utilisateurs
                    </p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <Users className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                        Nouveaux
                      </Badge>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.new_users_count}
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">30 derniers jours</p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <Download className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.total_downloads}
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">Documents téléchargés</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section: Contenu */}
            <div className="space-y-3 xs:space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-4 bg-gradient-to-b from-teal-400 to-cyan-400 rounded-full"></div>
                <h2 className="text-sm xs:text-base font-semibold text-gray-800">Contenu</h2>
              </div>
              
              <div className="grid gap-3 xs:gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <FileText className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.total_articles}
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">Articles publiés</p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <FileText className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.total_documents}
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">Documents disponibles</p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <MessageSquare className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.total_forum_posts}
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">Messages forum</p>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-white/20 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                        <Users className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
                      </div>
                    </div>
                    <div className="text-3xl xs:text-4xl font-bold text-white mb-1">
                      {metrics.total_employees}
                    </div>
                    <p className="text-xs xs:text-sm text-white/80 font-medium">Personnes dans l'annuaire</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section: Graphiques */}
            <div className="space-y-3 xs:space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-4 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full"></div>
                <h2 className="text-sm xs:text-base font-semibold text-gray-800">Analyses détaillées</h2>
              </div>

              {/* Graphiques - Activité temporelle */}
              <div className="grid gap-3 xs:gap-4 sm:grid-cols-2">
                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <BarChart3 className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-sm xs:text-base font-semibold text-white">Heures de Pointe</h3>
                      </div>
                      <p className="text-xs text-white/80 mt-1">Moyenne des connexions par heure (365 derniers jours)</p>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={metrics.hourly_logins}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                          dataKey="hour" 
                          tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }}
                          label={{ value: 'Heure', position: 'insideBottom', offset: -5, fill: 'rgba(255, 255, 255, 0.8)' }}
                        />
                        <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} />
                        <Tooltip 
                          formatter={(value: any, payload: any) => {
                            const data = payload?.[0]?.payload
                            if (data?.avg_count !== undefined && data?.total_count !== undefined) {
                              return [
                                `${data.avg_count.toFixed(1)} connexions en moyenne`,
                                `Total: ${data.total_count} sur 365 jours`
                              ]
                            }
                            return [value, 'Connexions']
                          }}
                          labelFormatter={(label) => `Heure: ${label}h`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500" style={{ backgroundColor: '#344256' }}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="relative p-4 xs:p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="text-sm xs:text-base font-semibold text-white">Activité par Jour</h3>
                      </div>
                      <p className="text-xs text-white/80 mt-1">365 derniers jours</p>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={metrics.weekday_activity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.8)' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tickFormatter={(value) => {
                            try {
                              const date = parseISO(value)
                              return format(date, 'dd/MM', { locale: fr })
                            } catch {
                              return value
                            }
                          }}
                        />
                        <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} />
                        <Tooltip 
                          formatter={(value: any) => [value, 'Connexions']}
                          labelFormatter={(label) => {
                            try {
                              const date = parseISO(label)
                              return format(date, 'EEEE dd MMMM yyyy', { locale: fr })
                            } catch {
                              return `Date: ${label}`
                            }
                          }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Répartition par département */}
              {metrics.department_stats && metrics.department_stats.length > 0 && (
                <div className="grid gap-3 xs:gap-4 sm:grid-cols-2">
                  <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500" style={{ backgroundColor: '#344256' }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <CardContent className="relative p-4 xs:p-6">
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-sm xs:text-base font-semibold text-white">Par Département</h3>
                        </div>
                        <p className="text-xs text-white/80 mt-1">365 derniers jours</p>
                      </div>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={metrics.department_stats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="login_count"
                          >
                            {metrics.department_stats.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top documents */}
                  {metrics.top_documents && metrics.top_documents.length > 0 && (
                    <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500" style={{ backgroundColor: '#344256' }}>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <CardContent className="relative p-4 xs:p-6">
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                              <Download className="h-4 w-4 text-white" />
                            </div>
                            <h3 className="text-sm xs:text-base font-semibold text-white">Top Documents</h3>
                          </div>
                          <p className="text-xs text-white/80 mt-1">Les plus téléchargés</p>
                        </div>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto">
                          {metrics.top_documents.map((doc: any, index: number) => (
                            <div key={index} className="group/item flex items-center justify-between p-3 border-2 border-white/20 rounded-lg hover:border-white/40 hover:bg-white/10 transition-all duration-300 hover:shadow-md">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs xs:text-sm font-semibold text-white truncate group-hover/item:text-white transition-colors">{doc.title}</p>
                                <p className="text-xs text-white/70 truncate">{doc.category}</p>
                              </div>
                              <Badge className="ml-2 bg-white/20 text-white border-white/30 backdrop-blur-sm group-hover/item:scale-110 transition-transform duration-300">
                                {doc.download_count}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Graphiques hebdomadaires et mensuels */}
              <Card className="group relative overflow-hidden rounded-xl border-0 shadow-lg hover:shadow-2xl transition-all duration-500" style={{ backgroundColor: '#344256' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <CardContent className="relative p-4 xs:p-6">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                        <BarChart3 className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-sm xs:text-base font-semibold text-white">Tendances de Connexion</h3>
                    </div>
                  </div>
                  <Tabs defaultValue="daily" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4 relative bg-transparent" style={{ gap: '10px' }}>
                      <TabsTrigger 
                        value="daily" 
                        onClick={() => handlePeriodChange('daily')} 
                        className="w-full text-xs py-1.5 px-2 bg-white text-gray-900 hover:bg-white/90 data-[state=active]:bg-blue-500 data-[state=active]:text-white border-r transition-colors" 
                        style={{ borderColor: '#344256' }}
                      >
                        Quotidien
                      </TabsTrigger>
                      <TabsTrigger 
                        value="weekly" 
                        onClick={() => handlePeriodChange('weekly')} 
                        className="w-full text-xs py-1.5 px-2 bg-white text-gray-900 hover:bg-white/90 data-[state=active]:bg-blue-500 data-[state=active]:text-white border-r transition-colors" 
                        style={{ borderColor: '#344256' }}
                      >
                        Hebdomadaire
                      </TabsTrigger>
                      <TabsTrigger 
                        value="monthly" 
                        onClick={() => handlePeriodChange('monthly')} 
                        className="w-full text-xs py-1.5 px-2 bg-white text-gray-900 hover:bg-white/90 data-[state=active]:bg-blue-500 data-[state=active]:text-white border-r transition-colors" 
                        style={{ borderColor: '#344256' }}
                      >
                        Mensuel
                      </TabsTrigger>
                      <TabsTrigger 
                        value="yearly" 
                        onClick={() => handlePeriodChange('yearly')} 
                        className="w-full text-xs py-1.5 px-2 bg-white text-gray-900 hover:bg-white/90 data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-colors"
                      >
                        Annuel
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="daily" className="space-y-4">
                      <div>
                        <h3 className="text-sm xs:text-base font-semibold text-white mb-1">30 derniers jours</h3>
                        <p className="text-xs text-white/80 mb-4">Évolution des connexions par jour</p>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dailyChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.8)' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} />
                          <Tooltip 
                            formatter={(value: any) => [value, 'Connexions']}
                            labelFormatter={(label) => `Date: ${label}`}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="connexions" 
                            stroke="#3B82F6" 
                            fill="#3B82F6"
                            fillOpacity={0.3}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="weekly" className="space-y-4">
                      <div>
                        <h3 className="text-sm xs:text-base font-semibold text-white mb-1">12 dernières semaines</h3>
                        <p className="text-xs text-white/80 mb-4">Évolution des connexions par semaine</p>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={weeklyChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="semaine" 
                            tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }}
                          />
                          <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} />
                          <Tooltip 
                            formatter={(value: any) => [value, 'Connexions']}
                            labelFormatter={(label) => `Semaine: ${label}`}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                          <Bar dataKey="connexions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="monthly" className="space-y-4">
                      <div>
                        <h3 className="text-sm xs:text-base font-semibold text-white mb-1">12 derniers mois</h3>
                        <p className="text-xs text-white/80 mb-4">Évolution des connexions par mois</p>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="mois" 
                            tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.8)' }}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                          <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} />
                          <Tooltip 
                            formatter={(value: any) => [value, 'Connexions']}
                            labelFormatter={(label) => `Mois: ${label}`}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="connexions" 
                            stroke="#F59E0B" 
                            strokeWidth={2}
                            dot={{ fill: '#F59E0B', r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </TabsContent>

                    <TabsContent value="yearly" className="space-y-4">
                      <div>
                        <h3 className="text-sm xs:text-base font-semibold text-white mb-1">5 dernières années</h3>
                        <p className="text-xs text-white/80 mb-4">Évolution des connexions par année</p>
                      </div>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={yearlyChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                          <XAxis 
                            dataKey="annee" 
                            tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }}
                          />
                          <YAxis tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.8)' }} />
                          <Tooltip 
                            formatter={(value: any) => [value, 'Connexions']}
                            labelFormatter={(label) => `Année: ${label}`}
                            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                          />
                          <Bar dataKey="connexions" fill="#10B981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </LayoutWrapper>
    </AuthGuard>
  )
}
