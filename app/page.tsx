"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { DraggableDashboard } from "@/components/dashboard/draggable-dashboard"
import { User, Building, Calendar as CalendarIcon, Phone } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { authUtils } from "@/lib/auth-api"
import { } from "react"

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
        {/* Hero Section Optimisée pour Edge - Design principal - Visible uniquement si connecté */}
        {isAuthenticated && user && (
          <div className="gradient-fallback bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-3 sm:p-4 md:p-6 lg:p-8 text-white edge-optimized-hero">
            <div className="w-full">
              {/* Sur petits écrans : afficher uniquement la date */}
              <div className="flex items-center justify-center gap-3 bg-white/10 rounded-md p-3 sm:hidden">
                <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                <div className="min-w-0 text-center">
                  <p className="text-[11px] uppercase opacity-80">Date</p>
                  <p className="text-sm font-semibold">{formattedDate}</p>
                </div>
              </div>
              
              {/* Sur écrans moyens et grands : afficher toutes les informations */}
              <div className="hidden sm:flex flex-wrap sm:flex-nowrap gap-3 sm:gap-4 md:gap-5 overflow-x-auto max-w-full">
                <div className="flex items-center gap-3 bg-white/10 rounded-md p-3 shrink-0 sm:w-[240px] md:w-auto md:flex-1 min-w-0">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase opacity-80">Nom complet</p>
                    <p className="text-sm font-semibold truncate">{authUtils.getFullName(user)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-md p-3 shrink-0 sm:w-[240px] md:w-auto md:flex-1 min-w-0">
                  <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase opacity-80">Date</p>
                    <p className="text-sm font-semibold truncate">{formattedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-md p-3 shrink-0 sm:w-[240px] md:w-auto md:flex-1 min-w-0">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase opacity-80">Poste</p>
                    <p className="text-sm font-semibold truncate">{user?.position || (user?.is_superuser ? 'Administrateur' : user?.is_staff ? 'Staff' : 'Employé')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-md p-3 shrink-0 sm:w-[240px] md:w-auto md:flex-1 min-w-0">
                  <Building className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase opacity-80">Département</p>
                    <p className="text-sm font-semibold truncate">{typeof user.department === 'object' && user.department && 'name' in user.department ? (user.department as any).name : (typeof user.department === 'string' ? user.department : 'Non renseigné')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 rounded-md p-3 shrink-0 sm:w-[240px] md:w-auto md:flex-1 min-w-0">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase opacity-80">Poste téléphonique</p>
                    <p className="text-sm font-semibold truncate">{user?.office_phone || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Draggable */}
        <DraggableDashboard />
      </div>
    </LayoutWrapper>
  )
}