"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, ChevronLeft, ChevronRight, AlertTriangle, Pencil, Plus, Trash2, CalendarX } from "lucide-react"
import { API_CONFIG } from "@/lib/config"
import { useAuth } from "@/hooks/useAuth"
import { useConfirm } from "@/components/ui/confirm-dialog"

const MONTH_NAMES = [
  '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]

interface MonthEntry {
  month:        number
  acompte_day:  number
  virement_day: number
}

interface PayrollData {
  year:   number
  months: MonthEntry[]
  exists: boolean
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

async function fetchPayroll(year: number): Promise<PayrollData> {
  const r = await fetch(`${API_CONFIG.ACCUEIL}/paie/?year=${year}`, { credentials: 'include' })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

async function savePayroll(year: number, months: MonthEntry[]): Promise<PayrollData> {
  const r = await fetch(`${API_CONFIG.ACCUEIL}/paie/`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ year, months }),
  })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

export function PayrollCalendarWidget() {
  const now          = new Date()
  const currentYear  = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)

  const [year, setYear]           = useState(currentYear)
  const [data, setData]           = useState<PayrollData | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const load = (y: number) => {
    setLoading(true)
    setError(null)
    fetchPayroll(y)
      .then(setData)
      .catch(e => setError(e.message ?? 'Erreur réseau'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(year) }, [year])

  const sorted = (data?.months ?? []).slice().sort((a, b) => a.month - b.month)

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-100 border-0">
        <CardHeader className="pb-2 pt-4 px-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-200/60 animate-pulse w-10 h-10" />
              <div className="space-y-1.5">
                <div className="h-4 w-44 bg-indigo-200/60 rounded animate-pulse" />
                <div className="h-3 w-20 bg-indigo-100/60 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3 px-5 pb-4">
          <div className="h-20 w-full bg-indigo-100/60 rounded-xl animate-pulse" />
          <div className="flex-1 bg-blue-100/40 rounded-xl animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  // ── Erreur ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-100 border-0">
        <CardHeader className="pb-2 pt-4 px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100">
              <AlertTriangle className="h-5 w-5 text-indigo-400" />
            </div>
            <CardTitle className="text-sm font-bold text-slate-800">Calendrier de Paie</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-2 px-5">
          <AlertTriangle className="h-8 w-8 text-indigo-300" />
          <p className="text-sm text-slate-600">Données indisponibles</p>
          <p className="text-xs text-slate-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col overflow-hidden relative
      bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-100
      border-0 hover:shadow-2xl transition-all duration-500 group">

      {/* Décors géométriques */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-200/30 rounded-full -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-blue-200/20 rounded-full translate-y-14 -translate-x-14" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/20 via-transparent to-blue-100/20
          opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* ── Header ── */}
      <CardHeader className="relative z-10 p-3 sm:p-4 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:shadow-blue-300/50 group-hover:scale-105 transition-all duration-300">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 leading-tight">
                Calendrier de Paie
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Acompte & Virement mensuel</p>
            </div>
          </div>

          {/* Navigation année */}
          <div className="flex items-center gap-1 bg-white/70 border border-indigo-200/60 rounded-lg px-1 py-0.5 flex-shrink-0 shadow-sm">
            <button
              onClick={() => setYear(y => y - 1)}
              className="p-1 rounded hover:bg-indigo-100 transition-colors"
              aria-label="Année précédente"
            >
              <ChevronLeft className="h-3.5 w-3.5 text-indigo-400" />
            </button>
            <span className="text-xs font-bold text-slate-700 px-1 min-w-[2.8rem] text-center">{year}</span>
            <button
              onClick={() => setYear(y => y + 1)}
              className="p-1 rounded hover:bg-indigo-100 transition-colors"
              aria-label="Année suivante"
            >
              <ChevronRight className="h-3.5 w-3.5 text-indigo-400" />
            </button>
          </div>
        </div>
      </CardHeader>

      {/* ── Corps ── */}
      <CardContent className="relative z-10 flex flex-col p-3 sm:p-4 pt-0 flex-1 overflow-hidden">

        {/* État vide — aucun calendrier pour l'année */}
        {(!data?.exists || sorted.length === 0) && !loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-400 via-blue-500 to-violet-500 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-all duration-500">
              <CalendarX className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Aucun calendrier pour {year}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Les dates de paie n'ont pas encore été saisies
              </p>
            </div>
          </div>
        )}

        {/* Table des mois */}
        {data?.exists && sorted.length > 0 && (
          <div className="overflow-y-auto rounded-xl bg-white/60 border border-indigo-200/40 shadow-sm flex-1">
            <table className="w-full text-xs">
              <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-indigo-100">
                <tr>
                  <th className="text-left px-3 py-1.5 text-indigo-500 font-semibold">Mois</th>
                  <th className="text-center px-2 py-1.5 text-indigo-500 font-semibold">Acompte</th>
                  <th className="text-center px-2 py-1.5 text-indigo-500 font-semibold">Virement</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((m, i) => {
                  const isCurrent = year === currentYear && m.month === currentMonth
                  const isPast    = year < currentYear || (year === currentYear && m.month < currentMonth)
                  return (
                    <tr
                      key={m.month}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-indigo-100/80 border-l-2 border-indigo-500'
                          : isPast
                          ? 'opacity-40'
                          : i % 2 === 0 ? 'bg-transparent' : 'bg-blue-50/50'
                      }`}
                    >
                      <td className="px-3 py-1 text-left">
                        <span className={`font-medium ${isCurrent ? 'text-indigo-700' : 'text-slate-600'}`}>
                          {isCurrent && <span className="text-indigo-500 mr-1">▶</span>}
                          {MONTH_NAMES[m.month]}
                        </span>
                      </td>
                      <td className={`px-2 py-1 text-center font-semibold ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {pad(m.acompte_day)}
                      </td>
                      <td className={`px-2 py-1 text-center font-semibold ${isCurrent ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {pad(m.virement_day)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Bouton admin */}
      {isAdmin && (
        <button
          onClick={() => setIsModalOpen(true)}
          title="Modifier le calendrier de paie"
          className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-500 hover:text-indigo-600 shadow-md"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </Card>

    <PayrollEditModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      initialYear={year}
      onSaved={(updatedYear) => {
        if (updatedYear === year) load(year)
        else setYear(updatedYear)
      }}
    />
    </>
  )
}

// ── Modal édition calendrier de paie ──────────────────────────────────────────
interface PayrollEditModalProps {
  open:        boolean
  onClose:     () => void
  initialYear: number
  onSaved:     (year: number) => void
}

function PayrollEditModal({ open, onClose, initialYear, onSaved }: PayrollEditModalProps) {
  const confirm = useConfirm()
  const [modalYear, setModalYear]   = useState(initialYear)
  const [months, setMonths]         = useState<MonthEntry[]>([])
  const [loadingYear, setLoadingYear] = useState(false)
  const [isSaving, setIsSaving]     = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [showAdd, setShowAdd]       = useState(false)
  const [newMonth, setNewMonth]     = useState(0)
  const [newAcompte, setNewAcompte] = useState<number | ''>('')
  const [newVirement, setNewVirement] = useState<number | ''>('')

  // Charge les données quand l'année change dans le modal
  useEffect(() => {
    if (!open) return
    setLoadingYear(true)
    setModalError(null)
    setShowAdd(false)
    fetchPayroll(modalYear)
      .then(d => setMonths(d.months.slice().sort((a, b) => a.month - b.month)))
      .catch(() => setMonths([]))
      .finally(() => setLoadingYear(false))
  }, [open, modalYear])

  // Sync année initiale à chaque ouverture
  useEffect(() => {
    if (open) setModalYear(initialYear)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const usedMonths = new Set(months.map(m => m.month))
  const availableMonths = [1,2,3,4,5,6,7,8,9,10,11,12].filter(m => !usedMonths.has(m))

  const updateMonth = (monthNum: number, field: 'acompte_day' | 'virement_day', val: string) => {
    const n = Math.min(31, Math.max(1, parseInt(val) || 1))
    setMonths(prev => prev.map(m => m.month === monthNum ? { ...m, [field]: n } : m))
  }

  const deleteMonth = (monthNum: number) => {
    setMonths(prev => prev.filter(m => m.month !== monthNum))
  }

  const addMonth = () => {
    if (!newMonth || newAcompte === '' || newVirement === '') return
    const entry: MonthEntry = {
      month:        newMonth,
      acompte_day:  Math.min(31, Math.max(1, Number(newAcompte))),
      virement_day: Math.min(31, Math.max(1, Number(newVirement))),
    }
    setMonths(prev => [...prev, entry].sort((a, b) => a.month - b.month))
    setShowAdd(false)
    setNewMonth(0)
    setNewAcompte('')
    setNewVirement('')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setModalError(null)
    try {
      await savePayroll(modalYear, months)
      onSaved(modalYear)
      onClose()
    } catch {
      setModalError('Erreur lors de la sauvegarde.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ width: '520px', maxWidth: 'calc(100vw - 2rem)', maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-indigo-600" />
            Modifier le Calendrier de Paie
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">

          {/* Navigation année */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Année</span>
            <div className="flex items-center gap-1 bg-slate-100 border border-indigo-200/60 rounded-lg px-1 py-0.5">
              <button onClick={() => setModalYear(y => y - 1)} className="p-1 rounded hover:bg-indigo-100 transition-colors">
                <ChevronLeft className="h-4 w-4 text-indigo-400" />
              </button>
              <span className="text-sm font-bold text-slate-800 px-2 min-w-[3.5rem] text-center">{modalYear}</span>
              <button onClick={() => setModalYear(y => y + 1)} className="p-1 rounded hover:bg-indigo-100 transition-colors">
                <ChevronRight className="h-4 w-4 text-indigo-400" />
              </button>
            </div>
          </div>

          {/* Table des mois */}
          {loadingYear ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
            </div>
          ) : (
            <div className="rounded-xl border border-indigo-200/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-indigo-50 border-b border-indigo-100">
                  <tr>
                    <th className="text-left px-3 py-2 text-indigo-600 font-semibold">Mois</th>
                    <th className="text-center px-2 py-2 text-indigo-600 font-semibold">Acompte</th>
                    <th className="text-center px-2 py-2 text-indigo-600 font-semibold">Virement</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {months.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-sm text-slate-400">
                        Aucun mois configuré pour {modalYear}
                      </td>
                    </tr>
                  )}
                  {months.map((m, i) => (
                    <tr key={m.month} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="px-3 py-1.5 font-medium text-slate-700">
                        {MONTH_NAMES[m.month]}
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="number" min={1} max={31} value={m.acompte_day}
                          onChange={e => updateMonth(m.month, 'acompte_day', e.target.value)}
                          className="w-14 text-center px-1 py-0.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500 bg-white"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <input
                          type="number" min={1} max={31} value={m.virement_day}
                          onChange={e => updateMonth(m.month, 'virement_day', e.target.value)}
                          className="w-14 text-center px-1 py-0.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-indigo-500 bg-white"
                        />
                      </td>
                      <td className="px-2 py-1.5 text-center">
                        <button onClick={async () => {
                          if (await confirm({ message: `Supprimer ${MONTH_NAMES[m.month]} ?`, title: 'Supprimer le mois' })) deleteMonth(m.month)
                        }}
                          className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Formulaire ajout d'un mois */}
          {!loadingYear && (
            showAdd ? (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 space-y-3">
                <p className="text-xs font-semibold text-indigo-700">Ajouter un mois</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 font-medium">Mois</label>
                    <select
                      value={newMonth}
                      onChange={e => setNewMonth(parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                    >
                      <option value={0}>— Choisir —</option>
                      {availableMonths.map(m => (
                        <option key={m} value={m}>{MONTH_NAMES[m]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 font-medium">Acompte</label>
                    <input
                      type="number" min={1} max={31} placeholder="Jour"
                      value={newAcompte}
                      onChange={e => setNewAcompte(e.target.value === '' ? '' : parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-600 font-medium">Virement</label>
                    <input
                      type="number" min={1} max={31} placeholder="Jour"
                      value={newVirement}
                      onChange={e => setNewVirement(e.target.value === '' ? '' : parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAdd(false)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
                    Annuler
                  </button>
                  <button
                    onClick={addMonth}
                    disabled={!newMonth || newAcompte === '' || newVirement === ''}
                    className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            ) : (
              availableMonths.length > 0 && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 transition-colors font-medium"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter un mois
                </button>
              )
            )
          )}

          {modalError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {modalError}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Annuler</Button>
          <Button onClick={handleSave} disabled={isSaving || loadingYear}
            className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
