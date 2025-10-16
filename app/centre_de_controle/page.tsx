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

        {/* Interface d'administration avec onglets */}
        <div className="space-y-6 stagger-animation">
          <ControlCenterTabs activeSection={activeSection} />
        </div>
      </div>
    </LayoutWrapper>
  )
}
