"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, TrendingUp, User, Bell } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  userName?: string
  userRole?: string
}

export function DashboardLayout({ children, userName = "Ahmed Mbaye", userRole = "Directeur IT" }: DashboardLayoutProps) {
  const currentDate = new Date()
  const formattedDate = currentDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-8">
      {/* Section d'accueil personnalisée */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Bonjour, {userName.split(' ')[0]} ! 👋
            </h1>
            <p className="text-xl opacity-90 mb-4">
              Bienvenue sur votre tableau de bord de l'application intranet de la SAR
            </p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{userRole}</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span>1,247 employés connectés</span>
              </div>
            </div>
          </div>
          
          {/* Notifications et actions rapides */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm opacity-90">Notifications</div>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <Badge className="bg-red-500 text-white">3</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des widgets du dashboard */}
      <div className="space-y-6">
        {/* Première ligne - Calendrier et Compte à rebours */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96">
            {children}
          </div>
        </div>

        {/* Deuxième ligne - Sécurité */}
        <div className="grid grid-cols-1 gap-6">
          <div className="h-80">
            {/* Le widget sécurité sera inséré ici */}
          </div>
        </div>

        {/* Troisième ligne - Actualités */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96">
            {/* Les widgets actualités seront insérés ici */}
          </div>
        </div>
      </div>
    </div>
  )
}

