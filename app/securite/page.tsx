"use client"

import { useState, useRef } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { VideoPlayer } from "@/components/security/video-player"
import { QuizModal } from "@/components/security/quiz-modal"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSecurity, SecurityDocument } from "@/hooks/useSecurity"
import { useSecurityVideos, SecurityVideo } from "@/hooks/useSecurityVideos"
import { useAuth } from "@/hooks/useAuth"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { X, FileText, Image as ImageIcon, Play, Plus, Trash2, Upload, Loader2, Video, Download } from "lucide-react"
import { StandardLoader } from "@/components/ui/standard-loader"
import { cn } from "@/lib/utils"

// ── Modal upload document ──────────────────────────────────────────────────────

function UploadModal({ open, onClose, onUploaded }: {
  open: boolean
  onClose: () => void
  onUploaded: () => void
}) {
  const { uploadDocument } = useSecurity()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => { setTitle(''); setDescription(''); setFile(null); setError(null); setSaving(false) }
  const handleClose = () => { reset(); onClose() }

  const handleFile = (f: File) => {
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) return
    setSaving(true); setError(null)
    const result = await uploadDocument({ title: title.trim(), description: description.trim() || undefined, file })
    setSaving(false)
    if (result?.success) { onUploaded(); handleClose() }
    else setError(result?.error ?? 'Erreur lors de l\'upload')
  }

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(1)} Ko` : `${(b / 1048576).toFixed(1)} Mo`

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent style={{ width: '500px', maxWidth: 'calc(100vw - 2rem)', maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Upload className="h-4 w-4 text-white" />
            </div>
            Ajouter un document de sécurité
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            className={cn("border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
              dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/40")}
          >
            {file ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-800 truncate max-w-[280px]">{file.name}</span>
                </div>
                <p className="text-xs text-gray-500">{fmt(file.size)}</p>
                <p className="text-xs text-blue-600 underline">Changer le fichier</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">Glissez un fichier ou <span className="text-blue-600 underline">parcourir</span></p>
                <p className="text-xs text-gray-400">PDF, JPG, PNG, GIF, WEBP — max 50 Mo</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Titre *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex : Procédure d'évacuation"
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description <span className="text-gray-400 normal-case">(optionnelle)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Courte description…" rows={2}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-colors resize-none" />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={saving || !file || !title.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
              {saving ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Upload…</> : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Modal upload vidéo ────────────────────────────────────────────────────────

function VideoUploadModal({ open, onClose, onSaved }: {
  open: boolean
  onClose: () => void
  onSaved: () => void
}) {
  const { uploadVideo } = useSecurityVideos()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => { setTitle(''); setDescription(''); setFile(null); setError(null); setSaving(false) }
  const handleClose = () => { reset(); onClose() }

  const handleFile = (f: File) => {
    setFile(f)
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !title.trim()) return
    setSaving(true); setError(null)
    const result = await uploadVideo({ title: title.trim(), file, description: description.trim() || undefined })
    setSaving(false)
    if (result.success) { onSaved(); handleClose() }
    else setError(result.error ?? 'Erreur lors de l\'upload')
  }

  const fmt = (b: number) => b < 1048576 ? `${(b / 1024).toFixed(1)} Ko` : `${(b / 1048576).toFixed(1)} Mo`

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent style={{ width: '500px', maxWidth: 'calc(100vw - 2rem)', maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg">
              <Video className="h-4 w-4 text-white" />
            </div>
            Ajouter une vidéo
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            className={cn("border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
              dragOver ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-red-400 hover:bg-red-50/40")}
          >
            {file ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <Video className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-800 truncate max-w-[280px]">{file.name}</span>
                </div>
                <p className="text-xs text-gray-500">{fmt(file.size)}</p>
                <p className="text-xs text-red-600 underline">Changer le fichier</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Video className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">Glissez une vidéo ou <span className="text-red-600 underline">parcourir</span></p>
                <p className="text-xs text-gray-400">MP4, WebM, OGG, MOV, AVI, MKV — max 500 Mo</p>
              </div>
            )}
            <input ref={inputRef} type="file" accept=".mp4,.webm,.ogg,.mov,.avi,.mkv,video/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Titre *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex : Formation Sécurité"
              className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition-colors" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description <span className="text-gray-400 normal-case">(optionnelle)</span></label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Courte description…" rows={2}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition-colors resize-none" />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={saving || !file || !title.trim()}
              className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
              {saving ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Enregistrement…</> : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ── Page principale ────────────────────────────────────────────────────────────

export default function SecuritePage() {
  const confirm = useConfirm()
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<SecurityDocument | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null)
  const [deletingVideoId, setDeletingVideoId] = useState<number | null>(null)

  const { documents, isLoading: docsLoading, error: docsError, fetchDocuments, deleteDocument } = useSecurity()
  const { videos, isLoading: vidsLoading, error: vidsError, fetchVideos, deleteVideo } = useSecurityVideos()
  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)

  const isLoading = docsLoading || vidsLoading
  const error = docsError || vidsError

  const safeIndex = Math.min(currentVideoIndex, Math.max(0, videos.length - 1))

  const handlePreviousVideo = () =>
    setCurrentVideoIndex(prev => (prev > 0 ? prev - 1 : videos.length - 1))
  const handleNextVideo = () =>
    setCurrentVideoIndex(prev => (prev < videos.length - 1 ? prev + 1 : 0))

  const handleDocumentClick = (doc: SecurityDocument) => {
    if (doc.is_pdf && doc.file_url) window.open(doc.file_url, '_blank', 'noopener,noreferrer')
    else if (doc.is_image && doc.file_url) { setSelectedImage(doc); setIsImageModalOpen(true) }
  }

  const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleDeleteDoc = async (e: React.MouseEvent, doc: SecurityDocument) => {
    e.stopPropagation()
    if (!await confirm({ message: `Supprimer « ${doc.title} » ?`, title: 'Supprimer le document' })) return
    setDeletingDocId(doc.id)
    await deleteDocument(doc.id)
    setDeletingDocId(null)
  }

  const handleDeleteVideo = async (e: React.MouseEvent, vid: SecurityVideo) => {
    e.stopPropagation()
    if (!await confirm({ message: `Supprimer la vidéo « ${vid.title} » ?`, title: 'Supprimer la vidéo' })) return
    setDeletingVideoId(vid.id)
    await deleteVideo(vid.id)
    if (currentVideoIndex >= videos.length - 1) setCurrentVideoIndex(Math.max(0, videos.length - 2))
    setDeletingVideoId(null)
  }

  return (
    <LayoutWrapper>
      <div className="w-full" style={{ paddingTop: 'clamp(0.5rem, 1vw, 1.5rem)', paddingBottom: 'clamp(1rem, 2vw, 3rem)' }}>
        {(isLoading || error) && (
          <StandardLoader
            title={isLoading ? "Chargement des ressources de sécurité..." : undefined}
            message={isLoading ? "Veuillez patienter pendant que nous récupérons les données." : undefined}
            error={error}
            showRetry={!!error}
            onRetry={() => window.location.reload()}
          />
        )}

        {!isLoading && !error && (
          <div className="stagger-animation mx-auto px-6 sm:px-8 lg:px-12 xl:px-16" style={{
            display: 'flex', flexDirection: 'column',
            gap: 'clamp(1rem, 3vw, 4rem)',
            maxWidth: 'clamp(70rem, 75vw, 100rem)', width: '100%'
          }}>
            <div className="relative w-full">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

                {/* Colonne principale : Vidéo */}
                <div className="w-full lg:w-[calc(100%-22rem)] lg:max-w-none relative" style={{ minWidth: 0 }}>
                  {videos.length > 0 ? (
                    <>
                      <VideoPlayer
                        video={videos[safeIndex]}
                        onPrevious={handlePreviousVideo}
                        onNext={handleNextVideo}
                        currentIndex={safeIndex}
                        totalVideos={videos.length}
                        onQuizClick={() => setIsQuizOpen(true)}
                        headerControls={
                          <div className="flex gap-1">
                            {videos[safeIndex]?.file_url && (
                              <button
                                title="Télécharger la vidéo"
                                onClick={e => handleDownload(e, videos[safeIndex].file_url!, videos[safeIndex].title)}
                                className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-blue-600 transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={e => handleDeleteVideo(e, videos[safeIndex])}
                                disabled={deletingVideoId === videos[safeIndex].id}
                                title="Supprimer cette vidéo"
                                className="p-1.5 rounded-md bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                              >
                                {deletingVideoId === videos[safeIndex].id
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            )}
                          </div>
                        }
                      />
                    </>
                  ) : isAdmin ? (
                    /* Zone vide — admin peut ajouter */
                    <button
                      onClick={() => setIsVideoModalOpen(true)}
                      className="w-full aspect-video border-2 border-dashed border-red-200 rounded-xl flex flex-col items-center justify-center gap-3 text-red-400 hover:border-red-400 hover:text-red-600 hover:bg-red-50/40 transition-colors"
                    >
                      <Video className="h-10 w-10" />
                      <p className="text-sm font-medium">Ajouter la première vidéo</p>
                    </button>
                  ) : null}

                  {/* Bouton admin : ajouter une vidéo supplémentaire */}
                  {isAdmin && videos.length > 0 && (
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => setIsVideoModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />Ajouter une vidéo
                      </button>
                    </div>
                  )}
                </div>

                {/* Colonne latérale : Documents */}
                {(documents.length > 0 || isAdmin) && (
                  <div className="w-full lg:w-80 lg:flex-shrink-0" style={{ minWidth: 0 }}>
                    <div className="mb-3 lg:mb-4 px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 xs:h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-sm"></div>
                        <h3 className="text-base xs:text-lg font-semibold text-gray-900">Documents de sécurité</h3>
                        <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-1">
                          {documents.length}
                        </Badge>
                        {isAdmin && (
                          <button onClick={() => setIsUploadOpen(true)} title="Ajouter un document"
                            className="ml-auto p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors">
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {documents.length === 0 && isAdmin ? (
                      <button onClick={() => setIsUploadOpen(true)}
                        className="w-full border-2 border-dashed border-blue-200 rounded-xl p-8 text-center text-blue-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/40 transition-colors">
                        <Upload className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-sm font-medium">Ajouter le premier document</p>
                      </button>
                    ) : (
                      <div className="space-y-3 lg:space-y-2.5 max-h-[calc(100vh-12rem)] lg:max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-2">
                        {documents.map(doc => (
                          <Card key={doc.id}
                            className={cn("rounded-lg overflow-hidden group cursor-pointer w-full",
                              "bg-white border border-gray-200 hover:border-blue-400",
                              "hover:shadow-md transition-all duration-300",
                              "flex flex-row gap-3 p-2.5 lg:p-2 relative")}
                            onClick={() => deletingDocId !== doc.id && handleDocumentClick(doc)}
                          >
                            <div className={cn("flex-shrink-0 w-16 h-16 lg:w-14 lg:h-14 rounded-md flex items-center justify-center",
                              doc.is_pdf ? "bg-red-50 border border-red-200"
                                : doc.is_image ? "bg-blue-50 border border-blue-200"
                                : "bg-gray-50 border border-gray-200")}>
                              {doc.is_pdf ? <FileText className="w-6 h-6 lg:w-5 lg:h-5 text-red-600" />
                                : doc.is_image ? <ImageIcon className="w-6 h-6 lg:w-5 lg:h-5 text-blue-600" />
                                : <FileText className="w-6 h-6 lg:w-5 lg:h-5 text-gray-600" />}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                              <div className="mb-1">
                                <Badge variant="outline" className={cn("text-xs px-1.5 py-0.5 font-medium",
                                  doc.is_pdf ? "bg-red-50 text-red-700 border-red-200"
                                    : doc.is_image ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : "bg-gray-50 text-gray-700 border-gray-200")}>
                                  {doc.is_pdf ? "PDF" : doc.is_image ? "Image" : "Doc"}
                                </Badge>
                              </div>
                              <h3 className="text-sm lg:text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1">
                                {doc.title}
                              </h3>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-auto">
                                {doc.is_pdf || doc.is_image
                                  ? <><Play className="w-3 h-3 text-blue-600" /><span className="text-blue-600 font-medium">Ouvrir</span></>
                                  : <><FileText className="w-3 h-3 text-gray-600" /><span className="text-gray-600 font-medium">Voir</span></>}
                              </div>
                            </div>
                            {/* Bouton télécharger — visible pour tous */}
                            {doc.file_url && (
                              <button
                                title="Télécharger"
                                onClick={e => handleDownload(e, doc.file_url!, doc.title)}
                                className={`absolute p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-blue-50 text-gray-400 hover:text-blue-600 shadow-sm ${isAdmin ? 'top-2 right-10' : 'top-2 right-2'}`}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {isAdmin && (
                              <button onClick={e => handleDeleteDoc(e, doc)} disabled={deletingDocId === doc.id}
                                title="Supprimer"
                                className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-red-50 text-gray-400 hover:text-red-600 shadow-sm">
                                {deletingDocId === doc.id
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <Trash2 className="h-3.5 w-3.5" />}
                              </button>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Empty state non-admin */}
            {documents.length === 0 && videos.length === 0 && !isAdmin && (
              <div className="w-full">
                <Card className="text-center rounded-lg" style={{ padding: 'clamp(2rem, 5vw, 6rem)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.75rem, 2vw, 1.5rem)', alignItems: 'center' }}>
                    <div className="bg-muted rounded-full flex items-center justify-center mx-auto" style={{ width: 'clamp(3rem, 8vw, 5rem)', height: 'clamp(3rem, 8vw, 5rem)' }}>
                      <FileText className="text-muted-foreground" style={{ width: 'clamp(1.5rem, 4vw, 2.5rem)', height: 'clamp(1.5rem, 4vw, 2.5rem)' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ fontSize: 'clamp(0.875rem, 2vw, 1.5rem)' }}>Aucune ressource de sécurité disponible</h3>
                      <p className="text-gray-500" style={{ fontSize: 'clamp(0.75rem, 1.5vw, 1rem)', marginTop: 'clamp(0.25rem, 0.8vw, 0.5rem)' }}>Les ressources seront bientôt disponibles</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <QuizModal open={isQuizOpen} onOpenChange={setIsQuizOpen} />

      {isAdmin && (
        <>
          <UploadModal open={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUploaded={fetchDocuments} />
          <VideoUploadModal
            open={isVideoModalOpen}
            onClose={() => setIsVideoModalOpen(false)}
            onSaved={fetchVideos}
          />
        </>
      )}

      {selectedImage && (
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent className="w-[95vw] h-[95vh] max-w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-white flex-shrink-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-4">{selectedImage.title}</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsImageModalOpen(false)} className="h-8 w-8 flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center">
              <img src={selectedImage.file_url} alt={selectedImage.title} className="max-w-full max-h-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </LayoutWrapper>
  )
}
