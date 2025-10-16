"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Building2,
  Phone,
  Smartphone,
  Mail,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Database,
  AlertCircle,
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Upload,
  Image,
  X,
  Crown,
  UserCheck,
  Hierarchy
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useAgentsAdmin, Agent } from "@/hooks/useAgentsAdmin"

interface AgentsAdminTableProps {
  onAgentSelect?: (agent: any) => void
}

export function AgentsAdminTable({ onAgentSelect }: AgentsAdminTableProps) {
  const {
    agents,
    directions,
    managers,
    loading,
    error,
    pagination,
    filters,
    selectedAgents,
    fetchAgents,
    deleteAgent,
    deleteMultipleAgents,
    updateAgent,
    createAgent,
    uploadAgentAvatar,
    setFilters,
    setSelectedAgents,
    clearSelection
  } = useAgentsAdmin()

  // Debug: Log selectedAgents to console
  useEffect(() => {
    console.log('selectedAgents:', selectedAgents, 'type:', typeof selectedAgents, 'isArray:', Array.isArray(selectedAgents))
  }, [selectedAgents])

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_fixed: '',
    phone_mobile: '',
    matricule: '',
    job_title: '',
    main_direction: '',
    manager: '',
    avatar: null as File | null,
    directions_ids: [] as number[]
  })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Debounce pour la recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setDebouncedSearchTerm('')
      setIsTyping(false)
      return
    }

    setIsTyping(true)
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setIsTyping(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Mettre à jour les filtres quand la recherche debounced change
  useEffect(() => {
    setFilters({ search: debouncedSearchTerm })
  }, [debouncedSearchTerm, setFilters])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAgents(agents.map(agent => agent.id))
    } else {
      clearSelection()
    }
  }

  const handleSelectAgent = (agentId: number, checked: boolean) => {
    console.log('handleSelectAgent called:', { agentId, checked, selectedAgents })
    if (checked) {
      const current = Array.isArray(selectedAgents) ? selectedAgents : []
      const newSelection = [...current, agentId]
      console.log('Adding agent, new selection:', newSelection)
      setSelectedAgents(newSelection)
    } else {
      const current = Array.isArray(selectedAgents) ? selectedAgents : []
      const newSelection = current.filter(id => id !== agentId)
      console.log('Removing agent, new selection:', newSelection)
      setSelectedAgents(newSelection)
    }
  }

  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({
      first_name: agent.first_name,
      last_name: agent.last_name,
      email: agent.email,
      phone_fixed: agent.phone_fixed || '',
      phone_mobile: agent.phone_mobile || '',
      matricule: agent.matricule,
      job_title: agent.job_title,
      main_direction: agent.main_direction?.toString() || '',
      manager: agent.manager?.toString() || '',
      avatar: null,
      directions_ids: agent.directions?.map(d => d.id) || []
    })
    setAvatarPreview(agent.avatar || null)
    setShowEditModal(true)
  }

  const handleCreateAgent = () => {
    setEditingAgent(null)
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone_fixed: '',
      phone_mobile: '',
      matricule: '',
      job_title: '',
      main_direction: '',
      manager: '',
      avatar: null,
      directions_ids: []
    })
    setAvatarPreview(null)
    setShowCreateModal(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('first_name', formData.first_name)
      formDataToSend.append('last_name', formData.last_name)
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone_fixed', formData.phone_fixed)
      formDataToSend.append('phone_mobile', formData.phone_mobile)
      formDataToSend.append('matricule', formData.matricule)
      formDataToSend.append('job_title', formData.job_title)
      formDataToSend.append('main_direction', formData.main_direction)
      formDataToSend.append('manager', formData.manager)
      
      // Ajouter les directions associées
      formData.directions_ids.forEach(id => {
        formDataToSend.append('directions_ids', id.toString())
      })
      
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar)
      }

      if (editingAgent) {
        await updateAgent(editingAgent.id, formDataToSend)
        setShowEditModal(false)
      } else {
        await createAgent(formDataToSend)
        setShowCreateModal(false)
      }

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone_fixed: '',
        phone_mobile: '',
        matricule: '',
        job_title: '',
        main_direction: '',
        manager: '',
        avatar: null,
        directions_ids: []
      })
      setAvatarPreview(null)
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
    }
  }

  const handleDelete = async (agentId: number) => {
    try {
      await deleteAgent(agentId)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleDeleteMultiple = async () => {
    if (Array.isArray(selectedAgents) && selectedAgents.length > 0) {
      try {
        await deleteMultipleAgents(selectedAgents)
        clearSelection()
      } catch (error) {
        console.error('Erreur lors de la suppression multiple:', error)
      }
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }))
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setFormData(prev => ({ ...prev, avatar: null }))
    setAvatarPreview(null)
  }

  const getDirectionIcon = (directionName: string) => {
    const icons: { [key: string]: string } = {
      'Direction Commerciale et Marketing': '💼',
      'Administration': '📋',
      'Direction des Ressources Humaines': '👥',
      'Direction EXECUTIVE - SUPPORT': '🏢',
      'Direction Technique': '⚙️',
      'Direction Executif': '👑',
      'Direction Qualité': '⭐',
      'Direction Financière': '💰',
      'Direction IT': '💻',
      'Direction Logistique': '📦',
      'Direction Sécurité': '🛡️'
    }
    return icons[directionName] || '🏢'
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Non renseigné'
    try {
      return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr })
    } catch (error) {
      return 'Date invalide'
    }
  }

  const getHierarchyLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-gradient-to-r from-yellow-500 to-orange-500'
      case 2: return 'bg-gradient-to-r from-blue-500 to-indigo-500'
      case 3: return 'bg-gradient-to-r from-green-500 to-emerald-500'
      case 4: return 'bg-gradient-to-r from-purple-500 to-violet-500'
      default: return 'bg-gradient-to-r from-gray-500 to-slate-500'
    }
  }

  const getHierarchyLevelText = (level: number) => {
    return `Niveau ${level}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-orange-600">
          <Clock className="h-5 w-5 animate-spin" />
          <span>Chargement des agents...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Erreur lors du chargement</p>
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header avec style inspiré de la page employés */}
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-amber-400 rounded-full shadow-sm"></div>
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Users className="h-5 w-5 text-orange-600" />
                  Administration des Agents
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {pagination.total} agent{pagination.total > 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCreateAgent}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un agent
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-400"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Barre de recherche et filtres */}
        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Barre de recherche avancée (comme navbar secondaire) */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-xl">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${
                searchFocused ? 'text-orange-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Rechercher dans les agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-10 pr-10 py-3 text-sm border-2 rounded-lg transition-all duration-200 ${
                  searchFocused 
                    ? 'border-orange-500 ring-2 ring-orange-100 bg-white shadow-md' 
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center"
                >
                  <X className="h-3 w-3 text-gray-400" />
                </button>
              )}
              
              {/* Indicateur de frappe */}
              {searchTerm && isTyping && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-2 text-xs text-gray-600 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
                      <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <span>En cours de recherche...</span>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Filtres */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Direction</label>
                  <Select
                    value={filters.direction}
                    onValueChange={(value) => setFilters({ direction: value })}
                  >
                    <SelectTrigger className="border-orange-200 focus:border-orange-400">
                      <SelectValue placeholder="Toutes les directions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      {directions.map((direction) => (
                        <SelectItem key={direction.id} value={direction.id.toString()}>
                          {getDirectionIcon(direction.name)} {direction.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">n+1</label>
                  <Select
                    value={filters.manager}
                    onValueChange={(value) => setFilters({ manager: value })}
                  >
                    <SelectTrigger className="border-orange-200 focus:border-orange-400">
                      <SelectValue placeholder="Tous les n+1" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{manager.full_name}</span>
                            <Badge variant="outline" className="text-xs">
                              {getHierarchyLevelText(manager.hierarchy_level)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Actions en lot</label>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          disabled={!Array.isArray(selectedAgents) || selectedAgents.length === 0}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Supprimer ({selectedAgents?.length || 0})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer {selectedAgents?.length || 0} agent{selectedAgents && selectedAgents.length > 1 ? 's' : ''} ? 
                            Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteMultiple}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}

            {/* Actions en lot */}
            {Array.isArray(selectedAgents) && selectedAgents.length > 0 && (
              <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-orange-800">
                    {selectedAgents.length} agent{selectedAgents.length > 1 ? 's' : ''} sélectionné{selectedAgents.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Désélectionner tout
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        disabled={!Array.isArray(selectedAgents) || selectedAgents.length === 0}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer ({selectedAgents?.length || 0})
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression multiple</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer {selectedAgents?.length || 0} agent{selectedAgents && selectedAgents.length > 1 ? 's' : ''} ? Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMultiple}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tableau des agents */}
      <Card className="border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <Database className="h-5 w-5" />
            Gestion des agents
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              {pagination.total} agent{pagination.total > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <Checkbox
                      checked={Array.isArray(selectedAgents) ? selectedAgents.length === agents.length && agents.length > 0 : false}
                      onCheckedChange={handleSelectAll}
                      className="border-orange-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Agent</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Direction</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Poste</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Niveau</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {agents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-colors">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={Array.isArray(selectedAgents) ? selectedAgents.includes(agent.id) : false}
                        onCheckedChange={(checked) => handleSelectAgent(agent.id, checked as boolean)}
                        className="border-orange-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {agent.initials}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{agent.full_name}</div>
                          <div className="text-sm text-gray-500">{agent.matricule}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          {getDirectionIcon(agent.main_direction_name)} {agent.main_direction_name}
                        </div>
                        {agent.directions && agent.directions.length > 1 && (
                          <div className="text-xs text-gray-500">
                            +{agent.directions.length - 1} autre{agent.directions.length - 1 > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{agent.job_title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getHierarchyLevelColor(agent.hierarchy_level)} text-white`}>
                        {getHierarchyLevelText(agent.hierarchy_level)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {agent.email}
                        </div>
                        {agent.phone_mobile && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Smartphone className="h-3 w-3" />
                            {agent.phone_mobile}
                          </div>
                        )}
                        {agent.phone_fixed && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            {agent.phone_fixed}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAgent(agent)}
                          className="border-orange-200 text-orange-700 hover:bg-orange-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer {agent.full_name} ? Cette action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(agent.id)}>
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="text-sm text-gray-700">
                Affichage de <span className="font-medium text-orange-700">{pagination.start}</span> à <span className="font-medium text-orange-700">{pagination.end}</span> sur <span className="font-medium text-orange-700">{pagination.total}</span> agents
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ page: pagination.page - 1 })}
                  disabled={pagination.page <= 1}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <span className="text-sm text-gray-700">
                  Page <span className="font-medium text-orange-700">{pagination.page}</span> sur <span className="font-medium text-orange-700">{pagination.total_pages}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({ page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.total_pages}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50 disabled:opacity-50"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Modal de création d'agent */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Plus className="h-5 w-5 text-orange-600" />
              Nouvel agent
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Ajoutez un nouvel agent à l'organigramme
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Prénom *</label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Prénom de l'agent"
                  className="border-orange-200 focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Nom *</label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Nom de l'agent"
                  className="border-orange-200 focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@entreprise.com"
                  className="border-orange-200 focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Matricule *</label>
                <Input
                  value={formData.matricule}
                  onChange={(e) => setFormData(prev => ({ ...prev, matricule: e.target.value }))}
                  placeholder="SAR001"
                  className="border-orange-200 focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Téléphone fixe</label>
                <Input
                  value={formData.phone_fixed}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_fixed: e.target.value }))}
                  placeholder="+221 33 825 XX XX"
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Téléphone mobile</label>
                <Input
                  value={formData.phone_mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_mobile: e.target.value }))}
                  placeholder="77 XXX XX XX"
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Poste *</label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                  placeholder="Directeur, Manager, Employé..."
                  className="border-orange-200 focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Direction principale</label>
                <Select
                  value={formData.main_direction}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, main_direction: value }))}
                >
                  <SelectTrigger className="border-orange-200 focus:border-orange-400">
                    <SelectValue placeholder="Sélectionner une direction" />
                  </SelectTrigger>
                  <SelectContent>
                    {directions.map((direction) => (
                      <SelectItem key={direction.id} value={direction.id.toString()}>
                        {getDirectionIcon(direction.name)} {direction.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">n+1</label>
                <Select
                  value={formData.manager}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, manager: value }))}
                >
                  <SelectTrigger className="border-orange-200 focus:border-orange-400">
                    <SelectValue placeholder="Sélectionner un n+1" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{manager.full_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {getHierarchyLevelText(manager.hierarchy_level)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Champ Directions associées */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block text-gray-700">Directions associées</label>
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 mb-2">
                    Sélectionnez une ou plusieurs directions auxquelles appartient cet agent
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-orange-200 rounded-lg p-3">
                    {directions.map((direction) => (
                      <label key={direction.id} className="flex items-center space-x-2 cursor-pointer hover:bg-orange-50 p-2 rounded">
                        <Checkbox
                          checked={formData.directions_ids.includes(direction.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                directions_ids: [...prev.directions_ids, direction.id]
                              }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                directions_ids: prev.directions_ids.filter(id => id !== direction.id)
                              }))
                            }
                          }}
                          className="border-orange-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          {getDirectionIcon(direction.name)} {direction.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.directions_ids.length > 0 && (
                    <div className="text-xs text-orange-600">
                      {formData.directions_ids.length} direction{formData.directions_ids.length > 1 ? 's' : ''} sélectionnée{formData.directions_ids.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Champ Avatar */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block text-gray-700">Photo de profil</label>
                <div className="space-y-4">
                  {/* Aperçu de l'image */}
                  {avatarPreview && (
                    <div className="relative inline-block">
                      <img
                        src={avatarPreview}
                        alt="Aperçu"
                        className="w-24 h-24 rounded-full object-cover border-2 border-orange-200"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Zone d'upload */}
                  <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                    <input
                      type="file"
                      id="avatar-upload-create"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload-create"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        {avatarPreview ? (
                          <Image className="w-6 h-6 text-orange-600" />
                        ) : (
                          <Upload className="w-6 h-6 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {avatarPreview ? 'Changer la photo' : 'Cliquez pour ajouter une photo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG jusqu'à 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-sm"
              >
                Créer l'agent
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal d'édition d'agent */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900">
              <Edit className="h-5 w-5 text-orange-600" />
              Modifier l'agent
            </DialogTitle>
            <p className="text-sm text-gray-600">
              Modifiez les informations de {editingAgent?.full_name}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Prénom *</label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Prénom de l'agent"
                  className="border-orange-200 focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Nom *</label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Nom de l'agent"
                  className="border-orange-200 focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@entreprise.com"
                  className="border-orange-200 focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Matricule *</label>
                <Input
                  value={formData.matricule}
                  onChange={(e) => setFormData(prev => ({ ...prev, matricule: e.target.value }))}
                  placeholder="SAR001"
                  className="border-orange-200 focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Téléphone fixe</label>
                <Input
                  value={formData.phone_fixed}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_fixed: e.target.value }))}
                  placeholder="+221 33 825 XX XX"
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Téléphone mobile</label>
                <Input
                  value={formData.phone_mobile}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_mobile: e.target.value }))}
                  placeholder="77 XXX XX XX"
                  className="border-orange-200 focus:border-orange-400"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Poste *</label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                  placeholder="Directeur, Manager, Employé..."
                  className="border-orange-200 focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Direction principale</label>
                <Select
                  value={formData.main_direction}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, main_direction: value }))}
                >
                  <SelectTrigger className="border-orange-200 focus:border-orange-400">
                    <SelectValue placeholder="Sélectionner une direction" />
                  </SelectTrigger>
                  <SelectContent>
                    {directions.map((direction) => (
                      <SelectItem key={direction.id} value={direction.id.toString()}>
                        {getDirectionIcon(direction.name)} {direction.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">n+1</label>
                <Select
                  value={formData.manager}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, manager: value }))}
                >
                  <SelectTrigger className="border-orange-200 focus:border-orange-400">
                    <SelectValue placeholder="Sélectionner un n+1" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{manager.full_name}</span>
                          <Badge variant="outline" className="text-xs">
                            {getHierarchyLevelText(manager.hierarchy_level)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Champ Directions associées pour l'édition */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block text-gray-700">Directions associées</label>
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 mb-2">
                    Sélectionnez une ou plusieurs directions auxquelles appartient cet agent
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-orange-200 rounded-lg p-3">
                    {directions.map((direction) => (
                      <label key={direction.id} className="flex items-center space-x-2 cursor-pointer hover:bg-orange-50 p-2 rounded">
                        <Checkbox
                          checked={formData.directions_ids.includes(direction.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                directions_ids: [...prev.directions_ids, direction.id]
                              }))
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                directions_ids: prev.directions_ids.filter(id => id !== direction.id)
                              }))
                            }
                          }}
                          className="border-orange-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                        />
                        <span className="text-sm text-gray-700 flex items-center gap-1">
                          {getDirectionIcon(direction.name)} {direction.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {formData.directions_ids.length > 0 && (
                    <div className="text-xs text-orange-600">
                      {formData.directions_ids.length} direction{formData.directions_ids.length > 1 ? 's' : ''} sélectionnée{formData.directions_ids.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* Champ Avatar pour l'édition */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block text-gray-700">Photo de profil</label>
                <div className="space-y-4">
                  {/* Aperçu de l'image */}
                  {avatarPreview && (
                    <div className="relative inline-block">
                      <img
                        src={avatarPreview}
                        alt="Aperçu"
                        className="w-24 h-24 rounded-full object-cover border-2 border-orange-200"
                      />
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* Zone d'upload */}
                  <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                    <input
                      type="file"
                      id="avatar-upload-edit"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-upload-edit"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        {avatarPreview ? (
                          <Image className="w-6 h-6 text-orange-600" />
                        ) : (
                          <Upload className="w-6 h-6 text-orange-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {avatarPreview ? 'Changer la photo' : 'Cliquez pour ajouter une photo'}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG jusqu'à 5MB
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-sm"
              >
                Mettre à jour
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="border-orange-200 text-orange-700 hover:bg-orange-50"
              >
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
