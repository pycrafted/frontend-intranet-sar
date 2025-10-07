"use client"

import { useState, useMemo } from "react"
import type { FileItem } from "./documents-page"
import { MoreVertical, Folder, FileText, Trash2, Eye, Edit3, Download, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type DocumentsDataTableProps = {
  items: FileItem[]
  onDelete: (id: string) => void
  onFolderClick?: (folderId: number) => void
  onView?: (id: string) => void
  onRename?: (id: string, currentName: string) => void
  onDownload?: (id: string) => void
}

export function DocumentsDataTable({ 
  items, 
  onDelete, 
  onFolderClick, 
  onView, 
  onRename, 
  onDownload 
}: DocumentsDataTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)

  const getFileIcon = (item: FileItem) => {
    if (item.type === "folder") {
      return <Folder className="h-5 w-5 text-primary" />
    }

    const iconClass = "h-5 w-5"
    switch (item.fileType) {
      case "pdf":
        return <FileText className={`${iconClass} text-red-600`} />
      case "pptx":
      case "ppt":
        return <FileText className={`${iconClass} text-orange-600`} />
      case "docx":
      case "doc":
        return <FileText className={`${iconClass} text-blue-600`} />
      case "xlsx":
      case "xls":
        return <FileText className={`${iconClass} text-green-600`} />
      default:
        return <FileText className={`${iconClass} text-muted-foreground`} />
    }
  }

  const handleClick = (item: FileItem) => {
    if (item.type === "folder" && onFolderClick) {
      const folderId = parseInt(item.id.replace('folder-', ''))
      onFolderClick(folderId)
    }
  }

  const parseSize = (sizeStr: string): number => {
    if (!sizeStr || sizeStr === '—') return 0
    const match = sizeStr.match(/(\d+\.?\d*)\s*(B|KB|MB|GB)/i)
    if (!match) return 0
    const value = parseFloat(match[1])
    const unit = match[2].toUpperCase()
    
    switch (unit) {
      case 'B': return value
      case 'KB': return value * 1024
      case 'MB': return value * 1024 * 1024
      case 'GB': return value * 1024 * 1024 * 1024
      default: return value
    }
  }

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  // Tri des données
  const sortedItems = useMemo(() => {
    const sorted = [...items]

    if (sortConfig) {
      sorted.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortConfig.key) {
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case 'owner':
            aValue = a.owner.toLowerCase()
            bValue = b.owner.toLowerCase()
            break
          case 'modified':
            aValue = new Date(a.modifiedDate)
            bValue = new Date(b.modifiedDate)
            break
          case 'size':
            aValue = parseSize(a.size || '0')
            bValue = parseSize(b.size || '0')
            break
          default:
            return 0
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    return sorted
  }, [items, sortConfig])

  if (items.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-card p-12">
        <svg className="h-16 w-16 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">Aucun document</h3>
          <p className="text-sm text-muted-foreground">Commencez par créer un dossier ou importer des fichiers</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tableau avec tri */}
      <div className="rounded-lg border border-border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th 
                className="px-6 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-2">
                  Nom
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('owner')}
              >
                <div className="flex items-center gap-2">
                  Propriétaire
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('modified')}
              >
                <div className="flex items-center gap-2">
                  Modifié
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-sm font-medium text-muted-foreground cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('size')}
              >
                <div className="flex items-center gap-2">
                  Taille
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => (
              <tr 
                key={item.id} 
                className="border-b border-border hover:bg-secondary cursor-pointer"
                onClick={() => handleClick(item)}
              >
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    {getFileIcon(item)}
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-sm text-muted-foreground">{item.owner}</td>
                <td className="px-6 py-3 text-sm text-muted-foreground">{item.modifiedDate}</td>
                <td className="px-6 py-3 text-sm text-muted-foreground">
                  {item.type === "folder" ? "—" : item.size}
                </td>
                <td className="px-6 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.type !== "folder" && onView && (
                        <DropdownMenuItem onClick={() => onView(item.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualiser
                        </DropdownMenuItem>
                      )}
                      {item.type !== "folder" && onDownload && (
                        <DropdownMenuItem onClick={() => onDownload(item.id)}>
                          <Download className="mr-2 h-4 w-4" />
                          Télécharger
                        </DropdownMenuItem>
                      )}
                      {onRename && (
                        <DropdownMenuItem onClick={() => onRename(item.id, item.name)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Renommer
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}
