"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/hooks/useAuth"
import { useMetrics } from "@/hooks/useMetrics"
import { Card, CardContent } from "@/components/ui/card"
import { PageLoader } from "@/components/ui/loader"
import {
  BarChart3,
  LogIn,
  TrendingUp,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
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
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"

const MAIN = '#344256'
const MAIN_LIGHT = `${MAIN}18`
const CHART_PRIMARY = '#344256'
const CHART_SECONDARY = '#7c8fa0'
const CHART_MUTED = '#b0bec5'
const GRID_COLOR = '#e2e8f0'
const AXIS_COLOR = '#94a3b8'

export default function MetriquesPage() {
  const { metrics, loading, error, fetchLoginStats } = useMetrics()
  const [loginPageIndex, setLoginPageIndex] = useState(0)
  const { user } = useAuth()
  const router = useRouter()

  const isAdmin = !!(user?.is_superuser)

  useEffect(() => {
    if (user && !isAdmin) router.replace('/')
  }, [user, isAdmin, router])

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    fetchLoginStats(period)
  }

  if (loading) {
    return (
      <AuthGuard fallback={null} redirectTo="/">
        <LayoutWrapper>
          <PageLoader />
        </LayoutWrapper>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard fallback={null} redirectTo="/">
        <LayoutWrapper>
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <p className="text-red-500 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="text-sm text-gray-400 underline">Réessayer</button>
          </div>
        </LayoutWrapper>
      </AuthGuard>
    )
  }

  if (!metrics) {
    return (
      <AuthGuard fallback={null} redirectTo="/">
        <LayoutWrapper>
          <div className="mx-auto max-w-[1600px] px-6 py-6">
            <Card className="p-12 text-center border border-gray-200 rounded-2xl">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: MAIN_LIGHT }}>
                <BarChart3 className="h-7 w-7" style={{ color: MAIN }} />
              </div>
              <h3 className="text-base font-semibold text-gray-800">Aucune donnée disponible</h3>
              <p className="text-sm text-gray-400 mt-1">Les métriques seront disponibles après les premières connexions</p>
            </Card>
          </div>
        </LayoutWrapper>
      </AuthGuard>
    )
  }

  const dailyChartData = metrics.login_trend_daily.map(item => ({
    date: format(parseISO(item.date), 'dd/MM', { locale: fr }),
    connexions: item.count,
  }))

  const weeklyChartData = metrics.login_trend_weekly.map((item, index) => ({
    semaine: `S${index + 1}`,
    connexions: item.count,
  }))

  const monthlyChartData = metrics.login_trend_monthly.map(item => ({
    mois: format(parseISO(item.month_start), 'MMM yy', { locale: fr }),
    connexions: item.count,
  }))

  const yearlyChartData = metrics.login_trend_yearly?.map(item => ({
    annee: item.year.toString(),
    connexions: item.count,
  })) || []

  const loginPages = [
    { icon: <LogIn className="h-5 w-5" style={{ color: MAIN }} />, label: "Aujourd'hui", value: metrics.daily_logins, sub: metrics.active_users_today },
    { icon: <Calendar className="h-5 w-5" style={{ color: MAIN }} />, label: "Cette semaine", value: metrics.weekly_logins, sub: metrics.active_users_week },
    { icon: <TrendingUp className="h-5 w-5" style={{ color: MAIN }} />, label: "Ce mois", value: metrics.monthly_logins, sub: metrics.active_users_month },
  ]
  const currentLoginPage = loginPages[loginPageIndex]

  const tooltipStyle = {
    backgroundColor: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '12px',
    color: '#374151',
  }

  return (
    <AuthGuard fallback={null} redirectTo="/">
      <LayoutWrapper>
        <div className="mx-auto max-w-[1600px] px-6 py-6 space-y-4">

          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2">

            {/* Connexions (paginated) */}
            <Card className="bg-white border border-gray-200 rounded-2xl hover:shadow-md hover:border-[#344256]/20 transition-all duration-200">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: MAIN_LIGHT }}>
                    {currentLoginPage.icon}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {currentLoginPage.label}
                    </span>
                    <div className="flex gap-0.5">
                      <button onClick={() => setLoginPageIndex(i => (i + 2) % 3)} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <ChevronLeft className="h-3 w-3" />
                      </button>
                      <button onClick={() => setLoginPageIndex(i => (i + 1) % 3)} className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{currentLoginPage.value}</div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{currentLoginPage.sub} utilisateurs actifs</p>
                  <div className="flex gap-1">
                    {loginPages.map((_, i) => (
                      <button key={i} onClick={() => setLoginPageIndex(i)}
                        className="w-1.5 h-1.5 rounded-full transition-colors"
                        style={{ backgroundColor: i === loginPageIndex ? MAIN : '#d1d5db' }}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Durée moyenne */}
            <Card className="bg-white border border-gray-200 rounded-2xl hover:shadow-md hover:border-[#344256]/20 transition-all duration-200">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: MAIN_LIGHT }}>
                  <Clock className="h-5 w-5" style={{ color: MAIN }} />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{metrics.avg_session_duration_minutes} min</div>
                <p className="text-sm text-gray-400">Durée moyenne de session</p>
              </CardContent>
            </Card>

          </div>

          {/* Chart row: Heures de pointe + Activité par jour */}
          <div className="grid gap-4 sm:grid-cols-2">

            <Card className="bg-white border border-gray-200 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: MAIN_LIGHT }}>
                    <BarChart3 className="h-4 w-4" style={{ color: MAIN }} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Heures de Pointe</h3>
                </div>
                <p className="text-xs text-gray-400 mb-4 ml-10">Connexions par heure — 365 derniers jours</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={metrics.hourly_logins} barSize={10}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      formatter={(value: any, _: any, props: any) => {
                        const d = props?.payload
                        return d?.avg_count !== undefined
                          ? [`${d.avg_count.toFixed(1)} moy. / ${d.total_count} total`, 'Connexions']
                          : [value, 'Connexions']
                      }}
                      labelFormatter={(l) => `${l}h`}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="count" fill={CHART_SECONDARY} radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: MAIN_LIGHT }}>
                    <Calendar className="h-4 w-4" style={{ color: MAIN }} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">Activité par Jour</h3>
                </div>
                <p className="text-xs text-gray-400 mb-4 ml-10">365 derniers jours</p>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={metrics.weekday_activity} barSize={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 9, fill: AXIS_COLOR }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => {
                        try { return format(parseISO(v), 'dd/MM', { locale: fr }) } catch { return v }
                      }}
                    />
                    <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip
                      formatter={(value: any) => [value, 'Connexions']}
                      labelFormatter={(l) => {
                        try { return format(parseISO(l), 'EEEE dd MMM yyyy', { locale: fr }) } catch { return l }
                      }}
                      contentStyle={tooltipStyle}
                    />
                    <Bar dataKey="count" fill={CHART_MUTED} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tendances de connexion */}
          <Card className="bg-white border border-gray-200 rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: MAIN_LIGHT }}>
                  <BarChart3 className="h-4 w-4" style={{ color: MAIN }} />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">Tendances de Connexion</h3>
              </div>

              <Tabs defaultValue="daily" className="space-y-4">
                <TabsList className="inline-flex h-8 bg-gray-100 rounded-lg p-0.5 gap-0.5">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((period, idx) => {
                    const labels = ['Quotidien', 'Hebdomadaire', 'Mensuel', 'Annuel']
                    return (
                      <TabsTrigger
                        key={period}
                        value={period}
                        onClick={() => handlePeriodChange(period)}
                        className="h-7 px-3 text-xs rounded-md text-gray-500 data-[state=active]:bg-white data-[state=active]:text-gray-800 data-[state=active]:shadow-sm transition-all"
                      >
                        {labels[idx]}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                <TabsContent value="daily">
                  <p className="text-xs text-gray-400 mb-3">30 derniers jours</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={dailyChartData}>
                      <defs>
                        <linearGradient id="gradDaily" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: AXIS_COLOR }} angle={-45} textAnchor="end" height={55} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip formatter={(v: any) => [v, 'Connexions']} labelFormatter={(l) => `${l}`} contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="connexions" stroke={CHART_PRIMARY} strokeWidth={2} fill="url(#gradDaily)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="weekly">
                  <p className="text-xs text-gray-400 mb-3">12 dernières semaines</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={weeklyChartData} barSize={18}>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                      <XAxis dataKey="semaine" tick={{ fontSize: 10, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip formatter={(v: any) => [v, 'Connexions']} labelFormatter={(l) => `Semaine ${l}`} contentStyle={tooltipStyle} />
                      <Bar dataKey="connexions" fill={CHART_SECONDARY} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="monthly">
                  <p className="text-xs text-gray-400 mb-3">12 derniers mois</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                      <XAxis dataKey="mois" tick={{ fontSize: 10, fill: AXIS_COLOR }} angle={-45} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip formatter={(v: any) => [v, 'Connexions']} contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="connexions" stroke={CHART_PRIMARY} strokeWidth={2} dot={{ fill: CHART_PRIMARY, r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>

                <TabsContent value="yearly">
                  <p className="text-xs text-gray-400 mb-3">5 dernières années</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={yearlyChartData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                      <XAxis dataKey="annee" tick={{ fontSize: 10, fill: AXIS_COLOR }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: AXIS_COLOR }} axisLine={false} tickLine={false} width={28} />
                      <Tooltip formatter={(v: any) => [v, 'Connexions']} labelFormatter={(l) => `Année ${l}`} contentStyle={tooltipStyle} />
                      <Bar dataKey="connexions" fill={CHART_PRIMARY} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

        </div>
      </LayoutWrapper>
    </AuthGuard>
  )
}
