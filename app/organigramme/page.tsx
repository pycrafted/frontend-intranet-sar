"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import WorkflowBuilder from "@/components/workflow-builder"

export default function OrganigrammePage() {
  return (
    <LayoutWrapper>
      <div className="min-h-screen" style={{ backgroundColor: '#e5e7eb' }}>
        <WorkflowBuilder />
      </div>
    </LayoutWrapper>
  )
}
