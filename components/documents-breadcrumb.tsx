"use client"

import { ChevronRight, Home } from "lucide-react"
import { Button } from "@/components/ui/button"

type BreadcrumbItem = {
  id: number
  name: string
}

type DocumentsBreadcrumbProps = {
  currentPath: BreadcrumbItem[]
  onBreadcrumbClick: (folderId: number | null) => void
}

export function DocumentsBreadcrumb({ currentPath, onBreadcrumbClick }: DocumentsBreadcrumbProps) {
  if (currentPath.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Home className="h-4 w-4" />
        <span>Racine</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-muted-foreground hover:text-foreground"
        onClick={() => onBreadcrumbClick(null)}
      >
        <Home className="h-4 w-4 mr-1" />
        Racine
      </Button>
      
      {currentPath.map((folder, index) => (
        <div key={folder.id} className="flex items-center gap-2">
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground"
            onClick={() => onBreadcrumbClick(folder.id)}
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  )
}
