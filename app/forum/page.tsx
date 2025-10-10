"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { ComingSoonCard } from "@/components/coming-soon-card"
import { MessageCircle } from "lucide-react"

export default function ForumPage() {
  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* Coming Soon Card */}
        <ComingSoonCard 
          icon={MessageCircle}
          title="Forum de discussion"
          description="Échanges et discussions entre collègues - Cette fonctionnalité sera bientôt disponible"
        />
      </div>
    </LayoutWrapper>
  )
}
