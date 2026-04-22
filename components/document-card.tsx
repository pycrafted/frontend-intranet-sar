"use client"

import type { FileItem } from "./documents-page"
import { MoreVertical, Folder, FileText, FileImage, Film, Trash2, Eye, Edit3, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/useAuth"

type DocumentCardProps = {
  item: FileItem
  onDelete: (id: string) => void
  onFolderClick?: (folderId: number) => void
  onView?: (id: string) => void
  onRename?: (id: string, currentName: string) => void
  onDownload?: (id: string) => void
}

export function DocumentCard({ item, onDelete, onFolderClick, onView, onRename, onDownload }: DocumentCardProps) {
  const { isAuthenticated } = useAuth()
  const getFileIcon = () => {
    if (item.type === "folder") {
      return <Folder className="h-12 w-12 text-white" />
    }

    if (item.is_image || item.media_type === 'image') {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded bg-white/20 text-purple-300">
          <FileImage className="h-7 w-7" />
        </div>
      )
    }
    if (item.is_video || item.media_type === 'video') {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded bg-white/20 text-blue-300">
          <Film className="h-7 w-7" />
        </div>
      )
    }
    return (
      <div className="flex h-12 w-12 items-center justify-center rounded bg-white/20 text-white">
        <FileText className="h-7 w-7" />
      </div>
    )
  }

  const handleClick = () => {
    if (item.type === "folder" && onFolderClick) {
      // Extraire l'ID du dossier depuis l'ID de l'item (format: "folder-123")
      const folderId = parseInt(item.id.replace('folder-', ''))
      onFolderClick(folderId)
    } else if (item.type === "file" && onView) {
      // Visualiser directement le document au clic
      onView(item.id)
    }
  }

  return (
    <div 
      className="group relative rounded-lg border border-border p-4 transition-all hover:border-primary hover:shadow-md cursor-pointer"
      style={{ backgroundColor: "#344256" }}
      onClick={handleClick}
    >
      <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-white hover:bg-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            {item.type !== "folder" && onView && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(item.id); }}>
                <Eye className="mr-2 h-4 w-4" />
                Visualiser
              </DropdownMenuItem>
            )}
            {item.type !== "folder" && onDownload && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDownload(item.id); }}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger
              </DropdownMenuItem>
            )}
            {isAuthenticated && onRename && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(item.id, item.name); }}>
                <Edit3 className="mr-2 h-4 w-4" />
                Renommer
              </DropdownMenuItem>
            )}
            {isAuthenticated && (
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col items-center gap-3">
        {getFileIcon()}
        <div className="w-full text-center">
          <p className="truncate text-sm font-medium text-white">{item.name}</p>
          <p className="mt-1 text-xs text-white/80">{item.type === "folder" ? "Dossier" : item.size}</p>
        </div>
      </div>
    </div>
  )
}
