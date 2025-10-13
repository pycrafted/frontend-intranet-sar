"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ComingSoonCard } from "@/components/coming-soon-card"
import { Shield } from "lucide-react"

export default function SecuritePage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Coming Soon Card */}
        <ComingSoonCard 
          icon={Shield}
          title="Sécurité du Travail"
          description="Gestion de la sécurité, rapports d'incidents et formation - Cette fonctionnalité sera bientôt disponible"
        />
      </div>
    </LayoutWrapper>
  )
}


