import type { FileItem } from "./documents-page"
import { DocumentCard } from "./document-card"
import { DocumentListItem } from "./document-list-item"
import { DocumentsDataTable } from "./documents-datatable"

type DocumentsGridProps = {
  items: FileItem[]
  viewMode: "grid" | "list"
  onDelete: (id: string) => void
  onFolderClick?: (folderId: number) => void
  onView?: (id: string) => void
  onRename?: (id: string, currentName: string) => void
  onDownload?: (id: string) => void
}

export function DocumentsGrid({ items, viewMode, onDelete, onFolderClick, onView, onRename, onDownload }: DocumentsGridProps) {
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

  if (viewMode === "list") {
    return (
      <DocumentsDataTable 
        items={items} 
        onDelete={onDelete} 
        onFolderClick={onFolderClick} 
        onView={onView} 
        onRename={onRename} 
        onDownload={onDownload} 
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <DocumentCard key={item.id} item={item} onDelete={onDelete} onFolderClick={onFolderClick} onView={onView} onRename={onRename} onDownload={onDownload} />
      ))}
    </div>
  )
}
