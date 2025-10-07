"use client"

import { Plus, Upload, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type DocumentsToolbarProps = {
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  onCreateFolder: () => void
  onUpload: () => void
}

export function DocumentsToolbar({ viewMode, onViewModeChange, onCreateFolder, onUpload }: DocumentsToolbarProps) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-5 w-5" />
              Nouveau
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={onCreateFolder}>
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              Nouveau dossier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onUpload}>
              <Upload className="mr-2 h-5 w-5" />
              Importer des fichiers
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-1 rounded-lg p-1" style={{ backgroundColor: '#f1f2f5' }}>
        <Button
          variant={viewMode === "grid" ? "default" : "ghost"}
          size="icon"
          className={
            viewMode === "grid" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }
          onClick={() => onViewModeChange("grid")}
        >
          <LayoutGrid className="h-5 w-5" />
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "ghost"}
          size="icon"
          className={
            viewMode === "list" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }
          onClick={() => onViewModeChange("list")}
        >
          <List className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
