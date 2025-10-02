"use client"

import { useState } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { StandardLoader } from "@/components/ui/standard-loader"
import { ControlCenterTabs } from "@/components/admin/control-center-tabs"
import { ControlCenterSidebar } from "@/components/control-center-sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  const [activeSection, setActiveSection] = useState("users")

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
        onSectionChange: setActiveSection
      }}
    >
      <div className="w-full space-y-6">
        {/* Header avec style inspiré de la page actualités */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-sm"></div>
            <h3 className="text-lg font-semibold text-gray-900">Centre de Contrôle</h3>
          </div>
          
        </div>

        {/* Interface d'administration avec onglets */}
        <div className="space-y-6 stagger-animation">
          <ControlCenterTabs activeSection={activeSection} />
        </div>
      </div>
    </LayoutWrapper>
  )
}
