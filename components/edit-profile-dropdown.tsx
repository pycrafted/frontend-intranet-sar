"use client"

import { useState, useEffect, useRef } from "react"
import { Phone, Mail, Briefcase, Building, AlertCircle, CheckCircle, Camera, Loader2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api-client"
import { API_CONFIG } from "@/lib/config"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const ACCENT = '#344256'

interface Department {
  id: number
  name: string
}

interface EditProfileDropdownProps {
  onSuccess?: () => void
  onCancel?: () => void
}

function getInitialForm(user: any) {
  let departmentValue = ""
  if (user?.department) {
    if (typeof user.department === 'object' && 'id' in user.department) {
      departmentValue = user.department.id.toString()
    } else if (typeof user.department === 'string') {
      departmentValue = user.department
    }
  } else if (user?.department_id) {
    departmentValue = user.department_id.toString()
  }
  return {
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    phone_number: user?.phone_number || "",
    office_phone: user?.office_phone || "",
    position: user?.position || "",
    department: departmentValue,
  }
}

export function EditProfileDropdown({ onSuccess, onCancel }: EditProfileDropdownProps) {
  const { user, updateProfile, refreshUser } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentsLoading, setDepartmentsLoading] = useState(false)
  const [formData, setFormData] = useState(() => getInitialForm(user))
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'deleting'>('idle')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync form + preview quand l'utilisateur change (après save, refreshUser, etc.)
  useEffect(() => {
    if (!user) return
    setFormData(getInitialForm(user))
    setAvatarPreview(user.avatar_url || null)
  }, [user])

  useEffect(() => {
    const fetchDepts = async () => {
      setDepartmentsLoading(true)
      try {
        const res = await api.get('/annuaire/departments/', { requireAuth: false })
        if (!res.ok) throw new Error()
        const data = await res.json()
        const arr = Array.isArray(data) ? data : (data.results || data.departments || data.data || [])
        setDepartments(arr)
      } catch {
        setDepartments([])
      } finally {
        setDepartmentsLoading(false)
      }
    }
    fetchDepts()
  }, [])

  // ── Avatar : upload immédiat via endpoint dédié ──────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset input so the same file can be re-sélectionné
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Fichier image requis'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image trop volumineuse (max 5 Mo)'); return }
    setError(null)

    // Affiche la preview locale immédiatement
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload asynchrone vers l'endpoint dédié
    ;(async () => {
      setAvatarUploading(true)
      try {
        const fd = new FormData()
        fd.append('avatar', file)
        const res = await fetch(`${API_CONFIG.AUTH}/current-user/avatar/`, {
          method: 'PATCH',
          credentials: 'include',
          body: fd,
        })
        if (res.ok) {
          const data = await res.json()
          // Remplace la preview base64 par l'URL serveur
          if (data.avatar_url) setAvatarPreview(data.avatar_url)
          await refreshUser()
        } else {
          // Revert la preview
          setAvatarPreview(user?.avatar_url || null)
          setError("Erreur lors de l'upload de la photo")
        }
      } catch {
        setAvatarPreview(user?.avatar_url || null)
        setError("Erreur réseau lors de l'upload")
      } finally {
        setAvatarUploading(false)
      }
    })()
  }

  // ── Avatar : suppression ─────────────────────────────────────────────────
  const handleDeleteAvatar = async () => {
    setStatus('deleting')
    setError(null)
    try {
      const res = await fetch(`${API_CONFIG.AUTH}/current-user/avatar/`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        setAvatarPreview(null)
        await refreshUser()
        setStatus('saved')
        setTimeout(() => setStatus('idle'), 2000)
      } else {
        setError('Erreur lors de la suppression')
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch {
      setError('Erreur réseau')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  // ── Champs texte : sauvegarde explicite ──────────────────────────────────
  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError('Prénom, nom et email sont obligatoires')
      return
    }
    setStatus('saving')
    setError(null)
    try {
      const dataToSend: any = { ...formData }
      dataToSend.department_id = formData.department ? (parseInt(formData.department) || null) : null
      delete dataToSend.department
      dataToSend.manager_id = null
      if (user?.username) dataToSend.username = user.username

      const result = await updateProfile(dataToSend)
      if (result.success) {
        setStatus('saved')
        onSuccess?.()
        setTimeout(() => setStatus('idle'), 2000)
      } else {
        setError(result.error || 'Erreur lors de la mise à jour')
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    } catch {
      setError('Erreur inattendue')
      setStatus('error')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const handleCancel = () => {
    setFormData(getInitialForm(user))
    setAvatarPreview(user?.avatar_url || null)
    setError(null)
    setStatus('idle')
    onCancel?.()
  }

  const isBusy = status === 'saving' || status === 'deleting'
  const isDirty = JSON.stringify(formData) !== JSON.stringify(getInitialForm(user))

  return (
    <div className="flex flex-col max-h-[65vh] sm:max-h-[520px]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">

        {/* Avatar */}
        <div className="flex items-center gap-3 py-1">
          <button
            type="button"
            onClick={() => !avatarUploading && fileInputRef.current?.click()}
            className="relative group flex-shrink-0"
            title="Changer la photo"
          >
            <Avatar className="h-12 w-12 border-2" style={{ borderColor: ACCENT + '50' }}>
              <AvatarImage src={avatarPreview || ""} />
              <AvatarFallback className="text-white text-sm font-semibold" style={{ backgroundColor: ACCENT }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {avatarUploading ? (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-white animate-spin" />
              </div>
            ) : (
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="h-4 w-4 text-white" />
              </div>
            )}
          </button>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.first_name} {user?.last_name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="text-[10px] font-medium hover:underline disabled:opacity-40"
                style={{ color: ACCENT }}
              >
                Changer la photo
              </button>
              {(avatarPreview || user?.avatar_url) && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={isBusy || avatarUploading}
                  title="Supprimer la photo"
                  className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                >
                  {status === 'deleting'
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <Trash2 className="h-3 w-3" />
                  }
                </button>
              )}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2 rounded-lg text-xs" style={{ backgroundColor: ACCENT + '12', color: ACCENT }}>
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2.5">

          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold" style={{ color: ACCENT }}>Prénom *</label>
              <Input
                value={formData.first_name}
                onChange={(e) => setFormData(p => ({ ...p, first_name: e.target.value }))}
                className="h-7 text-xs focus-visible:ring-0"
                style={{ borderColor: ACCENT + '50' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold" style={{ color: ACCENT }}>Nom *</label>
              <Input
                value={formData.last_name}
                onChange={(e) => setFormData(p => ({ ...p, last_name: e.target.value }))}
                className="h-7 text-xs focus-visible:ring-0"
                style={{ borderColor: ACCENT + '50' }}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold flex items-center gap-1" style={{ color: ACCENT }}>
              <Mail className="h-2.5 w-2.5" /> Email *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
              className="h-7 text-xs focus-visible:ring-0"
              style={{ borderColor: ACCENT + '50' }}
            />
          </div>

          {/* Téléphones */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold flex items-center gap-1" style={{ color: ACCENT }}>
                <Phone className="h-2.5 w-2.5" /> Tél. perso
              </label>
              <Input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                className="h-7 text-xs focus-visible:ring-0"
                style={{ borderColor: ACCENT + '50' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold flex items-center gap-1" style={{ color: ACCENT }}>
                <Phone className="h-2.5 w-2.5" /> Tél. fixe
              </label>
              <Input
                type="tel"
                value={formData.office_phone}
                onChange={(e) => setFormData(p => ({ ...p, office_phone: e.target.value }))}
                className="h-7 text-xs focus-visible:ring-0"
                style={{ borderColor: ACCENT + '50' }}
              />
            </div>
          </div>

          {/* Poste */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold flex items-center gap-1" style={{ color: ACCENT }}>
              <Briefcase className="h-2.5 w-2.5" /> Poste
            </label>
            <Input
              value={formData.position}
              onChange={(e) => setFormData(p => ({ ...p, position: e.target.value }))}
              className="h-7 text-xs focus-visible:ring-0"
              style={{ borderColor: ACCENT + '50' }}
            />
          </div>

          {/* Département */}
          <div className="space-y-1">
            <label className="text-[10px] font-semibold flex items-center gap-1" style={{ color: ACCENT }}>
              <Building className="h-2.5 w-2.5" /> Département
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(p => ({ ...p, department: e.target.value }))}
              className="w-full h-7 text-xs border rounded-md bg-white text-gray-900 px-2 outline-none"
              style={{ borderColor: ACCENT + '50' }}
              disabled={departmentsLoading}
            >
              <option value="">{departmentsLoading ? "Chargement..." : "Sélectionner"}</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

        </div>
      </div>

      {/* Boutons */}
      <div className="flex items-center justify-between gap-2 pt-3 mt-1 border-t border-gray-100">
        {status === 'saved' ? (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle className="h-3.5 w-3.5" /> Sauvegardé
          </span>
        ) : (
          <span className="text-[10px] text-gray-400">
            {isDirty ? 'Modifications non sauvegardées' : ''}
          </span>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isBusy}
            className="h-7 px-3 text-xs rounded-md border font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            style={{ borderColor: ACCENT + '40' }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isBusy || (!isDirty && status !== 'error')}
            className="h-7 px-3 text-xs rounded-md font-medium text-white disabled:opacity-40 transition-colors flex items-center gap-1"
            style={{ backgroundColor: ACCENT }}
          >
            {status === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
            {status === 'saving' ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  )
}
