"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Briefcase, ArrowRight, Loader2, Ban, MapPin, Users,
  ChevronLeft, ChevronRight, RefreshCw, Send, Upload,
  CheckCircle2, XCircle, Building2, Clock, Calendar,
} from "lucide-react"
import { useJobs, OdooJob } from "@/hooks/useJobs"
import { useAuth } from "@/hooks/useAuth"
import { API_CONFIG } from "@/lib/config"
import { useToast } from "@/components/ui/toast"
import Link from "next/link"

const PAGE_SIZE = 3

// ── Formulaire de candidature ─────────────────────────────────────────────────

function ApplyForm({ job, onClose }: { job: OdooJob; onClose: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', cover_letter: '' })
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<'success' | 'error' | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    setErrorMsg('')
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('email', form.email)
      if (form.phone) fd.append('phone', form.phone)
      if (form.cover_letter) fd.append('cover_letter', form.cover_letter)
      if (cvFile) fd.append('cv', cvFile)

      const res = await fetch(`${API_CONFIG.RECRUTEMENT}/jobs/${job.odoo_id}/apply/`, {
        method: 'POST', body: fd, credentials: 'include',
      })
      const data = await res.json()
      if (res.ok && data.success) setResult('success')
      else { setResult('error'); setErrorMsg(data.error || 'Une erreur est survenue.') }
    } catch {
      setResult('error'); setErrorMsg('Impossible de contacter le serveur.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <div>
          <p className="font-semibold text-gray-900 text-base">Candidature envoyée !</p>
          <p className="text-sm text-gray-500 mt-1">
            Votre dossier pour <strong>{job.name}</strong> a bien été transmis.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>Fermer</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Nom complet *</label>
          <input required placeholder="Prénom Nom" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-colors" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Email *</label>
          <input required type="email" placeholder="votre@email.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-colors" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Téléphone</label>
        <input type="tel" placeholder="+221 77 000 00 00" value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          className="w-full h-9 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 transition-colors" />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Lettre de motivation</label>
        <textarea rows={3} placeholder="Expliquez pourquoi vous correspondez à ce poste..."
          value={form.cover_letter}
          onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-200 resize-none transition-colors" />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">CV (PDF / DOC — max 10 Mo)</label>
        <label className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-orange-400 hover:bg-orange-50/50 cursor-pointer transition-colors">
          <Upload className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-500 truncate">
            {cvFile ? cvFile.name : 'Cliquez pour sélectionner votre CV'}
          </span>
          <input type="file" accept=".pdf,.doc,.docx" className="hidden"
            onChange={e => setCvFile(e.target.files?.[0] || null)} />
        </label>
      </div>

      {result === 'error' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {errorMsg}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={submitting} className="flex-1">
          Annuler
        </Button>
        <Button type="submit" size="sm" disabled={submitting}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white">
          {submitting
            ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Envoi...</>
            : <><Send className="h-3.5 w-3.5 mr-1.5" />Envoyer ma candidature</>
          }
        </Button>
      </div>
    </form>
  )
}

// ── Modal candidature ─────────────────────────────────────────────────────────

function JobApplyModal({ job, onClose }: { job: OdooJob | null; onClose: () => void }) {
  if (!job) return null

  const hasDeadline  = job.publication_end_date  && job.publication_end_date  !== 'False'
  const hasStartDate = job.publication_start_date && job.publication_start_date !== 'False'

  return (
    <Dialog open={!!job} onOpenChange={onClose}>
      <DialogContent style={{ width: '560px', maxWidth: 'calc(100vw - 2rem)', maxHeight: '90vh', overflowY: 'auto' }}>
        <DialogHeader>
          <DialogTitle className="flex items-start gap-3 pr-6">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex-shrink-0">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900">{job.name}</span>
                {job.is_internal ? (
                  <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Interne
                  </span>
                ) : (
                  <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                    Publié
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {job.department_name && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Building2 className="h-3 w-3" />{job.department_name}
                  </span>
                )}
                {job.address && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />{job.address}
                  </span>
                )}
                {hasStartDate && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />Depuis le {job.publication_start_date}
                  </span>
                )}
                {hasDeadline && (
                  <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                    <Clock className="h-3 w-3" />Clôture le {job.publication_end_date}
                  </span>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="border-t border-gray-100 pt-4">
          <ApplyForm job={job} onClose={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Widget principal ──────────────────────────────────────────────────────────

export function RecruitmentWidget() {
  const { jobs, loading, error, refetch } = useJobs()
  const { success, error: toastError } = useToast()
  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)
  const [page, setPage] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [selectedJob, setSelectedJob] = useState<OdooJob | null>(null)

  const handleSync = async () => {
    if (syncing) return
    setSyncing(true)
    try {
      const res = await fetch(`${API_CONFIG.RECRUTEMENT}/jobs/sync/`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`)
      await refetch()
      const msg = data.synced !== undefined
        ? `${data.synced} offre${data.synced > 1 ? 's' : ''} synchronisée${data.synced > 1 ? 's' : ''} depuis Odoo`
        : "Les offres d'emploi ont été mises à jour"
      success("Synchronisation réussie", msg)
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Impossible de contacter Odoo."
      toastError("Échec de la synchronisation", msg)
    } finally {
      setSyncing(false)
    }
  }

  const totalPages = Math.ceil(jobs.length / PAGE_SIZE)
  const pageJobs = jobs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="contents">
    <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col overflow-hidden relative bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-0 hover:shadow-2xl transition-all duration-500 group">
      {/* Motifs décoratifs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-300/30 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-red-300/30 rounded-full translate-y-12 -translate-x-12" />
      </div>

      <CardHeader className="relative pb-2 pt-4 px-5 flex-shrink-0 z-10">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-orange-300/50 group-hover:scale-105 transition-all duration-300">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 leading-tight">
                Recrutements Internes
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Opportunités de carrière
              </p>
            </div>
          </div>
          <Link href="/recrutement">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex text-orange-600 border-orange-200 hover:bg-orange-50 font-semibold text-xs"
            >
              Voir tous les détails
              <ArrowRight className="h-3 w-3 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="relative flex-1 flex flex-col z-10 p-3 sm:p-4 pt-0 overflow-hidden">
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        )}

        {!loading && (error || jobs.length === 0) && (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-xl group-hover:scale-110 transition-all duration-500">
              <Ban className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-orange-700 transition-colors">
                Pas de poste à pourvoir en ce moment
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Revenez bientôt pour de nouvelles opportunités
              </p>
            </div>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Compteur */}
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
                <Users className="h-3 w-3 mr-1" />
                {jobs.length} poste{jobs.length > 1 ? 's' : ''} ouvert{jobs.length > 1 ? 's' : ''}
              </Badge>
              {totalPages > 1 && (
                <span className="text-[10px] text-slate-500">
                  {page + 1} / {totalPages}
                </span>
              )}
            </div>

            {/* Liste des postes */}
            <div className="flex-1 flex flex-col gap-1 overflow-hidden">
              {pageJobs.map((job) => (
                <button
                  key={job.odoo_id}
                  onClick={() => setSelectedJob(job)}
                  className="group/item w-full flex items-start justify-between p-2.5 rounded-lg bg-white/80 hover:bg-white border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-200 text-left"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-slate-800 group-hover/item:text-orange-700 transition-colors line-clamp-1">
                        {job.name}
                      </p>
                      {job.is_internal ? (
                        <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                          Interne
                        </span>
                      ) : (
                        <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                          Publié
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {job.department_name && (
                        <span className="text-[10px] text-slate-500 line-clamp-1">{job.department_name}</span>
                      )}
                      {job.address && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          {job.address}
                        </span>
                      )}
                    </div>
                  </div>
                  <Send className="h-3.5 w-3.5 text-orange-300 flex-shrink-0 mt-0.5 group-hover/item:text-orange-500 transition-colors" />
                </button>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex-shrink-0 mt-2">
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-2">
                  <Button variant="outline" size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="flex-1 h-7 text-xs text-orange-600 border-orange-200 hover:bg-orange-50 disabled:opacity-40">
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />Précédent
                  </Button>
                  <Button variant="outline" size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page === totalPages - 1}
                    className="flex-1 h-7 text-xs text-orange-600 border-orange-200 hover:bg-orange-50 disabled:opacity-40">
                    Suivant<ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Bouton synchronisation manuelle Odoo — admin uniquement */}
      {isAdmin && (
        <button
          onClick={handleSync}
          disabled={syncing || loading}
          title="Synchroniser avec Odoo"
          className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg bg-white/90 hover:bg-white shadow-md disabled:cursor-not-allowed"
        >
          {syncing
            ? <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
            : <RefreshCw className="h-4 w-4 text-gray-400 hover:text-orange-500 transition-colors" />
          }
        </button>
      )}
    </Card>

    <JobApplyModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  )
}
