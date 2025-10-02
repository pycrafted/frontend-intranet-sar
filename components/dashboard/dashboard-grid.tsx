"use client"

import { ReactNode } from "react"

interface DashboardGridProps {
  children: ReactNode
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="min-h-[calc(100vh-12rem)]">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {children}
      </div>
    </div>
  )
}

interface DashboardColumnProps {
  children: ReactNode
  className?: string
}

export function DashboardColumn({ children, className = "" }: DashboardColumnProps) {
  return (
    <div className={`xl:col-span-4 space-y-4 ${className}`}>
      {children}
    </div>
  )
}

interface DashboardWidgetProps {
  children: ReactNode
  className?: string
}

export function DashboardWidget({ children, className = "" }: DashboardWidgetProps) {
  return (
    <div className={`h-[28rem] ${className}`}>
      {children}
    </div>
  )
}
