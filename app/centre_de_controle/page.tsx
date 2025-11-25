"use client"

import { useState, useEffect } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { StandardLoader } from "@/components/ui/standard-loader"
import { ControlCenterTabs } from "@/components/admin/control-center-tabs"
import { ControlCenterSidebar } from "@/components/control-center-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MobileControlCenterMenu } from "@/components/mobile-control-center-menu"
import { 
  Shield, 
  FileText, 
  Users, 
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Database,
  Activity
} from "lucide-react"

export default function CentreDeControlePage() {
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState("employees")

  // Persistance de l'état actif
  useEffect(() => {
    // Récupérer l'état sauvegardé au chargement
    const savedSection = localStorage.getItem('control-center-active-section')
    if (savedSection) {
      console.log('🔄 [CONTROL_CENTER] Restauration de l\'état:', savedSection)
      setActiveSection(savedSection)
    } else {
      console.log('🔄 [CONTROL_CENTER] Aucun état sauvegardé, utilisation par défaut: employees (Annuaire)')
      console.log('📋 [CONTROL_CENTER] Section par défaut: Annuaire des employés')
    }
  }, [])

  // Sauvegarder l'état quand il change
  const handleSectionChange = (section: string) => {
    console.log('💾 [CONTROL_CENTER] Sauvegarde de l\'état:', section)
    setActiveSection(section)
    localStorage.setItem('control-center-active-section', section)
  }

  // Gestion des erreurs
  if (error) {
    return (
      <LayoutWrapper>
        <StandardLoader 
          error={error}
          showRetry={true}
          onRetry={() => window.location.reload()}
        />
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper 
      sidebarProps={{
        activeSection,
        onSectionChange: handleSectionChange
      }}
    >
      <div className="w-full space-y-6">
        {/* Menu mobile - rendu dans la page pour être dans le bon contexte */}
        <MobileControlCenterMenu 
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />

        {/* Interface d'administration avec onglets */}
        <div className="space-y-6 stagger-animation">
          <ControlCenterTabs activeSection={activeSection} />
        </div>
      </div>
    </LayoutWrapper>
  )
}
