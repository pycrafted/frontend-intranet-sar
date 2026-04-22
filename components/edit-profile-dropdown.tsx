"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Phone, Mail, Briefcase, Building, AlertCircle, CheckCircle, Camera, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { api } from "@/lib/api-client"
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

export function EditProfileDropdown({ onSuccess }: EditProfileDropdownProps) {
  const { user, updateProfile } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentsLoading, setDepartmentsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    office_phone: "",
    position: "",
    department: "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!user) return
    let departmentValue = ""
    if (user.department) {
      if (typeof user.department === 'object' && 'id' in user.department) {
        departmentValue = (user.department as any).id.toString()
      } else if (typeof user.department === 'string') {
        departmentValue = user.department
      }
    } else if ((user as any).department_id) {
      departmentValue = (user as any).department_id.toString()
    }
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone_number: user.phone_number || "",
      office_phone: user.office_phone || "",
      position: user.position || "",
      department: departmentValue,
    })
    if (user.avatar_url) setAvatarPreview(user.avatar_url)
    initializedRef.current = true
  }, [user])

  useEffect(() => {
    const fetch = async () => {
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
    fetch()
  }, [])

  const save = useCallback(async (data: typeof formData, avatar?: File | null) => {
    if (!data.first_name || !data.last_name || !data.email) return
    setSaveStatus('saving')
    setError(null)
    try {
      const dataToSend: any = { ...data }
      if (dataToSend.department) {
        const id = parseInt(dataToSend.department)
        dataToSend.department_id = !isNaN(id) ? id : null
      } else {
        dataToSend.department_id = null
      }
      delete dataToSend.department
      dataToSend.manager_id = null
      if (user?.username) dataToSend.username = user.username

      let result
      if (avatar) {
        const fd = new FormData()
        Object.keys(dataToSend).forEach(k => {
          const v = dataToSend[k]
          if (v !== null && v !== undefined && v !== '') fd.append(k, v.toString())
        })
        fd.append('avatar', avatar)
        result = await (updateProfile as any)(fd)
      } else {
        result = await updateProfile(dataToSend)
      }

      if (result.success) {
        setSaveStatus('saved')
        setAvatarFile(null)
        onSuccess?.()
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setError(result.error || 'Erreur lors de la mise à jour')
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch {
      setError('Erreur inattendue')
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [user, updateProfile, onSuccess])

  const handleChange = (patch: Partial<typeof formData>) => {
    if (!initializedRef.current) return
    setFormData(prev => {
      const next = { ...prev, ...patch }
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => save(next, null), 1200)
      return next
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Fichier image requis'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Image trop volumineuse (max 5MB)'); return }
    setAvatarFile(file)
    setError(null)
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(formData, file), 800)
  }

  const statusIcon = () => {
    if (saveStatus === 'saving') return <Loader2 className="w-3 h-3 animate-spin" style={{ color: ACCENT }} />
    if (saveStatus === 'saved') return <CheckCircle className="w-3 h-3 text-green-500" />
    if (saveStatus === 'error') return <AlertCircle className="w-3 h-3 text-red-500" />
    return null
  }

  const statusText = () => {
    if (saveStatus === 'saving') return 'Sauvegarde...'
    if (saveStatus === 'saved') return 'Sauvegardé'
    if (saveStatus === 'error') return 'Erreur'
    return null
  }

  return (
    <div className="flex flex-col max-h-[65vh] sm:max-h-[480px]">
      <div className="flex-1 overflow-y-auto space-y-3 pr-0.5">

        {/* Avatar cliquable */}
        <div className="flex items-center gap-3 py-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group flex-shrink-0"
          >
            <Avatar className="h-12 w-12 border-2" style={{ borderColor: ACCENT + '50' }}>
              <AvatarImage src={avatarPreview || user?.avatar_url || ""} />
              <AvatarFallback className="text-white text-sm font-semibold" style={{ backgroundColor: ACCENT }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.first_name} {user?.last_name}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] font-medium hover:underline"
              style={{ color: ACCENT }}
            >
              {avatarFile ? '✓ Photo sélectionnée' : 'Changer la photo'}
            </button>
          </div>
          {/* Auto-save status */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {statusIcon()}
            {statusText() && (
              <span className={`text-[10px] font-medium ${saveStatus === 'saved' ? 'text-green-500' : saveStatus === 'error' ? 'text-red-500' : ''}`} style={saveStatus === 'saving' ? { color: ACCENT } : {}}>
                {statusText()}
              </span>
            )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold" style={{ color: ACCENT }}>Prénom *</label>
              <Input
                value={formData.first_name}
                onChange={(e) => handleChange({ first_name: e.target.value })}
                className="h-7 text-xs focus-visible:ring-0"
                style={{ borderColor: ACCENT + '50' }}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold" style={{ color: ACCENT }}>Nom *</label>
              <Input
                value={formData.last_name}
                onChange={(e) => handleChange({ last_name: e.target.value })}
                className="h-7 text-xs focus-visible:ring-0"
                style={{ borderColor: ACCENT + '50' }}
                required
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
              onChange={(e) => handleChange({ email: e.target.value })}
              className="h-7 text-xs focus-visible:ring-0"
              style={{ borderColor: ACCENT + '50' }}
              required
            />
          </div>

          {/* Téléphones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold flex items-center gap-1" style={{ color: ACCENT }}>
                <Phone className="h-2.5 w-2.5" /> Tél. perso
              </label>
              <Input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleChange({ phone_number: e.target.value })}
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
                onChange={(e) => handleChange({ office_phone: e.target.value })}
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
              onChange={(e) => handleChange({ position: e.target.value })}
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
              onChange={(e) => handleChange({ department: e.target.value })}
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
    </div>
  )
}
