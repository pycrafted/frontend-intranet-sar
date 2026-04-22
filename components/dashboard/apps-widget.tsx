"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LayoutGrid, Pencil, ImageIcon } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { getApiUrl, getApiBaseUrl } from "@/lib/config"

interface App {
  id: number
  name: string
  label: string
  url: string
  image: string
  order: number
}

const FALLBACK_APPS: App[] = [
  { id: 1, name: 'SAP FIORI',   label: 'Fiori',    url: 'https://srv-sap-prod.sar.sn:50443/sap/bc/ui2/flp', image: '/fiori.png',         order: 1 },
  { id: 2, name: 'Qualipro',    label: 'Qualipro', url: 'https://srv-qualipro/Qualipro',                      image: '/qualipro_test.png', order: 2 },
  { id: 3, name: 'SAP S/4HANA', label: 'S/4HANA',  url: 'https://sar.eu20.hcs.cloud.sap/approuter/v1/redirect?url=%2Fsap%2Ffpa%2Fui%2Fapp.html%23%2Fhome', image: '/sap-s4hana.svg', order: 3 },
  { id: 4, name: 'Courrier',    label: 'Courrier',  url: 'https://sar-sygec.sar.sn/MaarchCourrier/postgres/dist/index.html#/login', image: '/courrier.png', order: 4 },
  { id: 5, name: 'Parapheur',   label: 'Parapheur', url: 'https://sar-sygeco.sar.sn/MaarchParapheur/dist/#/login', image: '/paraphe.png', order: 5 },
  { id: 6, name: 'SIRH',        label: 'SIRH',      url: '', image: '', order: 6 },
]

/** Résout un chemin image relatif (/media/...) en URL absolue Django */
function resolveImage(src: string): string {
  if (!src) return ''
  if (src.startsWith('/media/')) return `${getApiBaseUrl()}${src}`
  return src
}

export function AppsWidget() {
  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)

  const [apps, setApps] = useState<App[]>(FALLBACK_APPS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  // Edit state
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<App | null>(null)
  const [editName, setEditName] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [editUrl, setEditUrl] = useState('')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`${getApiUrl()}/config/quick-access/`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (Array.isArray(data) && data.length > 0) setApps(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setCurrentIndex(i => (i + 1) % apps.length), 3500)
    return () => clearInterval(t)
  }, [paused, apps.length])

  const handleOpenEdit = (app: App) => {
    setEditingApp(app)
    setEditName(app.name)
    setEditLabel(app.label)
    setEditUrl(app.url)
    setEditImageFile(null)
    setEditImagePreview(app.image)
    setIsEditOpen(true)
  }

  const handleSave = async () => {
    if (!editingApp) return
    setIsSaving(true)
    try {
      const formData = new FormData()
      formData.append('name', editName)
      formData.append('label', editLabel)
      formData.append('url', editUrl)
      if (editImageFile) formData.append('image_file', editImageFile)

      const res = await fetch(`${getApiUrl()}/config/quick-access/${editingApp.id}/`, {
        method: 'PATCH',
        body: formData,
      })
      if (!res.ok) throw new Error()
      const updated: App = await res.json()
      setApps(prev => prev.map(a => a.id === updated.id ? updated : a))
      setIsEditOpen(false)
    } catch {
      alert("Erreur lors de la sauvegarde.")
    } finally {
      setIsSaving(false)
    }
  }

  const currentApp = apps[currentIndex]

  return (
    <>
      <Card className="h-[26rem] sm:h-[28rem] flex flex-col overflow-hidden relative
        bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
        border-0 hover:shadow-2xl transition-all duration-500 group">

        {/* Décors */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -translate-y-16 translate-x-16 group-hover:bg-blue-200/40 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-200/30 rounded-full translate-y-12 -translate-x-12 group-hover:bg-indigo-200/40 transition-colors duration-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-indigo-100/15 to-purple-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Header */}
        <CardHeader className="relative z-10 pb-2 pt-4 px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg
              group-hover:shadow-blue-300/50 group-hover:scale-105 transition-all duration-300">
              <LayoutGrid className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 leading-tight">Accès Rapide</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Applications internes SAR</p>
            </div>
          </div>
        </CardHeader>

        {/* Contenu */}
        <CardContent className="relative z-10 flex-1 flex flex-col justify-center px-5 pb-5">

          {/* Mobile : carousel */}
          <div className="flex sm:hidden flex-col items-center justify-center gap-5 flex-1"
            onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <AppTile app={currentApp} isAdmin={isAdmin} onEdit={handleOpenEdit} mobile />
            <div className="flex gap-1.5">
              {apps.map((_, i) => (
                <button key={i} onClick={() => setCurrentIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-300'}`} />
              ))}
            </div>
          </div>

          {/* Desktop : grille 3+3 */}
          <div className="hidden sm:flex flex-col gap-4 flex-1 justify-center items-center">
            <div className="flex gap-5 justify-center">
              {apps.slice(0, 3).map(app => <AppTile key={app.id} app={app} isAdmin={isAdmin} onEdit={handleOpenEdit} />)}
            </div>
            <div className="flex gap-5 justify-center">
              {apps.slice(3).map(app => <AppTile key={app.id} app={app} isAdmin={isAdmin} onEdit={handleOpenEdit} />)}
            </div>
          </div>

        </CardContent>

        {/* Bouton édition global — bas droite, admin seulement */}
        {isAdmin && (
          <button
            onClick={() => handleOpenEdit(apps[0])}
            title="Modifier les accès rapides"
            className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-500 hover:text-blue-600 shadow-md"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </Card>

      {/* Modal édition */}
      {isAdmin && editingApp && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent style={{ width: '520px', maxWidth: 'calc(100vw - 2rem)' }}>
            <DialogHeader>
              <DialogTitle>Modifier — {editingApp.name}</DialogTitle>
            </DialogHeader>

            {/* Sélecteur d'app */}
            <div className="flex flex-wrap gap-2 py-1">
              {apps.map(a => (
                <button key={a.id} onClick={() => handleOpenEdit(a)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    editingApp.id === a.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}>
                  {a.label}
                </button>
              ))}
            </div>

            <div className="space-y-4 py-1">
              <div className="space-y-1.5">
                <Label>Nom complet</Label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-1.5">
                <Label>Label court</Label>
                <input type="text" value={editLabel} onChange={e => setEditLabel(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-1.5">
                <Label>URL</Label>
                <input type="text" value={editUrl} onChange={e => setEditUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" />
              </div>
              <div className="space-y-1.5">
                <Label>Image</Label>
                <div className="flex items-center gap-3">
                  {editImagePreview && (
                    <img src={resolveImage(editImagePreview)} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                  )}
                  {!editImagePreview && (
                    <div className="w-12 h-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <button onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
                    Choisir une image
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setEditImageFile(file)
                      const reader = new FileReader()
                      reader.onload = ev => setEditImagePreview(ev.target?.result as string)
                      reader.readAsDataURL(file)
                    }} />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}

function AppTile({ app, isAdmin, onEdit, mobile = false }: { app: App; isAdmin: boolean; onEdit: (a: App) => void; mobile?: boolean }) {
  const size = mobile ? 'w-28 h-28' : 'w-20 h-20 sm:w-22 sm:h-22'

  const handleClick = () => {
    if (app.url) window.open(app.url, '_blank')
  }

  return (
    <div className="group/tile relative flex flex-col items-center gap-2 transition-all duration-200">
      <button onClick={handleClick}
        className={`${size} rounded-2xl border-2 border-blue-200 overflow-hidden
          shadow-sm group-hover/tile:shadow-lg group-hover/tile:scale-105
          group-hover/tile:border-blue-400 transition-all duration-200 bg-white
          ${!app.url ? 'opacity-60 cursor-default' : ''}`}>
        {app.image ? (
          <img src={resolveImage(app.image)} alt={app.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </button>
      <span className="text-xs font-semibold text-slate-600 group-hover/tile:text-slate-900 transition-colors text-center leading-tight">
        {app.label}
      </span>
    </div>
  )
}
