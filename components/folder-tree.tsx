"use client"

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown, 
  MoreVertical,
  FileText,
  Trash2,
  Edit,
  Plus
} from 'lucide-react'
import { DocumentFolderTree } from '@/hooks/useDocuments'

interface FolderTreeProps {
  folders: DocumentFolderTree[]
  activeFolder?: number | null
  onFolderClick?: (folderId: number | null) => void
  onFolderCreate?: (parentId: number | null) => void
  onFolderEdit?: (folderId: number) => void
  onFolderDelete?: (folderId: number) => void
  expandedFolders?: Set<number>
  onToggleExpand?: (folderId: number) => void
}

const getFolderIcon = (iconName: string, isExpanded: boolean) => {
  switch (iconName) {
    case 'folder-open':
      return FolderOpen
    case 'folder-plus':
      return Plus
    case 'archive':
      return Folder
    case 'briefcase':
      return Folder
    case 'book':
      return Folder
    case 'file-text':
      return FileText
    case 'folder-download':
      return Folder
    default:
      return isExpanded ? FolderOpen : Folder
  }
}

export function FolderTree({ 
  folders, 
  activeFolder, 
  onFolderClick,
  onFolderCreate,
  onFolderEdit,
  onFolderDelete,
  expandedFolders = new Set(),
  onToggleExpand
}: FolderTreeProps) {
  const [hoveredFolder, setHoveredFolder] = useState<number | null>(null)

  const renderFolder = (folder: DocumentFolderTree, depth = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const isActive = activeFolder === folder.id
    const isHovered = hoveredFolder === folder.id
    const Icon = getFolderIcon(folder.icon, isExpanded)
    const hasChildren = folder.children && folder.children.length > 0

    return (
      <div key={folder.id} className="select-none">
        <div
          className={cn(
            "group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer",
            isActive
              ? "bg-blue-50 text-blue-700 shadow-sm"
              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
          )}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={() => onFolderClick?.(folder.id)}
          onMouseEnter={() => setHoveredFolder(folder.id)}
          onMouseLeave={() => setHoveredFolder(null)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleExpand?.(folder.id)
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            ) : (
              <div className="w-4 h-4" />
            )}
            
            <Icon 
              className={cn(
                "h-4 w-4 transition-colors",
                isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
              )}
              style={{ color: folder.color }}
            />
            
            <span className="truncate">{folder.name}</span>
            
            {folder.documents_count > 0 && (
              <Badge 
                variant={isActive ? "secondary" : "outline"} 
                className="h-5 px-2 text-xs"
              >
                {folder.documents_count}
              </Badge>
            )}
          </div>

          {(isHovered || isActive) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onFolderCreate?.(folder.id)
                }}
                title="Créer un sous-dossier"
              >
                <Plus className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  onFolderEdit?.(folder.id)
                }}
                title="Modifier le dossier"
              >
                <Edit className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation()
                  onFolderDelete?.(folder.id)
                }}
                title="Supprimer le dossier"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {folder.children.map(child => renderFolder(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {folders.map(folder => renderFolder(folder))}
    </div>
  )
}
