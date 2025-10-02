"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { PublicationDemo } from "@/components/publication-demo"

export default function DemoPublicationsPage() {
  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto">
        <PublicationDemo />
      </div>
    </LayoutWrapper>
  )
}

