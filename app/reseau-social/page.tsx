"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ComingSoonCard } from "@/components/coming-soon-card"
import { MessageSquare } from "lucide-react"

export default function ReseauSocialPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Réseau social d'entreprise</h1>
          <p className="text-muted-foreground">Échangez et collaborez avec vos collègues</p>
        </div>

        {/* Coming Soon Card */}
        <ComingSoonCard 
          icon={MessageSquare}
          title="Réseau social d'entreprise"
          description="Chat, forum et collaboration - Cette fonctionnalité sera bientôt disponible"
        />
      </div>
    </LayoutWrapper>
  )
}
