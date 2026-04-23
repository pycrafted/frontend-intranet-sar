"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { AuthGuard } from '@/components/auth-guard'
import { PageLoader } from '@/components/ui/loader'
import { useAuth } from '@/hooks/useAuth'
import { useAdminUsers, AdminUser } from '@/hooks/useAdminUsers'
import { API_CONFIG } from '@/lib/config'
import {
  Users,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const PAGE_SIZE = 20

type SortKey = 'name' | 'email' | 'department' | 'status' | 'role'
type SortDir = 'asc' | 'desc'

export default function UtilisateursPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { users, loading, error, fetchUsers, toggleActive, toggleSuperuser } = useAdminUsers()

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [page, setPage] = useState(1)
  const [syncing, setSyncing] = useState(false)
  const [syncLogs, setSyncLogs] = useState<{ type: string; msg: string }[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  const isAdmin = !!(user?.is_superuser)

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [syncLogs])

  async function handleSyncLdap() {
    setSyncing(true)
    setSyncLogs([])
    try {
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? null
      const res = await fetch(`${API_CONFIG.AUTH}/admin/sync-ldap/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}) },
      })
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('Pas de stream')
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const evt = JSON.parse(line.slice(6))
              setSyncLogs(prev => [...prev, evt])
              if (evt.type === 'done' || evt.type === 'error') {
                setSyncing(false)
                if (evt.type === 'done') fetchUsers()
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch (err: any) {
      setSyncLogs(prev => [...prev, { type: 'error', msg: err?.message ?? 'Erreur inconnue' }])
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    if (user && !isAdmin) {
      router.replace('/')
    }
  }, [user, isAdmin, router])

  useEffect(() => {
    if (isAdmin) fetchUsers()
  }, [isAdmin, fetchUsers])

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleToggleActive = async (u: AdminUser) => {
    setActionLoading(u.id)
    try {
      await toggleActive(u.id, !u.is_active)
      showToast(`Compte ${!u.is_active ? 'activé' : 'désactivé'} avec succès`)
    } catch {
      showToast('Erreur lors de la mise à jour du compte', false)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleSuperuser = async (u: AdminUser) => {
    setActionLoading(u.id)
    try {
      await toggleSuperuser(u.id, !u.is_superuser)
      showToast(`Superadmin ${!u.is_superuser ? 'activé' : 'retiré'} avec succès`)
    } catch {
      showToast('Erreur lors de la mise à jour', false)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(1)
  }

  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(1)
  }

  const fullName = (u: AdminUser) =>
    [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username

  const filtered = users
    .filter(u => {
      const q = search.toLowerCase()
      return (
        fullName(u).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department?.name ?? '').toLowerCase().includes(q)
      )
    })
    .sort((a, b) => {
      let va = '', vb = ''
      if (sortKey === 'name') { va = fullName(a); vb = fullName(b) }
      else if (sortKey === 'email') { va = a.email; vb = b.email }
      else if (sortKey === 'department') { va = a.department?.name ?? ''; vb = b.department?.name ?? '' }
      else if (sortKey === 'status') { va = a.is_active ? '1' : '0'; vb = b.is_active ? '1' : '0' }
      else if (sortKey === 'role') { va = a.is_superuser ? '1' : '0'; vb = b.is_superuser ? '1' : '0' }
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5 inline ml-1" /> : <ChevronDown className="w-3.5 h-3.5 inline ml-1" />
      : <ChevronUp className="w-3.5 h-3.5 inline ml-1 opacity-30" />

  if (!isAdmin && user) return null

  if (loading && users.length === 0) {
    return (
      <AuthGuard>
        <LayoutWrapper>
          <PageLoader />
        </LayoutWrapper>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <LayoutWrapper
        secondaryNavbarProps={{
          searchTerm: search,
          onSearchChange: handleSearch,
          searchPlaceholder: 'Rechercher par nom, email ou département...',
          isTyping: false,
          showTimeFilter: false,
          showDepartmentFilter: false,
          rightActions: (
            <button
              onClick={handleSyncLdap}
              disabled={syncing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-[#344256] transition-all bg-white disabled:opacity-60 disabled:cursor-wait"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sync...' : 'Sync LDAP'}
            </button>
          ),
        }}
      >
        <div className="w-full max-w-4xl mx-auto space-y-6 px-4 py-6">

          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#344256' }}></div>
            <h2 className="text-base font-semibold text-gray-900">
              {search ? `Résultats pour « ${search} »` : 'Gestion des utilisateurs'}
            </h2>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: '#344256' }}>
              {filtered.length}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* État vide / chargement */}
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Chargement...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
              <Users className="w-8 h-8 opacity-40" />
              <p className="text-sm">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <>
              {/* ── Vue tableau (sm+) ── */}
              <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                <div className="bg-white">
                  <div
                    className="grid text-xs font-semibold text-white uppercase tracking-wider px-4 py-3"
                    style={{ backgroundColor: '#344256', gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr' }}
                  >
                    {([
                      { key: 'name' as SortKey, label: 'Nom' },
                      { key: 'email' as SortKey, label: 'Email' },
                      { key: 'role' as SortKey, label: 'Admin' },
                      { key: 'status' as SortKey, label: 'Statut' },
                    ] as const).map(({ key, label }) => (
                      <button key={key} onClick={() => handleSort(key)} className="text-left hover:text-white/80 transition-colors">
                        {label}<SortIcon k={key} />
                      </button>
                    ))}
                    <span className="text-right">Actions</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {paginated.map(u => (
                      <div
                        key={u.id}
                        className="grid items-center px-4 py-3 hover:bg-gray-50 transition-colors text-sm"
                        style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr' }}
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{fullName(u)}</p>
                          {u.matricule && <p className="text-xs text-gray-400">{u.matricule}</p>}
                        </div>
                        <p className="text-gray-500 truncate pr-2">{u.email || '—'}</p>
                        <div>
                          {u.is_superuser
                            ? <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#34425618] text-[#344256]"><ShieldCheck className="w-3 h-3" />Oui</span>
                            : <span className="text-xs text-gray-400">Non</span>}
                        </div>
                        <div>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {u.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {u.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-1.5">
                          {u.id !== (user as any)?.id ? (
                            <>
                              <button onClick={() => handleToggleSuperuser(u)} disabled={actionLoading === u.id}
                                title={u.is_superuser ? 'Retirer superadmin' : 'Accorder superadmin'}
                                className={`p-1.5 rounded-lg transition-all ${u.is_superuser ? 'bg-[#34425618] text-[#344256] hover:bg-[#344256]/20' : 'bg-gray-100 text-gray-500 hover:bg-[#34425618] hover:text-[#344256]'} disabled:opacity-50`}>
                                {actionLoading === u.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : u.is_superuser ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => handleToggleActive(u)} disabled={actionLoading === u.id}
                                title={u.is_active ? 'Désactiver' : 'Activer'}
                                className={`p-1.5 rounded-lg transition-all ${u.is_active ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'} disabled:opacity-50`}>
                                {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                            </>
                          ) : <span className="text-xs text-gray-300 pr-1">Vous</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Pagination tableau */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5" style={{ backgroundColor: '#344256' }}>
                      <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        <ChevronLeft className="w-4 h-4" /> Précédent
                      </button>
                      <span className="text-xs text-white/60">{safePage} / {totalPages}</span>
                      <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                        Suivant <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Vue cartes (mobile) ── */}
              <div className="sm:hidden rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {paginated.map(u => (
                    <div key={u.id} className="bg-white px-4 py-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-gray-800 truncate">{fullName(u)}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email || '—'}</p>
                          {u.department?.name && <p className="text-xs text-gray-400 truncate">{u.department.name}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {u.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            {u.is_active ? 'Actif' : 'Inactif'}
                          </span>
                          {u.is_superuser && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#34425618] text-[#344256]">
                              <ShieldCheck className="w-3 h-3" />Admin
                            </span>
                          )}
                        </div>
                      </div>
                      {u.id !== (user as any)?.id && (
                        <div className="flex gap-2 pt-1 border-t border-gray-100">
                          <button onClick={() => handleToggleSuperuser(u)} disabled={actionLoading === u.id}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${u.is_superuser ? 'bg-[#34425618] text-[#344256]' : 'bg-gray-100 text-gray-500'} disabled:opacity-50`}>
                            {actionLoading === u.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : u.is_superuser ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            {u.is_superuser ? 'Retirer admin' : 'Rendre admin'}
                          </button>
                          <button onClick={() => handleToggleActive(u)} disabled={actionLoading === u.id}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${u.is_active ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'} disabled:opacity-50`}>
                            {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            {u.is_active ? 'Désactiver' : 'Activer'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Pagination cartes */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5" style={{ backgroundColor: '#344256' }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <ChevronLeft className="w-4 h-4" /> Précédent
                    </button>
                    <span className="text-xs text-white/60">{safePage} / {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      Suivant <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
            toast.ok ? 'bg-[#344256]' : 'bg-red-500'
          }`}>
            {toast.ok ? <UserCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}

        {/* Panneau logs LDAP */}
        {syncLogs.length > 0 && (
          <div style={{
            position: 'fixed', bottom: 16, right: 16, left: 16, width: 'auto', maxWidth: 440, maxHeight: 320,
            marginLeft: 'auto',
            background: '#1e293b', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            display: 'flex', flexDirection: 'column', zIndex: 9999,
            border: '1.5px solid #334155', overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderBottom: '1px solid #334155', flexShrink: 0,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
                LOGS — SYNC LDAP {syncing && <span style={{ color: '#60a5fa' }}>● en cours…</span>}
              </span>
              <button
                type="button"
                onClick={() => setSyncLogs([])}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 0 }}
              >✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6 }}>
              {syncLogs.map((log, i) => (
                <div key={i} style={{
                  color: (log.type === 'error' || log.type === 'error_log') ? '#f87171' : log.type === 'done' ? '#4ade80' : '#cbd5e1',
                  wordBreak: 'break-all',
                }}>
                  {log.type === 'done' ? '✓ ' : (log.type === 'error' || log.type === 'error_log') ? '✗ ' : '› '}{log.msg}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </LayoutWrapper>
    </AuthGuard>
  )
}
