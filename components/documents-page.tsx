"use client"

import { useState } from "react"
import { DocumentsToolbar } from "./documents-toolbar"
import { DocumentsGrid } from "./documents-grid"
import { CreateFolderDialog } from "./create-folder-dialog"
import { UploadDialog } from "./upload-dialog"

export type FileItem = {
  id: string
  name: string
  type: "folder" | "file"
  fileType?: string
  size?: string
  modifiedDate: string
  owner: string
}

export function DocumentsPage() {
  const [items, setItems] = useState<FileItem[]>([
    {
      id: "1",
      name: "Projets 2025",
      type: "folder",
      modifiedDate: "15 janv. 2025",
      owner: "Moi",
    },
    {
      id: "2",
      name: "Documents RH",
      type: "folder",
      modifiedDate: "10 janv. 2025",
      owner: "Moi",
    },
    {
      id: "3",
      name: "Rapport Q4.pdf",
      type: "file",
      fileType: "pdf",
      size: "2.4 MB",
      modifiedDate: "5 janv. 2025",
      owner: "Moi",
    },
    {
      id: "4",
      name: "Présentation.pptx",
      type: "file",
      fileType: "pptx",
      size: "5.1 MB",
      modifiedDate: "3 janv. 2025",
      owner: "Moi",
    },
  ])

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const handleCreateFolder = (name: string) => {
    const newFolder: FileItem = {
      id: Date.now().toString(),
      name,
      type: "folder",
      modifiedDate: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      owner: "Moi",
    }
    setItems([newFolder, ...items])
  }

  const handleUploadFiles = (files: File[]) => {
    const newFiles: FileItem[] = files.map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      type: "file",
      fileType: file.name.split(".").pop() || "file",
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      modifiedDate: new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      owner: "Moi",
    }))
    setItems([...newFiles, ...items])
  }

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-[1600px] px-6 py-6">
        <DocumentsToolbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onCreateFolder={() => setIsCreateFolderOpen(true)}
          onUpload={() => setIsUploadOpen(true)}
        />
        <DocumentsGrid items={items} viewMode={viewMode} onDelete={handleDelete} />
      </main>

      <CreateFolderDialog
        open={isCreateFolderOpen}
        onOpenChange={setIsCreateFolderOpen}
        onCreateFolder={handleCreateFolder}
      />

      <UploadDialog open={isUploadOpen} onOpenChange={setIsUploadOpen} onUpload={handleUploadFiles} />
    </div>
  )
}
