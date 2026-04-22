"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Lightbulb, Pencil, Plus, Trash2, Edit2, Loader2, X, Check } from "lucide-react"
import { IdeaBoxModal } from "@/components/idea-box-modal"
import { useAuth } from "@/hooks/useAuth"
import { API_CONFIG } from "@/lib/config"

// ── Types ──────────────────────────────────────────────────────────────────────

interface IdeaDepartment {
  id: number
  code: string
  name: string
  emails: string[]
  is_active: boolean
}

type DeptForm = { code: string; name: string; emails: string; is_active: boolean }

const emptyForm = (): DeptForm => ({ code: '', name: '', emails: '', is_active: true })

function getCsrf() {
  return document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? ''
}

// ── Sous-composant : ligne département ────────────────────────────────────────

function DeptRow({ dept, onEdit, onDelete }: {
  dept: IdeaDepartment
  onEdit: (d: IdeaDepartment) => void
  onDelete: (d: IdeaDepartment) => void
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 bg-white hover:border-orange-200 hover:bg-orange-50/30 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-800">{dept.name}</span>
          <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{dept.code}</span>
          {!dept.is_active && (
            <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Inactif</span>
          )}
        </div>
        {dept.emails.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {dept.emails.map(e => (
              <span key={e} className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded truncate max-w-[200px]">{e}</span>
            ))}
          </div>
        ) : (
          <p className="mt-0.5 text-[10px] text-gray-400 italic">Aucun email configuré</p>
        )}
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={() => onEdit(dept)} className="p-1.5 rounded-md hover:bg-orange-100 text-gray-400 hover:text-orange-600 transition-colors">
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onDelete(dept)} className="p-1.5 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-600 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Formulaire add / edit ──────────────────────────────────────────────────────

function DeptFormPanel({ initial, onSave, onCancel, saving }: {
  initial: DeptForm
  onSave: (f: DeptForm) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<DeptForm>(initial)

  useEffect(() => { setForm(initial) }, [initial])

  const set = (k: keyof DeptForm, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/40 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">Nom *</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex : Production"
            className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">Code *</label>
          <input
            value={form.code}
            onChange={e => set('code', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
            placeholder="Ex : production"
            className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-xs font-mono outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-colors"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
          Emails destinataires <span className="text-gray-400 normal-case">(un par ligne)</span>
        </label>
        <textarea
          value={form.emails}
          onChange={e => set('emails', e.target.value)}
          placeholder={"responsable@sar.sn\ndirection@sar.sn"}
          rows={3}
          className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 transition-colors resize-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="dept-active"
          checked={form.is_active}
          onChange={e => set('is_active', e.target.checked)}
          className="h-3.5 w-3.5 accent-orange-500"
        />
        <label htmlFor="dept-active" className="text-xs text-gray-600">Département actif</label>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving} size="sm" className="flex-1 text-xs h-8">
          Annuler
        </Button>
        <Button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving || !form.name.trim() || !form.code.trim()}
          size="sm"
          className="flex-1 text-xs h-8 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
        >
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Check className="h-3 w-3 mr-1" />Enregistrer</>}
        </Button>
      </div>
    </div>
  )
}

// ── Modal principal de gestion des départements ────────────────────────────────

function DeptManagerModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [depts, setDepts] = useState<IdeaDepartment[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'list' | 'add' | 'edit' | 'delete'>('list')
  const [target, setTarget] = useState<IdeaDepartment | null>(null)
  const [formInit, setFormInit] = useState<DeptForm>(emptyForm())

  const BASE = `${API_CONFIG.ACCUEIL}/departments/`

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(BASE, { credentials: 'include' })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      setDepts(data.results ?? data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }, [BASE])

  useEffect(() => {
    if (open) { load(); setMode('list'); setError(null) }
  }, [open, load])

  const handleAdd = () => {
    setFormInit(emptyForm())
    setTarget(null)
    setMode('add')
  }

  const handleEdit = (d: IdeaDepartment) => {
    setFormInit({ code: d.code, name: d.name, emails: d.emails.join('\n'), is_active: d.is_active })
    setTarget(d)
    setMode('edit')
  }

  const handleDelete = (d: IdeaDepartment) => {
    setTarget(d)
    setMode('delete')
  }

  const parseEmails = (raw: string) =>
    raw.split('\n').map(e => e.trim()).filter(e => e.includes('@'))

  const handleSave = async (form: DeptForm) => {
    setSaving(true)
    setError(null)
    try {
      const payload = { code: form.code, name: form.name, emails: parseEmails(form.emails), is_active: form.is_active }
      const url = mode === 'edit' && target ? `${BASE}${target.id}/` : BASE
      const method = mode === 'edit' ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = typeof data === 'object' ? Object.values(data).flat().join(' ') : `Erreur ${res.status}`
        throw new Error(msg as string)
      }
      await load()
      setMode('list')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!target) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`${BASE}${target.id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'X-CSRFToken': getCsrf() },
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      await load()
      setMode('list')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ width: '520px', maxWidth: 'calc(100vw - 2rem)', maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            Départements — Boîte à Idées
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* Mode liste */}
          {mode === 'list' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{depts.length} département{depts.length !== 1 ? 's' : ''}</p>
                <Button onClick={handleAdd} size="sm" className="h-8 text-xs bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white">
                  <Plus className="h-3.5 w-3.5 mr-1" />Ajouter
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
                </div>
              ) : depts.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">Aucun département configuré</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {depts.map(d => (
                    <DeptRow key={d.id} dept={d} onEdit={handleEdit} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Mode ajout / édition */}
          {(mode === 'add' || mode === 'edit') && (
            <>
              <p className="text-xs font-semibold text-gray-700">
                {mode === 'add' ? 'Nouveau département' : `Modifier : ${target?.name}`}
              </p>
              <DeptFormPanel
                initial={formInit}
                onSave={handleSave}
                onCancel={() => { setMode('list'); setError(null) }}
                saving={saving}
              />
            </>
          )}

          {/* Mode suppression */}
          {mode === 'delete' && target && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <Trash2 className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800 mb-1">Supprimer « {target.name} » ?</p>
                <p className="text-xs text-gray-500">Les idées liées à ce département seront également supprimées.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setMode('list'); setError(null) }} disabled={saving} className="flex-1 text-xs h-8">
                  Annuler
                </Button>
                <Button onClick={handleConfirmDelete} disabled={saving} className="flex-1 text-xs h-8 bg-red-500 hover:bg-red-600 text-white">
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Trash2 className="h-3 w-3 mr-1" />Supprimer</>}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Widget principal ───────────────────────────────────────────────────────────

export function IdeaBoxWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)

  return (
    <>
      <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-0 hover:shadow-xl transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
        {/* Effet de brillance en arrière-plan */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-transparent to-orange-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        {/* Icônes décoratives */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
          <svg className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
          <svg className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
        </div>

        {/* Header */}
        <CardHeader className="pb-2 pt-4 px-5 flex-shrink-0 relative z-10">
          <div className="flex items-center gap-3 w-full">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg group-hover:shadow-orange-300/50 group-hover:scale-105 transition-all duration-300">
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-bold text-gray-900 leading-tight">
                Boîte à Idées
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Partagez vos suggestions
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsDeptModalOpen(true)}
                title="Gérer les départements"
                className="p-1.5 rounded-lg bg-white/80 hover:bg-orange-50 text-gray-400 hover:text-orange-600 shadow-sm transition-all duration-200 flex-shrink-0"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-center items-center text-center relative z-10 p-2 sm:p-3 md:p-6">
          <div className="space-y-2 sm:space-y-4 md:space-y-6 lg:space-y-8">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-500 group-hover:animate-pulse">
                <Lightbulb className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-16 lg:w-16 text-white drop-shadow-lg" />
              </div>
              <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-yellow-300 via-orange-400 to-red-400 rounded-full mx-auto opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500"></div>
            </div>

            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">
                <span className="hidden sm:inline">Une suggestion ?</span>
                <span className="sm:hidden">Suggestion ?</span>
              </h3>

              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  <span>→</span>
                  <span className="hidden lg:inline">Renseignez la boîte à idées anonyme</span>
                  <span className="hidden sm:inline lg:hidden">Renseigner la boîte à idées</span>
                  <span className="sm:hidden">Boîte à idées</span>
                </span>
              </Button>
            </div>
          </div>
        </CardContent>

      </Card>

      <IdeaBoxModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <DeptManagerModal open={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} />
    </>
  )
}
