"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { DraggableDashboard } from "@/components/dashboard/draggable-dashboard"

export default function HomePage() {
  return (
    <LayoutWrapper>
      <DraggableDashboard />
    </LayoutWrapper>
  )
}