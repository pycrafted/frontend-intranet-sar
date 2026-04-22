"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ShieldCheck, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { API_CONFIG } from "@/lib/config"
import { useAuth } from "@/hooks/useAuth"

interface TRIData {
  id: number
  value: number
  period: string
  year: number
  month: number
}

const MONTH_NAMES = [
  '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

function prevMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
}
function nextMonth(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
}

export function TRIIndicatorWidget() {
  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)

  const now = new Date()
  const [viewYear,  setViewYear]  = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1)

  const [allData, setAllData] = useState<TRIData[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadAll = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch(`${API_CONFIG.ACCUEIL}/tri/all/`, { credentials: 'include' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then((list: TRIData[]) => setAllData(list))
      .catch(e => setError(e.message ?? 'Erreur réseau'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const current = allData.find(d => d.year === viewYear && d.month === viewMonth) ?? null

  const goPrev = () => { const p = prevMonth(viewYear, viewMonth); setViewYear(p.year); setViewMonth(p.month) }
  const goNext = () => { const n = nextMonth(viewYear, viewMonth); setViewYear(n.year); setViewMonth(n.month) }

  // Retourne null si succès, message d'erreur sinon
  const handleSave = async (year: number, month: number, value: number): Promise<string | null> => {
    try {
      const res = await fetch(`${API_CONFIG.ACCUEIL}/tri/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month, value }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        return body?.error ?? `HTTP ${res.status}`
      }
      const updated: TRIData = await res.json()
      setAllData(prev => {
        const idx = prev.findIndex(d => d.year === updated.year && d.month === updated.month)
        return idx >= 0 ? prev.map((d, i) => i === idx ? updated : d) : [...prev, updated]
      })
      setViewYear(updated.year)
      setViewMonth(updated.month)
      setIsModalOpen(false)
      return null
    } catch (e: any) {
      return e.message ?? 'Erreur lors de la sauvegarde.'
    }
  }

  const handleDelete = async (id: number): Promise<string | null> => {
    try {
      const res = await fetch(`${API_CONFIG.ACCUEIL}/tri/${id}/`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok && res.status !== 204) return `HTTP ${res.status}`
      setAllData(prev => prev.filter(d => d.id !== id))
      setIsModalOpen(false)
      return null
    } catch (e: any) {
      return e.message ?? 'Erreur lors de la suppression.'
    }
  }

  const cardBase = "h-[26rem] sm:h-[28rem] flex flex-col overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 border-0 relative"

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className={cardBase}>
        <CardHeader className="pb-2 pt-4 px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-100 animate-pulse w-10 h-10" />
            <div className="space-y-2">
              <div className="h-4 w-44 bg-teal-100 rounded animate-pulse" />
              <div className="h-3 w-28 bg-teal-100 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center gap-4 px-5">
          <div className="h-24 w-full bg-teal-100/50 rounded-2xl animate-pulse" />
          <div className="h-2 w-full bg-teal-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // ── Header commun ─────────────────────────────────────────────────────────
  const Header = (
    <CardHeader className="relative z-10 pb-2 pt-4 px-5 flex-shrink-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-lg group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-sm font-bold text-teal-900 leading-tight truncate">
              Indicateur TRI Sécurité
            </CardTitle>
            <p className="text-xs text-teal-600/70 mt-0.5">Taux de Récurrence des Incidents</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white/70 border border-teal-200/60 rounded-lg px-1 py-0.5 flex-shrink-0 shadow-sm">
          <button onClick={goPrev} className="p-1 rounded hover:bg-teal-100 transition-colors" aria-label="Mois précédent">
            <ChevronLeft className="h-3.5 w-3.5 text-teal-400" />
          </button>
          <span className="text-[11px] font-bold text-slate-700 px-1 min-w-[6.5rem] text-center leading-tight">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button onClick={goNext} className="p-1 rounded hover:bg-teal-100 transition-colors" aria-label="Mois suivant">
            <ChevronRight className="h-3.5 w-3.5 text-teal-400" />
          </button>
        </div>
      </div>
    </CardHeader>
  )

  // ── Erreur réseau ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <Card className={`${cardBase} hover:shadow-2xl transition-all duration-500 group`}>
        {Header}
        <CardContent className="relative flex-1 flex flex-col items-center justify-center text-center gap-3 px-5 z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-all duration-500">
            <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-bold text-teal-900">Données indisponibles</p>
            <p className="text-xs sm:text-sm text-teal-600/70 mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // ── Pas de données pour ce mois ───────────────────────────────────────────
  if (!current) {
    return (
      <>
        <Card className={`${cardBase} hover:shadow-2xl transition-all duration-500 group`}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-300/20 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-300/20 rounded-full translate-y-12 -translate-x-12" />
          </div>
          {Header}
          <CardContent className="relative flex-1 flex flex-col items-center justify-center text-center gap-3 px-5 z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-all duration-500">
              <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-teal-900 group-hover:text-teal-700 transition-colors">
                Aucun indicateur disponible
              </p>
              <p className="text-xs sm:text-sm text-teal-600/70 mt-1">
                Aucune donnée pour {MONTH_NAMES[viewMonth]} {viewYear}
              </p>
            </div>
          </CardContent>
          {isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              title="Saisir l'indicateur TRI"
              className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-500 hover:text-teal-600 shadow-md"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </Card>
        <TRIModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          allData={allData}
          initialYear={viewYear}
          initialMonth={viewMonth}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </>
    )
  }

  // ── Affichage normal ──────────────────────────────────────────────────────
  return (
    <>
      <Card className={`${cardBase} hover:shadow-xl transition-all duration-300 group`}>
        {Header}
        <CardContent className="flex-1 flex flex-col items-center justify-center px-5 pb-5 gap-3">
          <span className="text-sm font-semibold text-teal-500 uppercase tracking-widest">
            Valeur actuelle
          </span>
          <div className="flex items-end gap-3 leading-none">
            <span className="text-[8.5rem] font-black tracking-tight leading-none text-teal-700">
              {current.value.toFixed(2)}
            </span>
            <span className="text-5xl font-bold text-teal-400 mb-4">%</span>
          </div>
        </CardContent>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            title="Modifier l'indicateur TRI"
            className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-500 hover:text-teal-600 shadow-md"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </Card>
      <TRIModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        allData={allData}
        initialYear={viewYear}
        initialMonth={viewMonth}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </>
  )
}

// ── Modal — gère son propre état isSaving / error ──────────────────────────────
interface TRIModalProps {
  open: boolean
  onClose: () => void
  allData: TRIData[]
  initialYear: number
  initialMonth: number
  onSave: (year: number, month: number, value: number) => Promise<string | null>
  onDelete: (id: number) => Promise<string | null>
}

function TRIModal({ open, onClose, allData, initialYear, initialMonth, onSave, onDelete }: TRIModalProps) {
  const currentYear = new Date().getFullYear()
  const years = [currentYear - 1, currentYear, currentYear + 1]

  const [formYear,   setFormYear]   = useState(initialYear)
  const [formMonth,  setFormMonth]  = useState(initialMonth)
  const [formValue,  setFormValue]  = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  const [isSaving,   setIsSaving]   = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Réinitialise tout à l'ouverture
  useEffect(() => {
    if (!open) return
    setFormYear(initialYear)
    setFormMonth(initialMonth)
    setConfirmDel(false)
    setModalError(null)
    setIsSaving(false)
    const ex = allData.find(d => d.year === initialYear && d.month === initialMonth)
    setFormValue(ex ? String(ex.value) : '')
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Met à jour la valeur et efface l'erreur quand le mois/année change dans le modal
  useEffect(() => {
    const ex = allData.find(d => d.year === formYear && d.month === formMonth)
    setFormValue(ex ? String(ex.value) : '')
    setConfirmDel(false)
    setModalError(null)
  }, [formYear, formMonth]) // eslint-disable-line react-hooks/exhaustive-deps

  const existing = allData.find(d => d.year === formYear && d.month === formMonth)

  const handleSubmit = async () => {
    const parsed = parseFloat(formValue.replace(',', '.'))
    if (isNaN(parsed) || parsed < 0) {
      setModalError('Veuillez saisir une valeur numérique valide (≥ 0).')
      return
    }
    setIsSaving(true)
    setModalError(null)
    const err = await onSave(formYear, formMonth, parsed)
    setIsSaving(false)
    if (err) setModalError(err)
  }

  const handleDelete = async () => {
    if (!existing) return
    setIsSaving(true)
    setModalError(null)
    const err = await onDelete(existing.id)
    setIsSaving(false)
    if (err) setModalError(err)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ width: '420px', maxWidth: 'calc(100vw - 2rem)' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            {existing ? "Modifier l'indicateur TRI" : "Saisir l'indicateur TRI"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Sélecteurs période */}
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <Label>Mois</Label>
              <select
                value={formMonth}
                onChange={e => setFormMonth(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
              >
                {MONTH_NAMES.slice(1).map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-1.5">
              <Label>Année</Label>
              <select
                value={formYear}
                onChange={e => setFormYear(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 bg-white"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Badge valeur existante */}
          {existing && (
            <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-700">
              <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0 text-teal-500" />
              <span>
                Valeur enregistrée pour {MONTH_NAMES[formMonth]} {formYear} :&nbsp;
                <strong>{existing.value.toFixed(2)} %</strong>
              </span>
            </div>
          )}

          {/* Champ valeur */}
          <div className="space-y-1.5">
            <Label>{existing ? 'Nouvelle valeur (%)' : 'Valeur TRI (%)'}</Label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formValue}
              onChange={e => setFormValue(e.target.value)}
              placeholder="ex : 2.45"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
            <p className="text-xs text-gray-500">
              Taux de Récurrence des Incidents pour la période sélectionnée.
            </p>
          </div>

          {/* Suppression avec confirmation */}
          {existing && (
            confirmDel ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="flex-1 text-xs text-red-700">
                  Supprimer l'indicateur de {MONTH_NAMES[formMonth]} {formYear} ?
                </p>
                <button
                  onClick={handleDelete}
                  disabled={isSaving}
                  className="px-2.5 py-1 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSaving ? '...' : 'Confirmer'}
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  disabled={isSaving}
                  className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDel(true)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer l'indicateur de {MONTH_NAMES[formMonth]} {formYear}
              </button>
            )
          )}

          {/* Erreur */}
          {modalError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {modalError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || !formValue}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isSaving ? 'Enregistrement...' : (existing ? 'Mettre à jour' : 'Enregistrer')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
