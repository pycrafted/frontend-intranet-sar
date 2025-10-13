"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { DraggableDashboard } from "@/components/dashboard/draggable-dashboard"
import { User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { authUtils } from "@/lib/auth-api"

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Afficher un loading si l'authentification est en cours
  if (isLoading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Hero Section Optimisée pour Edge - Design principal */}
        <div className="gradient-fallback bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 sm:p-6 lg:p-8 text-white edge-optimized-hero">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 break-words edge-hero-title">
                Bonjour, {user?.username || user?.first_name || 'Utilisateur'} ! 👋
              </h1>
              <p className="text-sm sm:text-base opacity-90 mb-3 break-words edge-hero-subtitle">
                Bienvenue sur votre tableau de bord de l'application intranet de la SAR
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm edge-hero-meta">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{formattedDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="font-medium break-words">
                    {user?.position || (user?.is_superuser ? 'Administrateur' : user?.is_staff ? 'Staff' : 'Employé')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs opacity-75 break-words">Matricule: {user?.matricule || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Draggable */}
        <DraggableDashboard />
      </div>
    </LayoutWrapper>
  )
}