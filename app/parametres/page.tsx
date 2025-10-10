"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ComingSoonCard } from "@/components/coming-soon-card"
import { Settings } from "lucide-react"

export default function ParametresPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Coming Soon Card */}
        <ComingSoonCard 
          icon={Settings}
          title="Paramètres"
          description="Configuration système et préférences utilisateur - Cette fonctionnalité sera bientôt disponible"
        />
      </div>
    </LayoutWrapper>
  )
}
