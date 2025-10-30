"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Edit, Trash2, Shield, Mail, User as UserIcon, Building2, X, Filter, KeyRound } from "lucide-react"

type AdminUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  matricule?: string
  position?: string
  department?: { id: number; name: string } | string | null
  department_id?: number | null
  phone_number?: string
  phone_fixed?: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  groups_names?: string[]
}

const ADMIN_GROUPS = ["administrateur", "communication", "utilisateur simple"]

export function UsersAdminTable() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [form, setForm] = useState<Partial<AdminUser>>({})
  const [departments, setDepartments] = useState<{id:number; name:string}[]>([])
  const [allUsers, setAllUsers] = useState<AdminUser[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${baseUrl}/auth/admin/users/`, { credentials: 'include' })
      if (!res.ok) throw new Error('Impossible de charger les utilisateurs')
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : data.results || [])
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/annuaire/departments/`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setDepartments(Array.isArray(data) ? data : (data?.results || []))
        }
      } catch {}
      try {
        const res2 = await fetch(`${baseUrl}/auth/admin/users/`, { credentials: 'include' })
        if (res2.ok) {
          const data2 = await res2.json()
          setAllUsers(Array.isArray(data2) ? data2 : (data2?.results || []))
        } else {
          setAllUsers([])
        }
      } catch {
        setAllUsers([])
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return users
    return users.filter(u =>
      [u.full_name, u.email, u.username, u.matricule, u.position, typeof u.department === 'object' ? u.department?.name : (u.department as string | undefined)]
        .filter(Boolean)
        .some(v => String(v).toLowerCase().includes(term))
    )
  }, [users, search])

  const openEdit = (u: AdminUser) => {
    setEditUser(u)
    setForm({
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email,
      position: u.position,
      matricule: u.matricule,
      department_id: typeof u.department === 'object' && u.department ? u.department.id : null,
    })
  }

  const saveEdit = async () => {
    if (!editUser) return
    try {
      setLoading(true)
      const fd = new FormData()
      if (form.username !== undefined) fd.append('username', String(form.username))
      if (form.first_name !== undefined) fd.append('first_name', String(form.first_name))
      if (form.last_name !== undefined) fd.append('last_name', String(form.last_name))
      if (form.email !== undefined) fd.append('email', String(form.email))
      if (form.position !== undefined) fd.append('position', String(form.position))
      if (form.matricule !== undefined) fd.append('matricule', String(form.matricule))
      if (form.phone_number !== undefined) fd.append('phone_number', String(form.phone_number))
      if (form.phone_fixed !== undefined) fd.append('phone_fixed', String(form.phone_fixed))
      if (form.department_id !== undefined && form.department_id !== null) fd.append('department_id', String(form.department_id))
      if ((form as any).manager_id !== undefined && (form as any).manager_id !== null) fd.append('manager_id', String((form as any).manager_id))
      if (avatarFile) fd.append('avatar', avatarFile)

      const res = await fetch(`${baseUrl}/auth/admin/users/${editUser.id}/`, {
        method: 'PUT',
        credentials: 'include',
        body: fd,
      })
      if (!res.ok) throw new Error('Échec de la mise à jour')
      await fetchUsers()
      setEditUser(null)
      setAvatarFile(null)
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    try {
      setLoading(true)
      const res = await fetch(`${baseUrl}/auth/admin/users/${id}/`, { method: 'DELETE', credentials: 'include' })
      if (!res.ok) throw new Error('Échec de la suppression')
      await fetchUsers()
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const setGroups = async (id: number, groupName: string) => {
    try {
      setLoading(true)
      const res = await fetch(`${baseUrl}/auth/admin/users/${id}/groups/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groups: [groupName] }),
      })
      if (!res.ok) throw new Error('Échec de la mise à jour des groupes')
      await fetchUsers()
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (id: number) => {
    if (!confirm('Réinitialiser le mot de passe de cet utilisateur ?')) return
    try {
      setLoading(true)
      const res = await fetch(`${baseUrl}/auth/admin/users/${id}/reset-password/`, { method: 'POST', credentials: 'include' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Échec de la réinitialisation')
      alert(`Nouveau mot de passe temporaire: ${data.temporary_password}`)
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-l-4 border-red-500 bg-red-50 text-red-800">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full shadow-sm"></div>
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5 text-blue-600" />
                  Administration des Utilisateurs
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{users.length} utilisateur(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} className="pl-8 border-blue-200 focus:border-blue-400" />
                <Filter className="h-4 w-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Département</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Poste</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Matricule</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Groupe</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {`${(u.first_name||'?')[0] || ''}${(u.last_name||'?')[0] || ''}`.toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.full_name || `${u.first_name} ${u.last_name}`}</div>
                          <div className="text-sm text-gray-500">@{u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700"><Mail className="h-3.5 w-3.5" />{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{typeof u.department === 'object' && u.department ? u.department.name : (u.department || '—')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{u.position || '—'}</Badge>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm font-mono text-gray-900">{u.matricule || '—'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-500" />
                        <Select value={(u.groups_names && u.groups_names[0]) || 'utilisateur simple'} onValueChange={(val) => setGroups(u.id, val)}>
                          <SelectTrigger className="w-[200px] border-blue-200 focus:border-blue-400">
                            <SelectValue placeholder="Groupe" />
                          </SelectTrigger>
                          <SelectContent>
                            {ADMIN_GROUPS.map(g => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(u)} className="hover:bg-blue-50 text-blue-600 hover:text-blue-700"><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => resetPassword(u.id)} className="hover:bg-amber-50 text-amber-600 hover:text-amber-700"><KeyRound className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteUser(u.id)} className="hover:bg-red-50 text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Nom d'utilisateur</label>
              <Input value={form.username || ''} onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Prénom</label>
              <Input value={form.first_name || ''} onChange={e => setForm(prev => ({ ...prev, first_name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Nom</label>
              <Input value={form.last_name || ''} onChange={e => setForm(prev => ({ ...prev, last_name: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input type="email" value={form.email || ''} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Poste</label>
              <Input value={form.position || ''} onChange={e => setForm(prev => ({ ...prev, position: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Matricule</label>
              <Input value={form.matricule || ''} onChange={e => setForm(prev => ({ ...prev, matricule: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Téléphone personnel</label>
              <Input value={form.phone_number || ''} onChange={e => setForm(prev => ({ ...prev, phone_number: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Téléphone fixe</label>
              <Input value={form.phone_fixed || ''} onChange={e => setForm(prev => ({ ...prev, phone_fixed: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Département</label>
              <Select value={form.department_id ? String(form.department_id) : ''} onValueChange={(v) => setForm(prev => ({ ...prev, department_id: Number(v) }))}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Manager (N+1)</label>
              <Select value={(form as any).manager_id ? String((form as any).manager_id) : ''} onValueChange={(v) => setForm(prev => ({ ...prev, manager_id: Number(v) }) as any)}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {(Array.isArray(allUsers) ? allUsers : []).map(u => (
                    <SelectItem key={u.id} value={String(u.id)}>{u.full_name || `${u.first_name} ${u.last_name}`}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-1 block">Photo de profil</label>
              <Input type="file" accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditUser(null)}>Annuler</Button>
            <Button onClick={saveEdit}>Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


