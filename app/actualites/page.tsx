"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, MoreVertical, Pencil, Trash2, EyeOff, Eye, Save, ImageIcon, RefreshCw, Loader2 } from "lucide-react"
import { useLinkedInActualites, LinkedInActualite } from "@/hooks/useLinkedInActualites"
import LinkedInModal from "@/components/linkedin-modal"
import { StandardLoader } from "@/components/ui/standard-loader"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { API_CONFIG } from "@/lib/config"

const ITEMS_PER_PAGE = 10

/* Surligne toutes les occurrences de `query` dans `text` en jaune */
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  const lower = query.toLowerCase()
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === lower ? (
          <mark key={i} style={{ background: '#fef08a', color: 'inherit', borderRadius: 3, padding: '0 2px' }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function ActualiteCard({
  item,
  onVoirPlus,
  isAdmin,
  onEdit,
  onDelete,
  onToggleActive,
  searchTerm,
}: {
  item: LinkedInActualite
  onVoirPlus: (item: LinkedInActualite) => void
  isAdmin: boolean
  onEdit: (item: LinkedInActualite) => void
  onDelete: (item: LinkedInActualite) => void
  onToggleActive: (item: LinkedInActualite) => void
  searchTerm?: string
}) {
  const LIMIT = 200
  const fullContent = item.content.trim()
  const isTruncated = fullContent.length > LIMIT
  const content = isTruncated ? fullContent.slice(0, LIMIT).trimEnd() + '...' : fullContent
  const showVoirPlus = isTruncated || !!item.linkedin_url

  return (
    <Card className={`adaptive-publication-card rounded-xl overflow-hidden group fade-in w-full shadow-sm transition-shadow duration-200 ${
      !item.is_active
        ? 'bg-gray-50 border border-dashed border-gray-300 opacity-70 hover:shadow-none'
        : 'bg-white border border-gray-200 hover:shadow-lg'
    }`}>
      <CardContent className="p-0 w-full">

        {/* Header */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 border-b"
          style={{ borderColor: '#344256' + '18' }}
        >
          {/* Date + badge désactivée */}
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.is_active ? '#344256' : '#d1d5db' }}
            />
            <span className={`text-xs font-semibold tracking-wide uppercase ${
              item.is_active ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {item.date_display}
            </span>
            {!item.is_active && (
              <span className="text-[10px] font-semibold text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                Désactivée
              </span>
            )}
          </div>

          {/* Menu admin */}
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  onClick={e => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onEdit(item)}>
                  <Pencil className="h-4 w-4 text-blue-500" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onToggleActive(item)}>
                  {item.is_active
                    ? <><EyeOff className="h-4 w-4 text-orange-500" />Désactiver</>
                    : <><Eye className="h-4 w-4 text-green-500" />Activer</>
                  }
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Contenu */}
        <div className="px-4 sm:px-6 py-4 w-full">
          <div className="text-gray-800 leading-relaxed text-base sm:text-lg font-medium whitespace-pre-line">
            <Highlight text={content} query={searchTerm ?? ""} />
          </div>

          {showVoirPlus && (
            <button
              onClick={() => onVoirPlus(item)}
              className="mt-3 text-sm font-semibold hover:underline transition-colors"
              style={{ color: '#344256' }}
            >
              Voir plus →
            </button>
          )}
        </div>

        {/* Image */}
        <div className="relative overflow-hidden">
          <img
            src={item.image_url || '/media/generique.jpg'}
            alt=""
            className="w-full h-auto object-contain"
            onError={e => { (e.target as HTMLImageElement).src = '/media/generique.jpg' }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default function ActualitesPage() {
  const { items, loading, error } = useLinkedInActualites()
  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)

  const [localItems, setLocalItems] = useState<LinkedInActualite[]>([])
  const [modalItem, setModalItem] = useState<LinkedInActualite | null>(null)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)
  const [searchTerm, setSearchTerm] = useState("")
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Modal modifier
  const [editItem, setEditItem] = useState<LinkedInActualite | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)

  // Dialog supprimer
  const [deleteItem, setDeleteItem] = useState<LinkedInActualite | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sync LinkedIn
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)

  const handleSyncLinkedIn = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncSuccess(false)
    try {
      const res = await fetch('/api/sync-linkedin', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.success) {
        const detail = data.stderr?.trim() || data.message || "inconnue"
        alert("Erreur lors de la synchronisation :\n\n" + detail)
        setIsSyncing(false)
        return
      }
      // Polling toutes les 3s pour détecter la fin du script
      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/sync-linkedin/status')
          const statusData = await statusRes.json()
          if (statusData.status === 'done') {
            clearInterval(interval)
            setIsSyncing(false)
            setSyncSuccess(true)
            setTimeout(() => {
              setSyncSuccess(false)
              window.location.reload()
            }, 3000)
          } else if (statusData.status === 'error') {
            clearInterval(interval)
            setIsSyncing(false)
            alert("La synchronisation a échoué. Consultez les logs du terminal.")
          }
        } catch {
          // ignore les erreurs réseau passagères
        }
      }, 3000)
    } catch {
      alert("Erreur réseau lors de la synchronisation.")
      setIsSyncing(false)
    }
  }

  // Sync local items avec le hook
  useEffect(() => {
    if (items.length > 0) setLocalItems(items)
  }, [items])

  // Les non-admins ne voient pas les articles désactivés
  const visibleItems = isAdmin ? localItems : localItems.filter(i => i.is_active)

  const filtered = searchTerm.trim()
    ? visibleItems.filter(i => {
        const q = searchTerm.toLowerCase()
        return (
          i.content.toLowerCase().includes(q) ||
          i.date_display.toLowerCase().includes(q)
        )
      })
    : visibleItems

  const displayed = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const linkedInItems = localItems.filter(i => !!i.linkedin_url)

  const loadMore = useCallback(() => {
    setVisibleCount(n => Math.min(n + ITEMS_PER_PAGE, filtered.length))
  }, [filtered.length])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) loadMore()
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  // Ouvrir le modal d'édition
  const handleOpenEdit = (item: LinkedInActualite) => {
    setEditItem(item)
    setEditContent(item.content)
    setEditImageFile(null)
    setEditImagePreview(item.image_url || "")
  }

  // Appliquer un fichier image (utilisé par upload ET paste)
  const applyImageFile = (file: File) => {
    console.log('[Upload] Fichier appliqué:', { name: file.name, size: file.size, type: file.type })
    setEditImageFile(file)
    const reader = new FileReader()
    reader.onload = ev => setEditImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  // Gérer la sélection d'un fichier via l'input
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    applyImageFile(file)
  }

  // Écouter le Ctrl+V quand le modal est ouvert
  useEffect(() => {
    if (!editItem) return
    const handlePaste = (e: ClipboardEvent) => {
      const items = Array.from(e.clipboardData?.items ?? [])
      const imageItem = items.find(item => item.type.startsWith('image/'))
      if (!imageItem) return
      const file = imageItem.getAsFile()
      if (!file) return
      e.preventDefault()
      applyImageFile(file)
    }
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [editItem])

  // Sauvegarder la modification
  const handleSaveEdit = async () => {
    if (!editItem) return
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('content', editContent)
      if (editImageFile) {
        formData.append('image_file', editImageFile)
        console.log('[Upload] FormData construit avec image_file:', editImageFile.name)
      } else {
        console.log('[Upload] Aucune image sélectionnée, envoi du contenu seul')
      }

      const url = `${API_CONFIG.ACTUALITES}/linkedin/${editItem.id}/`
      console.log('[Upload] Envoi PATCH vers:', url)

      const res = await fetch(url, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      })

      console.log('[Upload] Réponse reçue:', { status: res.status, ok: res.ok })

      if (!res.ok) {
        const errorBody = await res.text()
        console.error('[Upload] Erreur serveur:', { status: res.status, body: errorBody })
        throw new Error(`Erreur ${res.status}: ${errorBody}`)
      }

      const updated: LinkedInActualite = await res.json()
      console.log('[Upload] Succès, image_url retournée:', updated.image_url)
      setLocalItems(prev => prev.map(i => i.id === updated.id ? updated : i))
      setEditItem(null)
    } catch (e) {
      console.error('[Upload] Exception:', e)
      alert(`Erreur lors de la modification : ${e instanceof Error ? e.message : 'Erreur inconnue'}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Activer / désactiver
  const handleToggleActive = async (item: LinkedInActualite) => {
    try {
      const res = await fetch(`${API_CONFIG.ACTUALITES}/linkedin/${item.id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !item.is_active }),
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const updated: LinkedInActualite = await res.json()
      setLocalItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    } catch {
      alert("Erreur lors de la mise à jour. Veuillez réessayer.")
    }
  }

  // Supprimer
  const handleConfirmDelete = async () => {
    if (!deleteItem) return
    setIsDeleting(true)
    try {
      const res = await fetch(`${API_CONFIG.ACTUALITES}/linkedin/${deleteItem.id}/`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      setLocalItems(prev => prev.filter(i => i.id !== deleteItem.id))
      setDeleteItem(null)
    } catch {
      alert("Erreur lors de la suppression. Veuillez réessayer.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <LayoutWrapper
      secondaryNavbarProps={{
        searchTerm,
        onSearchChange: (v) => { setSearchTerm(v); setVisibleCount(ITEMS_PER_PAGE) },
        searchPlaceholder: "Rechercher dans les actualités...",
        isTyping: false,
        showTimeFilter: false,
        showDepartmentFilter: false,
        rightActions: isAdmin ? (
          <div className="flex items-center gap-2">
            {syncSuccess && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span>✓</span>
                <span className="hidden sm:inline">Synchronisé !</span>
              </span>
            )}
            <button
              onClick={handleSyncLinkedIn}
              disabled={isSyncing}
              title="Synchroniser LinkedIn"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors duration-150 text-xs font-medium disabled:cursor-not-allowed ${
                syncSuccess
                  ? 'border-green-400 bg-green-50 text-green-600'
                  : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-blue-600 hover:border-blue-400 disabled:opacity-50'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'En cours...' : syncSuccess ? 'Terminé' : 'Sync LinkedIn'}
              </span>
            </button>
          </div>
        ) : undefined,
      }}
      sidebarProps={{
        activeFilter: 'all',
        onFilterChange: () => {},
        activeDepartment: 'all',
        onDepartmentChange: () => {},
      }}
    >
      <div className="w-full max-w-3xl mx-auto space-y-4 xs:space-y-6">

        {/* Loading / Error */}
        {(loading || error) && (
          <StandardLoader
            title={loading ? "Chargement des actualités..." : undefined}
            message={loading ? "Veuillez patienter pendant que nous récupérons les données." : undefined}
            error={error ?? undefined}
            showRetry={!!error}
            onRetry={() => window.location.reload()}
          />
        )}

        {!loading && !error && (
          <div className="space-y-4 xs:space-y-6 stagger-animation">

            {/* Nombre d'actualités */}
            {filtered.length > 0 && (
              <div className="mx-auto flex items-center gap-2">
                <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#344256' }}></div>
                <h2 className="text-base font-semibold text-gray-900">
                  {searchTerm ? `Résultats pour « ${searchTerm} »` : 'Toutes les actualités'}
                </h2>
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: '#344256' }}>
                  {filtered.length}
                </span>
              </div>
            )}

            {/* Liste des posts */}
            {displayed.length > 0 && (
              <div className="space-y-3 xs:space-y-4 mx-auto">
                {displayed.map(item => (
                  <ActualiteCard
                    key={item.id}
                    item={item}
                    onVoirPlus={setModalItem}
                    isAdmin={isAdmin}
                    onEdit={handleOpenEdit}
                    onDelete={setDeleteItem}
                    onToggleActive={handleToggleActive}
                    searchTerm={searchTerm}
                  />
                ))}
              </div>
            )}

            {/* Sentinel infinite scroll */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            )}

            {/* Fin de liste */}
            {!hasMore && displayed.length > ITEMS_PER_PAGE && (
              <p className="text-center text-sm text-gray-400 pb-8">Toutes les actualités sont affichées</p>
            )}

            {/* État vide */}
            {displayed.length === 0 && (
              <Card className="mx-auto p-8 xs:p-12 text-center rounded-lg">
                <div className="space-y-3 xs:space-y-4">
                  <div className="w-12 h-12 xs:w-16 xs:h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-6 w-6 xs:h-8 xs:w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base xs:text-lg font-semibold">
                      {searchTerm ? "Aucun résultat pour cette recherche" : "Aucune actualité disponible"}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {searchTerm
                        ? "Essayez avec d'autres mots-clés"
                        : "Les actualités LinkedIn SAR apparaîtront ici après synchronisation"}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Modal LinkedIn */}
      <LinkedInModal
        item={modalItem}
        allItems={linkedInItems}
        onClose={() => setModalItem(null)}
        onNavigate={setModalItem}
      />

      {/* Modal modifier */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent style={{ width: '520px', maxWidth: 'calc(100vw - 2rem)', maxHeight: '90vh', overflowY: 'auto' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" />
              Modifier l'actualité
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="edit-content" className="text-sm font-medium text-gray-700">
                Contenu
              </Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                className="mt-1 min-h-[320px] resize-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">Image</Label>
              {editImagePreview && (
                <div className="mt-2 mb-2 relative group/img">
                  <img
                    src={editImagePreview}
                    alt="Aperçu"
                    className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
                    onError={e => { (e.target as HTMLImageElement).src = '/media/generique.jpg' }}
                  />
                  <button
                    type="button"
                    onClick={() => { setEditImageFile(null); setEditImagePreview(editItem?.image_url || '') }}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover/img:opacity-100 transition-opacity"
                    title="Retirer l'image"
                  >
                    ✕
                  </button>
                </div>
              )}
              <input
                id="edit-image"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              <label
                htmlFor="edit-image"
                className="mt-1 flex items-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
              >
                <ImageIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {editImageFile
                    ? editImageFile.name
                    : <span>Cliquez pour choisir <span className="text-gray-400">ou</span> <kbd className="px-1.5 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded">Ctrl+V</kbd> pour coller</span>
                  }
                </span>
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditItem(null)} disabled={isSaving}>
                Annuler
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving || !editContent.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Sauvegarde...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" />Sauvegarder</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent style={{ width: '420px', maxWidth: 'calc(100vw - 2rem)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette actualité ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'actualité sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </LayoutWrapper>
  )
}
