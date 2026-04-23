"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { PageLoader } from "@/components/ui/loader"
import { useJobs, OdooJob } from "@/hooks/useJobs"
import { API_CONFIG } from "@/lib/config"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Briefcase,
  MapPin,
  Calendar,
  Building2,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Upload,
  X,
  Clock,
  RefreshCw,
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

// ── Couleur déterministe par département ─────────────────────────────────────

const DEPT_COLORS: Record<string, string> = {
  default:          "bg-slate-100   text-slate-700",
  production:       "bg-blue-100    text-blue-800",
  maintenance:      "bg-orange-100  text-orange-800",
  finance:          "bg-emerald-100 text-emerald-800",
  informatique:     "bg-violet-100  text-violet-800",
  hse:              "bg-green-100   text-green-800",
  "ressources humaines": "bg-pink-100 text-pink-800",
  juridique:        "bg-amber-100   text-amber-800",
  approvisionnements: "bg-cyan-100  text-cyan-800",
  technique:        "bg-indigo-100  text-indigo-800",
}

function deptColor(name: string | null): string {
  if (!name) return DEPT_COLORS.default
  const key = name.toLowerCase()
  for (const k of Object.keys(DEPT_COLORS)) {
    if (key.includes(k)) return DEPT_COLORS[k]
  }
  return DEPT_COLORS.default
}

// ── Formulaire de candidature inline ─────────────────────────────────────────

interface InlineFormProps {
  job: OdooJob
  onClose: () => void
}

function InlineApplyForm({ job, onClose }: InlineFormProps) {
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
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 border border-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">Candidature envoyée !</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            Votre dossier pour <span className="font-medium text-gray-700">{job.name}</span> a bien été transmis. Nous reviendrons vers vous.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onClose} className="mt-1">Fermer</Button>
      </div>
    )
  }

  const inputClass = "w-full h-10 rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#344256] focus:ring-2 focus:ring-[#344256]/15 transition-colors"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Nom + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Nom complet <span className="text-red-400">*</span>
          </label>
          <input required placeholder="Prénom Nom" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Email <span className="text-red-400">*</span>
          </label>
          <input required type="email" placeholder="votre@email.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className={inputClass} />
        </div>
      </div>

      {/* Téléphone */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Téléphone</label>
        <input type="tel" placeholder="+221 77 000 00 00" value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          className={inputClass} />
      </div>

      {/* Lettre de motivation */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Lettre de motivation</label>
        <textarea rows={4} placeholder="Expliquez pourquoi vous correspondez à ce poste..."
          value={form.cover_letter}
          onChange={e => setForm(f => ({ ...f, cover_letter: e.target.value }))}
          className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#344256] focus:ring-2 focus:ring-[#344256]/15 resize-none transition-colors"
        />
      </div>

      {/* CV upload */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
          CV <span className="normal-case font-normal text-gray-400">(PDF / DOC — max 10 Mo)</span>
        </label>
        <label className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed cursor-pointer transition-all ${
          cvFile
            ? 'border-[#344256]/40 bg-[#344256]/5'
            : 'border-gray-200 hover:border-[#344256]/40 hover:bg-gray-50'
        }`}>
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md ${
            cvFile ? 'bg-[#344256]/10' : 'bg-gray-100'
          }`}>
            <Upload className={`h-4 w-4 ${cvFile ? 'text-[#344256]' : 'text-gray-400'}`} />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${cvFile ? 'text-[#344256]' : 'text-gray-500'}`}>
              {cvFile ? cvFile.name : 'Cliquez pour sélectionner votre CV'}
            </p>
            {cvFile && (
              <p className="text-xs text-gray-400 mt-0.5">
                {(cvFile.size / 1024 / 1024).toFixed(2)} Mo
              </p>
            )}
          </div>
          <input type="file" accept=".pdf,.doc,.docx" className="hidden"
            onChange={e => setCvFile(e.target.files?.[0] || null)} />
        </label>
      </div>

      {/* Erreur */}
      {result === 'error' && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
          <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {errorMsg}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}
          className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50">
          Annuler
        </Button>
        <Button type="submit" disabled={submitting}
          className="flex-2 gap-1.5 px-6" style={{ backgroundColor: '#344256' }}>
          {submitting
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Envoi en cours...</>
            : <><Send className="h-3.5 w-3.5" />Envoyer ma candidature</>
          }
        </Button>
      </div>
    </form>
  )
}

// ── Card d'une offre ─────────────────────────────────────────────────────────

function JobCard({ job }: { job: OdooJob }) {
  const [applying, setApplying] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const hasDeadline = job.publication_end_date && job.publication_end_date !== 'False'
  const hasStartDate = job.publication_start_date && job.publication_start_date !== 'False'
  const description = job.job_description || job.description || ''

  return (
    <Card id={`job-${job.odoo_id}`} className="rounded-xl overflow-hidden w-full bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-0">

        {/* Barre accent */}
        <div className="h-1" style={{ backgroundColor: '#344256' }} />

        <div className="px-5 sm:px-6 py-5">

          {/* Ligne 1 : département + deadline */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${deptColor(job.department_name)}`}>
                <Building2 className="h-3 w-3" />
                {job.department_name || 'Non renseigné'}
              </span>
              {job.no_of_recruitment > 1 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                  {job.no_of_recruitment} postes
                </span>
              )}
            </div>
            {hasDeadline && (
              <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium text-red-700 bg-red-50 border border-red-100">
                <Clock className="w-3 h-3" />
                Clôture le {job.publication_end_date}
              </span>
            )}
          </div>

          {/* Titre du poste */}
          <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
            {job.name}
          </h3>

          {/* Meta : localisation + date d'ouverture */}
          {(job.address || hasStartDate) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-4">
              {job.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />{job.address}
                </span>
              )}
              {hasStartDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />Ouvert depuis le {job.publication_start_date}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <>
              <div
                className={`text-sm text-gray-600 leading-relaxed
                           [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ul]:my-1.5
                           [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-1.5
                           [&_li]:text-gray-600 [&_li]:text-sm
                           [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:text-sm [&_p]:leading-relaxed
                           [&_b]:font-semibold [&_b]:text-gray-800
                           [&_strong]:font-semibold [&_strong]:text-gray-800
                           [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-gray-800 [&_h1]:mt-4 [&_h1]:mb-2
                           [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-gray-800 [&_h2]:mt-3 [&_h2]:mb-1.5
                           [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-gray-700 [&_h3]:mt-2.5 [&_h3]:mb-1
                           ${!expanded ? 'line-clamp-5' : ''}`}
                dangerouslySetInnerHTML={{ __html: description }}
              />
              <button
                onClick={() => setExpanded(e => !e)}
                className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {expanded ? '↑ Réduire' : '↓ Voir la description complète'}
              </button>
            </>
          )}

          {/* Séparateur + bouton postuler */}
          {!applying && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Button
                size="sm"
                onClick={() => setApplying(true)}
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                Postuler à ce poste
              </Button>
            </div>
          )}
        </div>

        {/* Formulaire inline */}
        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${applying ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="border-t px-5 sm:px-6 py-5" style={{ borderColor: '#344256', backgroundColor: '#f8f9fb' }}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: '#344256' }}>
                    <Send className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#344256' }}>Déposer ma candidature</p>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5">{job.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setApplying(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                  aria-label="Fermer le formulaire"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <InlineApplyForm job={job} onClose={() => setApplying(false)} />
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}

// ── Page principale ──────────────────────────────────────────────────────────

const PAGE_SIZE = 10

interface RecrutementPageContentProps {
  search: string
  onClearSearch: () => void
}

function RecrutementPageContent({ search, onClearSearch }: RecrutementPageContentProps) {
  const { jobs, loading, error, refetch } = useJobs()
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const filtered = jobs.filter(job =>
    job.name.toLowerCase().includes(search.toLowerCase()) ||
    (job.department_name || '').toLowerCase().includes(search.toLowerCase())
  )

  // Réinitialiser quand la recherche change
  const [prevSearch, setPrevSearch] = useState(search)
  if (search !== prevSearch) { setPrevSearch(search); setVisibleCount(PAGE_SIZE) }

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  const loadMore = useCallback(() => {
    setVisibleCount(n => Math.min(n + PAGE_SIZE, filtered.length))
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">

      {/* Nombre de postes */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#344256' }}></div>
          <h2 className="text-base font-semibold text-gray-900">
            {search ? `Résultats pour « ${search} »` : 'Tous les postes'}
          </h2>
          <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: '#344256' }}>
            {filtered.length}
          </span>
        </div>
      )}

      {/* Chargement initial */}
      {loading && <PageLoader />}

      {/* Erreur */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={refetch} className="text-sm text-gray-500 underline">Réessayer</button>
        </div>
      )}

      {/* Vide */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
            <Briefcase className="h-7 w-7 text-gray-400" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">
              {search ? 'Aucun résultat pour cette recherche' : 'Aucun poste à pourvoir en ce moment'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {search ? "Essayez d'autres mots-clés." : 'Revenez bientôt pour découvrir de nouvelles opportunités.'}
            </p>
          </div>
          {search && (
            <Button variant="outline" size="sm" onClick={onClearSearch}>
              Effacer la recherche
            </Button>
          )}
        </div>
      )}

      {/* Liste des offres */}
      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4 pb-2">
          {visible.map(job => (
            <JobCard key={job.odoo_id} job={job} />
          ))}
        </div>
      )}

      {/* Sentinel infinite scroll */}
      {!loading && !error && hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {/* Fin de liste */}
      {!loading && !error && !hasMore && filtered.length > PAGE_SIZE && (
        <p className="text-center text-sm text-gray-400 pb-8">Tous les postes sont affichés</p>
      )}
    </div>
  )
}

export default function RecrutementPage() {
  const [search, setSearch] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)

  const handleSync = async () => {
    if (isSyncing) return
    setIsSyncing(true)
    setSyncSuccess(false)
    try {
      const res = await fetch(`${API_CONFIG.RECRUTEMENT}/jobs/sync/`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      setSyncSuccess(true)
      setTimeout(() => setSyncSuccess(false), 3000)
    } catch {
      alert("Erreur lors de la synchronisation des offres.")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <LayoutWrapper
      secondaryNavbarProps={{
        searchTerm: search,
        onSearchChange: setSearch,
        searchPlaceholder: 'Rechercher un poste, un département...',
        rightActions: isAdmin ? (
          <div className="flex items-center gap-2">
            {syncSuccess && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <span>✓</span>
                <span className="hidden sm:inline">Synchronisé !</span>
              </span>
            )}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              title="Synchroniser les offres depuis Odoo"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors duration-150 text-xs font-medium disabled:cursor-not-allowed ${
                syncSuccess
                  ? 'border-green-400 bg-green-50 text-green-600'
                  : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-blue-600 hover:border-blue-400 disabled:opacity-50'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'En cours...' : syncSuccess ? 'Terminé' : 'Sync Odoo'}
              </span>
            </button>
          </div>
        ) : undefined,
      }}
    >
      <RecrutementPageContent
        search={search}
        onClearSearch={() => setSearch('')}
      />
    </LayoutWrapper>
  )
}
