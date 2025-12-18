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
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files))
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files))
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
    setIsDragging(false)
    onOpenChange(false)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[90vw] md:max-w-[525px] max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg">Importer des fichiers</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Sélectionnez les fichiers à importer dans vos documents.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4 space-y-4 custom-scrollbar" style={{ minHeight: 0 }}>
          <div
            className={`flex min-h-[150px] sm:min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 sm:gap-4 rounded-lg border-2 border-dashed bg-secondary p-4 sm:p-6 md:p-8 transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary'
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-muted-foreground" />
            <div className="text-center px-2">
              <p className="text-xs sm:text-sm font-medium text-foreground">
                Cliquez pour sélectionner des fichiers
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                ou glissez-déposez vos fichiers ici
              </p>
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-foreground">
                Fichiers sélectionnés ({selectedFiles.length})
              </p>
              <div className="max-h-[200px] sm:max-h-[250px] space-y-2 overflow-y-auto custom-scrollbar">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 sm:gap-3 rounded-lg border border-border bg-card p-2 sm:p-3 min-w-0"
                  >
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p 
                        className="text-xs sm:text-sm font-medium text-foreground truncate" 
                        title={file.name}
                        style={{ 
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          maxWidth: '100%'
                        }}
                      >
                        {file.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveFile(index)
                      }}
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 border-t flex-shrink-0 gap-2 sm:gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
            className="text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10"
          >
            Annuler
          </Button>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={selectedFiles.length === 0}
            className="text-xs sm:text-sm px-3 sm:px-4 h-8 sm:h-10"
          >
            Importer ({selectedFiles.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


