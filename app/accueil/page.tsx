"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { DraggableDashboard } from "@/components/dashboard/draggable-dashboard"
import { User } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { authUtils } from "@/lib/auth-api"

export default function AccueilPage() {
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
      <div className="space-y-8">
        {/* Hero Section Personnalisée */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                Bonjour, {user?.username || user?.first_name || 'Utilisateur'} ! 👋
              </h1>
              <p className="text-base opacity-90 mb-3">
                Bienvenue sur votre tableau de bord de l'application intranet de la SAR
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{formattedDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">
                    {user?.position || (user?.is_superuser ? 'Administrateur' : user?.is_staff ? 'Staff' : 'Employé')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs opacity-75">Matricule: {user?.matricule || 'N/A'}</span>
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
