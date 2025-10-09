"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ComingSoonCard } from "@/components/coming-soon-card"
import { BarChart3 } from "lucide-react"

export default function MetriquesPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Métriques et Analytics</h1>
          <p className="text-muted-foreground">Tableaux de bord et analyses de performance</p>
        </div>

        {/* Coming Soon Card */}
        <ComingSoonCard 
          icon={BarChart3}
          title="Métriques et Analytics"
          description="Tableaux de bord, KPIs et analyses avancées - Cette fonctionnalité sera bientôt disponible"
        />
      </div>
    </LayoutWrapper>
  )
}
