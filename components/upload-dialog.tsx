"use client"

import type React from "react"

import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

type UploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (files: File[]) => void
}

export function UploadDialog({ open, onOpenChange, onUpload }: UploadDialogProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles)
      setSelectedFiles([])
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setSelectedFiles([])
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Importer des fichiers</DialogTitle>
          <DialogDescription>Sélectionnez les fichiers à importer dans vos documents.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div
            className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-border bg-secondary p-8 transition-colors hover:border-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Cliquez pour sélectionner des fichiers</p>
              <p className="text-xs text-muted-foreground">ou glissez-déposez vos fichiers ici</p>
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Fichiers sélectionnés ({selectedFiles.length})</p>
              <div className="max-h-[150px] space-y-2 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <div className="flex-1 truncate">
                      <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile(index)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={selectedFiles.length === 0}>
            Importer ({selectedFiles.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
