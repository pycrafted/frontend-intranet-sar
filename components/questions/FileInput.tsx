"use client"

import { Upload, File, Image, FileText, X, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState, useRef } from "react"

interface Question {
  id: number
  text: string
  type: string
  type_display: string
  is_required: boolean
  order: number
  options: string[]
  validation_rules?: Record<string, any>
}

interface FileInputProps {
  question: Question
  value?: File[]
  onChange: (value: File[]) => void
  error?: string
}

export function FileInput({ question, value = [], onChange, error }: FileInputProps) {
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    const type = file.type
    if (type.startsWith('image/')) {
      return <Image className="h-4 w-4 text-green-500" />
    } else if (type.includes('pdf') || type.includes('document')) {
      return <FileText className="h-4 w-4 text-red-500" />
    } else {
      return <File className="h-4 w-4 text-blue-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File) => {
    const maxSize = question.validation_rules?.max_size || 10 * 1024 * 1024 // 10MB par défaut
    const allowedTypes = question.validation_rules?.allowed_types || [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]

    if (file.size > maxSize) {
      return `Le fichier "${file.name}" est trop volumineux (max: ${formatFileSize(maxSize)})`
    }

    if (!allowedTypes.includes(file.type)) {
      return `Le type de fichier "${file.type}" n'est pas autorisé`
    }

    return null
  }

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const validFiles: File[] = []
    const errors: string[] = []

    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    if (errors.length > 0) {
      console.warn('Erreurs de validation des fichiers:', errors)
    }

    onChange([...value, ...validFiles])
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index)
    onChange(newFiles)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const getAcceptedTypes = () => {
    const allowedTypes = question.validation_rules?.allowed_types || [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    return allowedTypes.join(',')
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-cyan-50 p-3 rounded-lg border border-cyan-200">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="h-4 w-4 text-cyan-600" />
          <span className="font-medium text-cyan-800">Instructions :</span>
        </div>
        <p>Glissez-déposez vos fichiers ou cliquez pour les sélectionner. Formats acceptés : images, PDF, documents Word/Excel.</p>
      </div>

      {/* Zone de dépôt */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-cyan-400 bg-cyan-50 scale-105' 
            : 'border-cyan-200 hover:border-cyan-300 hover:bg-cyan-50'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAcceptedTypes()}
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
            <Upload className="h-6 w-6 text-cyan-600" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-700">
              {dragActive ? 'Déposez vos fichiers ici' : 'Cliquez ou glissez-déposez vos fichiers'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Images, PDF, Word, Excel, etc.
            </p>
          </div>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-cyan-300 text-cyan-700 hover:bg-cyan-50"
          >
            <Upload className="h-4 w-4 mr-2" />
            Sélectionner des fichiers
          </Button>
        </div>
      </div>

      {/* Liste des fichiers sélectionnés */}
      {value.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Fichiers sélectionnés ({value.length})
          </Label>
          <div className="space-y-2">
            {value.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  )
}























