"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { LayoutWrapper } from "@/components/layout-wrapper"
import { Card } from "@/components/ui/card"
import { Phone, Smartphone, Search, Mail, Pencil, EyeOff, Eye, RefreshCw } from "lucide-react"
import { useEmployees, Employee } from "@/hooks/useEmployees"
import { StandardLoader } from "@/components/ui/standard-loader"
import { useConfirm } from "@/components/ui/confirm-dialog"


const INPUT_STYLE: React.CSSProperties = {
  width: "100%", fontSize: 10, padding: "3px 6px", borderRadius: 6,
  border: "1.5px solid #94a3b8", outline: "none", color: "#344256",
  background: "#ffffff", boxSizing: "border-box",
}

/* ── Card employé — style organigramme ── */
function EmployeeCard({ employee, isAdmin, editMode, onSave }: {
  employee: Employee
  isAdmin: boolean
  editMode: boolean
  onSave: (id: number, data: Partial<Employee>) => Promise<void>
}) {
  const confirm = useConfirm()
  const [hovered, setHovered] = useState(false)
  const [draft, setDraft] = useState({
    first_name: employee.first_name ?? "",
    last_name: employee.last_name ?? "",
    position_title: employee.position_title ?? "",
    email: employee.email ?? "",
    phone_fixed: employee.phone_fixed ?? "",
    phone_mobile: employee.phone_mobile ?? "",
  })
  const [saving, setSaving] = useState(false)

  // Sync draft when employee data changes (e.g. after save)
  useEffect(() => {
    setDraft({
      first_name: employee.first_name ?? "",
      last_name: employee.last_name ?? "",
      position_title: employee.position_title ?? "",
      email: employee.email ?? "",
      phone_fixed: employee.phone_fixed ?? "",
      phone_mobile: employee.phone_mobile ?? "",
    })
  }, [employee])

  const [togglingActive, setTogglingActive] = useState(false)

  async function handleToggleActive(e: React.MouseEvent) {
    e.stopPropagation()
    const action = inactive ? "réactiver" : "désactiver"
    if (!await confirm({ message: `Voulez-vous ${action} la card de ${employee.full_name} ?`, title: 'Confirmer', variant: 'warning', confirmLabel: 'Confirmer' })) return
    setTogglingActive(true)
    try {
      await onSave(employee.id, { is_active: !employee.is_active })
    } catch {
      alert(`Impossible de ${action} cette fiche. Essayez de rafraîchir la page.`)
    } finally {
      setTogglingActive(false)
    }
  }

  async function handleBlurSave(field: keyof typeof draft) {
    const original: Record<string, string | null | undefined> = {
      first_name: employee.first_name,
      last_name: employee.last_name,
      position_title: employee.position_title,
      email: employee.email,
      phone_fixed: employee.phone_fixed,
      phone_mobile: employee.phone_mobile,
    }
    if (draft[field] === (original[field] ?? "")) return
    setSaving(true)
    try {
      const nullableFields = ["phone_fixed", "phone_mobile"]
      await onSave(employee.id, { [field]: draft[field] || (nullableFields.includes(field) ? null : undefined) })
    } finally {
      setSaving(false)
    }
  }

  function openEmail(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (employee.email) {
      window.open(
        "https://outlook.office.com/mail/deeplink/compose?to=" + encodeURIComponent(employee.email),
        "_blank", "noopener,noreferrer"
      )
    }
  }

  const inactive = employee.is_active === false

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 8, padding: "14px 12px 12px", borderRadius: 14,
        border: "2px solid " + (inactive ? "#e2e8f0" : editMode ? "#344256" : hovered ? "#94a3b8" : "#dde3ee"),
        background: inactive ? "#f1f5f9" : "#ffffff",
        boxShadow: inactive ? "none" : hovered ? "0 6px 20px rgba(0,0,0,.12)" : "0 2px 10px rgba(0,0,0,.08)",
        opacity: inactive ? 0.45 : 1,
        transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s, opacity 0.2s",
        cursor: "default", textAlign: "center", boxSizing: "border-box",
      }}
    >
      {/* Bouton désactivation — admin seulement, masqué en mode édition */}
      {isAdmin && !editMode && (
        <button
          type="button"
          onClick={handleToggleActive}
          disabled={togglingActive}
          title={inactive ? "Réactiver cette card" : "Désactiver cette card"}
          style={{
            position: "absolute", top: 7, right: 7,
            width: 22, height: 22, borderRadius: 6,
            border: "1.5px solid " + (inactive ? "#94a3b8" : "#dde3ee"),
            background: inactive ? "#e2e8f0" : "#fff",
            color: inactive ? "#344256" : "#94a3b8",
            cursor: togglingActive ? "wait" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0, transition: "all 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#344256"; e.currentTarget.style.color = "#344256" }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = inactive ? "#94a3b8" : "#dde3ee"
            e.currentTarget.style.color = inactive ? "#344256" : "#94a3b8"
          }}
        >
          {inactive ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
      )}

      {/* Nom */}
      {editMode ? (
        <div style={{ width: "100%", display: "flex", gap: 4, paddingRight: isAdmin ? 16 : 0 }}>
          <input
            style={{ ...INPUT_STYLE, fontWeight: 700, fontSize: 11 }}
            value={draft.first_name}
            placeholder="Prénom"
            onChange={e => setDraft(d => ({ ...d, first_name: e.target.value }))}
            onBlur={() => handleBlurSave("first_name")}
          />
          <input
            style={{ ...INPUT_STYLE, fontWeight: 700, fontSize: 11 }}
            value={draft.last_name}
            placeholder="Nom"
            onChange={e => setDraft(d => ({ ...d, last_name: e.target.value }))}
            onBlur={() => handleBlurSave("last_name")}
          />
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 13, fontWeight: 800, lineHeight: 1.35, color: "#344256", wordBreak: "break-word", width: "100%", paddingRight: isAdmin ? 16 : 0 }}>
          {employee.full_name}
        </p>
      )}

      {/* Séparateur */}
      <div style={{ width: "75%", height: 1, background: "#e2e8f0", flexShrink: 0 }} />

      {/* Poste */}
      {editMode ? (
        <input
          style={INPUT_STYLE}
          value={draft.position_title}
          placeholder="Poste"
          onChange={e => setDraft(d => ({ ...d, position_title: e.target.value }))}
          onBlur={() => handleBlurSave("position_title")}
        />
      ) : employee.position_title ? (
        <p style={{ margin: 0, fontSize: 11, fontWeight: 500, lineHeight: 1.35, color: "#475569", wordBreak: "break-word", width: "100%" }}>
          {employee.position_title}
        </p>
      ) : null}

      {/* Badge direction (non éditable) */}
      {employee.main_direction_name && (
        <span style={{
          fontSize: 10, fontWeight: 500, lineHeight: 1.4,
          padding: "3px 9px", borderRadius: 99,
          background: "#e8ecf0", color: "#344256",
          wordBreak: "break-word", display: "block",
        }}>
          {employee.main_direction_name}
        </span>
      )}

      {/* Séparateur contacts */}
      <div style={{ width: "100%", height: 1, background: "#f1f5f9", flexShrink: 0 }} />

      {/* Contacts */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 4 }}>
        {editMode ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Mail size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
              <input style={INPUT_STYLE} value={draft.email} placeholder="Email" onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} onBlur={() => handleBlurSave("email")} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Phone size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
              <input style={INPUT_STYLE} value={draft.phone_fixed} placeholder="Tél. fixe" onChange={e => setDraft(d => ({ ...d, phone_fixed: e.target.value }))} onBlur={() => handleBlurSave("phone_fixed")} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Smartphone size={11} style={{ color: "#94a3b8", flexShrink: 0 }} />
              <input style={INPUT_STYLE} value={draft.phone_mobile} placeholder="Mobile" onChange={e => setDraft(d => ({ ...d, phone_mobile: e.target.value }))} onBlur={() => handleBlurSave("phone_mobile")} />
            </div>
          </>
        ) : (
          [
            { icon: <Mail size={11} />, value: employee.email, href: employee.email ? "#" : null, onClick: employee.email ? openEmail : undefined },
            { icon: <Phone size={11} />, value: employee.phone_fixed, href: employee.phone_fixed ? "tel:" + employee.phone_fixed : null },
            { icon: <Smartphone size={11} />, value: employee.phone_mobile, href: employee.phone_mobile ? "tel:" + employee.phone_mobile : null },
          ].map((row, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "#64748b" }}>
              <span style={{ color: "#94a3b8", flexShrink: 0 }}>{row.icon}</span>
              {row.value && row.href ? (
                <a href={row.href} onClick={row.onClick}
                  style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#64748b", textDecoration: "none" }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#344256" }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#64748b" }}>
                  {row.value}
                </a>
              ) : (
                <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Non disponible</span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Bouton Chat (hors edit mode) ou indicateur de sauvegarde */}
      {editMode ? (
        saving ? (
          <span style={{ fontSize: 10, color: "#94a3b8", fontStyle: "italic" }}>Enregistrement...</span>
        ) : null
      ) : null}
    </div>
  )
}

export default function AnnuairePage() {
  const { user } = useAuth()
  const confirm = useConfirm()
  const isAdmin = !!(user?.is_superuser)
  const [editMode, setEditMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState("Tous")
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([])

  // Utiliser l'API
  const {
    employees,
    departments,
    loading,
    error,
    searchEmployees,
    updateEmployee,
    refetch,
  } = useEmployees()

  // Logs supprimés pour réduire le bruit

  // Construire la liste des départements pour le filtre
  const departmentOptions = ["Tous", ...departments.map(dept => dept.name)]

  // Debounce pour la recherche (comme dans actualités)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // Recherche immédiate si le champ est vide
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }, 1500) // 1.5 secondes pour laisser le temps de finir d'écrire
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Mettre à jour les données filtrées quand les données de l'API changent
  useEffect(() => {
    if (employees.length > 0) {
      setFilteredEmployees(employees)
    }
  }, [employees])

  // Effectuer la recherche UNIQUEMENT si il y a un terme de recherche ou un filtre département
  // Sinon, utiliser directement les employés chargés par fetchEmployees()
  useEffect(() => {
    // Si pas de recherche et pas de filtre département, ne pas appeler searchEmployees
    // Utiliser directement les employés chargés initialement
    if (!debouncedSearchTerm && selectedDepartment === 'Tous') {
      return
    }
    searchEmployees(debouncedSearchTerm, selectedDepartment)
  }, [debouncedSearchTerm, selectedDepartment])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Forcer la recherche immédiate sur Enter
      setIsTyping(false)
      setDebouncedSearchTerm(searchTerm)
    }
  }

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartment(department)
  }




  // Utiliser les données de l'API ou les données filtrées, triées de A à Z
  // Les non-admins ne voient pas les employees désactivés
  const baseData = (filteredEmployees.length > 0 ? filteredEmployees : employees)
    .filter(e => isAdmin || e.is_active !== false)
  const displayData = [...baseData].sort((a, b) =>
    a.full_name.localeCompare(b.full_name, 'fr', { sensitivity: 'base' })
  )
  
  

  // Réactiver toutes les cards désactivées
  const [reactivatingAll, setReactivatingAll] = useState(false)
  async function handleReactivateAll() {
    const inactive = employees.filter(e => e.is_active === false)
    if (inactive.length === 0) return
    if (!await confirm({ message: `Réactiver ${inactive.length} card${inactive.length > 1 ? "s" : ""} désactivée${inactive.length > 1 ? "s" : ""} ?`, title: 'Confirmer', variant: 'warning', confirmLabel: 'Réactiver' })) return
    setReactivatingAll(true)
    try {
      await Promise.all(inactive.map(e => updateEmployee(e.id, { is_active: true })))
    } finally {
      setReactivatingAll(false)
    }
  }

  const inactiveCount = employees.filter(e => e.is_active === false).length

  // Sync LDAP — streaming SSE
  const [syncing, setSyncing] = useState(false)
  const [syncLogs, setSyncLogs] = useState<{ type: string; msg: string }[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logsEndRef.current) logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [syncLogs])

  async function handleSyncLdap() {
    setSyncing(true)
    setSyncLogs([])
    try {
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] ?? null
      const { API_CONFIG } = await import('@/lib/config')
      const res = await fetch(`${API_CONFIG.ANNUAIRE}/sync-ldap/`, {
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
                if (evt.type === 'done') refetch()
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

  return (
    <LayoutWrapper 
        secondaryNavbarProps={{
          searchTerm,
          onSearchChange: handleSearch,
          onSearchKeyDown: handleSearchKeyDown,
          searchPlaceholder: "Rechercher par nom, poste ou département...",
          isTyping,
          selectedDepartment,
          onDepartmentChange: handleDepartmentChange,
          departmentOptions,
          rightActions: isAdmin ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Sync LDAP */}
              <button
                type="button"
                onClick={handleSyncLdap}
                disabled={syncing}
                title="Synchroniser avec le LDAP"
                className="flex items-center justify-center gap-1.5 rounded-lg border-2 font-semibold transition-all duration-150"
                style={{
                  padding: "6px 8px",
                  fontSize: 12, fontWeight: 600,
                  borderColor: "#dde3ee", background: "#fff", color: "#344256",
                  cursor: syncing ? "wait" : "pointer",
                  minWidth: 32,
                }}
                onMouseEnter={e => { if (!syncing) { e.currentTarget.style.borderColor = "#344256"; e.currentTarget.style.background = "#f1f5f9" } }}
                onMouseLeave={e => { if (!syncing) { e.currentTarget.style.borderColor = "#dde3ee"; e.currentTarget.style.background = "#fff" } }}
              >
                <RefreshCw size={14} style={{ animation: syncing ? "spin 1s linear infinite" : "none", flexShrink: 0 }} />
                <span className="hidden sm:inline">{syncing ? "Sync..." : "Sync LDAP"}</span>
              </button>
              {/* Réactiver tout */}
              {inactiveCount > 0 && (
                <button
                  type="button"
                  onClick={handleReactivateAll}
                  disabled={reactivatingAll}
                  title="Réactiver toutes les cards désactivées"
                  className="flex items-center justify-center gap-1.5 rounded-lg border-2 font-semibold transition-all duration-150"
                  style={{
                    padding: "6px 8px",
                    fontSize: 12, fontWeight: 600,
                    borderColor: "#dde3ee", background: "#fff", color: "#344256",
                    cursor: reactivatingAll ? "wait" : "pointer",
                    minWidth: 32,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#344256"; e.currentTarget.style.background = "#f1f5f9" }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#dde3ee"; e.currentTarget.style.background = "#fff" }}
                >
                  <Eye size={14} style={{ flexShrink: 0 }} />
                  <span className="hidden sm:inline">{reactivatingAll ? "..." : `Réactiver (${inactiveCount})`}</span>
                </button>
              )}
              {/* Mode édition */}
              <button
                type="button"
                onClick={() => setEditMode(m => !m)}
                title={editMode ? "Quitter le mode édition" : "Modifier les cards"}
                className="flex items-center justify-center gap-1.5 rounded-lg border-2 font-semibold transition-all duration-150"
                style={{
                  padding: "6px 8px",
                  fontSize: 12, fontWeight: 600,
                  borderColor: editMode ? "#344256" : "#dde3ee",
                  background: editMode ? "#344256" : "#fff",
                  color: editMode ? "#fff" : "#344256",
                  cursor: "pointer",
                  minWidth: 32,
                }}
                onMouseEnter={e => { if (!editMode) { e.currentTarget.style.borderColor = "#344256"; e.currentTarget.style.background = "#f1f5f9" } }}
                onMouseLeave={e => { if (!editMode) { e.currentTarget.style.borderColor = "#dde3ee"; e.currentTarget.style.background = "#fff" } }}
              >
                <Pencil size={14} style={{ flexShrink: 0 }} />
                <span className="hidden sm:inline">{editMode ? "Terminer" : "Modifier"}</span>
              </button>
            </div>
          ) : undefined,
        }}
      >
        <div className="mx-auto max-w-[1600px] px-6 py-6 space-y-4 xs:space-y-6">
          {/* État de chargement et d'erreur - Style actualités */}
          {(loading || error) && (
            <StandardLoader 
              title={loading ? "Chargement de l'annuaire..." : undefined}
              message={loading ? "Veuillez patienter pendant que nous récupérons les données." : undefined}
              error={error}
              showRetry={!!error}
              onRetry={() => window.location.reload()}
            />
          )}

          {/* Contenu principal - Style actualités */}
          {!loading && !error && (
            <div className="space-y-4 xs:space-y-6 stagger-animation">
              {/* Compteur employés */}
              {displayData.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#344256' }}></div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {debouncedSearchTerm || selectedDepartment !== 'Tous'
                      ? `Résultats${debouncedSearchTerm ? ` pour « ${debouncedSearchTerm} »` : ''}${selectedDepartment !== 'Tous' ? ` — ${selectedDepartment}` : ''}`
                      : 'Tous les employés'}
                  </h2>
                  <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ backgroundColor: '#344256' }}>
                    {displayData.filter(e => e.is_active !== false).length}
                  </span>
                  {isAdmin && inactiveCount > 0 && (
                    <span className="text-xs text-gray-400">
                      ({inactiveCount} désactivé{inactiveCount > 1 ? 's' : ''})
                    </span>
                  )}
                </div>
              )}

              {/* Header - Style actualités */}
              {displayData.length > 0 && (
                <div className="space-y-3 xs:space-y-4 relative">

                  {/* Grille 6 colonnes */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 w-full">
                    {displayData.map((employee) => (
                      <EmployeeCard key={employee.id} employee={employee} isAdmin={isAdmin} editMode={editMode} onSave={updateEmployee} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State - Style actualités */}
              {displayData.length === 0 && (
                <div className="max-w-7xl mx-auto">
                  <Card className="p-8 xs:p-12 text-center rounded-lg">
                    <div className="space-y-3 xs:space-y-4">
                      <div className="w-12 h-12 xs:w-16 xs:h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                        <Search className="h-6 w-6 xs:h-8 xs:w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-base xs:text-lg font-semibold">Aucun employé trouvé</h3>
                        <p className="text-sm text-gray-500 mt-1">Essayez de modifier vos critères de recherche</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Panneau de logs LDAP */}
        {syncLogs.length > 0 && (
          <div style={{
            position: "fixed", bottom: 24, right: 24, width: 440, maxHeight: 320,
            background: "#1e293b", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            display: "flex", flexDirection: "column", zIndex: 9999,
            border: "1.5px solid #334155", overflow: "hidden",
          }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderBottom: "1px solid #334155", flexShrink: 0,
            }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em" }}>
                LOGS — SYNC LDAP {syncing && <span style={{ color: "#60a5fa" }}>● en cours…</span>}
              </span>
              <button
                type="button"
                onClick={() => setSyncLogs([])}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: 0 }}
              >
                ✕
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "10px 14px", fontFamily: "monospace", fontSize: 11, lineHeight: 1.6 }}>
              {syncLogs.map((log, i) => (
                <div key={i} style={{
                  color: (log.type === "error" || log.type === "error_log") ? "#f87171" : log.type === "done" ? "#4ade80" : "#cbd5e1",
                  wordBreak: "break-all",
                }}>
                  {log.type === "done" ? "✓ " : (log.type === "error" || log.type === "error_log") ? "✗ " : "› "}{log.msg}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </LayoutWrapper>
  )
}
