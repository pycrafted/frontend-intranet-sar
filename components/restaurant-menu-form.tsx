"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Utensils, 
  Plus, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  MapPin,
  Save,
  Edit
} from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'

interface MenuItem {
  id: number
  name: string
  type: 'senegalese' | 'european'
  type_display: string
  description?: string
  is_available: boolean
}

interface DayMenu {
  id: number
  day: string
  day_display: string
  date: string
  senegalese: MenuItem
  european: MenuItem
  is_active: boolean
}

interface WeekMenu {
  week_start: string
  week_end: string
  days: DayMenu[]
}

export function RestaurantMenuForm() {
  const { 
    menuItems, 
    weekMenu, 
    loading, 
    error,
    fetchMenuItems, 
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    createDayMenu,
    updateDayMenu,
    deleteDayMenu,
    fetchWeekMenu,
    fetchAvailableItems,
    getMenuForDate
  } = useMenu()

  const [showForm, setShowForm] = useState(false)
  const [editingDay, setEditingDay] = useState<DayMenu | null>(null)
  const [availableItems, setAvailableItems] = useState<MenuItem[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'items' | 'week'>('week')
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [selectedWeek, setSelectedWeek] = useState('')
  
  // Form states
  const [formData, setFormData] = useState({
    date: '',
    senegalese_id: 0,
    european_id: 0,
    is_active: true
  })
  
  const [itemForm, setItemForm] = useState({
    name: '',
    type: 'senegalese' as 'senegalese' | 'european',
    description: '',
    is_available: true
  })

  // Load data on mount
  useEffect(() => {
    fetchMenuItems()
    fetchWeekMenu()
  }, [])

  // Load available items
  useEffect(() => {
    const loadAvailableItems = async () => {
      const items = await fetchAvailableItems()
      setAvailableItems(Array.isArray(items) ? items : [])
    }
    loadAvailableItems()
  }, [])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMessage])

  // Form handlers
  const handleSubmit = async () => {
    if (!selectedWeek || !formData.date || formData.senegalese_id === 0 || formData.european_id === 0) {
      setErrorMessage('Veuillez sélectionner une semaine, un jour et les plats')
      return
    }

    // Convertir la date en nom de jour (format attendu par l'API)
    const date = new Date(formData.date)
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const dayName = dayNames[date.getDay()]
    
    // Vérifier que c'est un jour de la semaine (lundi à vendredi)
    if (date.getDay() === 0 || date.getDay() === 6) {
      setErrorMessage('Seuls les jours de la semaine (lundi à vendredi) sont autorisés')
      return
    }
    
    console.log('Données envoyées:', {
      day: dayName,
      date: formData.date,
      senegalese_id: formData.senegalese_id,
      european_id: formData.european_id,
      is_active: formData.is_active
    })

    const result = await createDayMenu({
      day: dayName,
      date: formData.date,
      senegalese_id: Number(formData.senegalese_id),
      european_id: Number(formData.european_id),
      is_active: Boolean(formData.is_active)
    })

    if (result.success) {
      setSuccessMessage('Menu créé avec succès')
      setFormData({ date: '', senegalese_id: 0, european_id: 0, is_active: true })
      setSelectedWeek('')
      setShowForm(false)
      fetchWeekMenu()
    } else {
      console.error('Erreur de création:', result.error)
      setErrorMessage(result.error?.error || result.error?.message || 'Erreur lors de la création')
    }
  }

  const handleUpdate = async (dayMenu: DayMenu) => {
    const result = await updateDayMenu(dayMenu.id, {
      senegalese_id: dayMenu.senegalese.id,
      european_id: dayMenu.european.id,
      is_active: dayMenu.is_active
    })

    if (result.success) {
      setSuccessMessage('Menu modifié avec succès')
      fetchWeekMenu()
    } else {
      setErrorMessage(result.error?.error || 'Erreur lors de la modification')
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce menu ?')) {
      const result = await deleteDayMenu(id)
      if (result.success) {
        setSuccessMessage('Menu supprimé avec succès')
        fetchWeekMenu()
      } else {
        setErrorMessage(result.error?.error || 'Erreur lors de la suppression')
      }
    }
  }

  const handleEdit = (dayMenu: DayMenu) => {
    setEditingDay(dayMenu)
    setFormData({
      date: dayMenu.date,
      senegalese_id: dayMenu.senegalese.id,
      european_id: dayMenu.european.id,
      is_active: dayMenu.is_active
    })
    setShowForm(true)
  }

  // Menu Item handlers
  const handleCreateItem = async () => {
    const result = await createMenuItem(itemForm)
    if (result.success) {
      setSuccessMessage('Plat créé avec succès')
      setItemForm({ name: '', type: 'senegalese', description: '', is_available: true })
      setShowItemForm(false)
      fetchMenuItems()
    } else {
      setErrorMessage(result.error?.error || 'Erreur lors de la création')
    }
  }

  const handleUpdateItem = async () => {
    if (!editingItem) return
    
    const result = await updateMenuItem(editingItem.id, itemForm)
    if (result.success) {
      setSuccessMessage('Plat modifié avec succès')
      setEditingItem(null)
      setItemForm({ name: '', type: 'senegalese', description: '', is_available: true })
      setShowItemForm(false)
      fetchMenuItems()
    } else {
      setErrorMessage(result.error?.error || 'Erreur lors de la modification')
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      const result = await deleteMenuItem(id)
      if (result.success) {
        setSuccessMessage('Plat supprimé avec succès')
        fetchMenuItems()
      } else {
        setErrorMessage(result.error?.error || 'Erreur lors de la suppression')
      }
    }
  }

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item)
    setItemForm({
      name: item.name,
      type: item.type,
      description: item.description || '',
      is_available: item.is_available
    })
    setShowItemForm(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getWeekDays = (startDate?: string) => {
    const baseDate = startDate ? new Date(startDate) : new Date()
    const days = []
    
    // Calculer le lundi de la semaine sélectionnée
    const dayOfWeek = baseDate.getDay()
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const mondayDate = new Date(baseDate)
    mondayDate.setDate(baseDate.getDate() - daysSinceMonday)
    
    // Générer les 5 jours de la semaine (lundi à vendredi)
    for (let i = 0; i < 5; i++) {
      const date = new Date(mondayDate)
      date.setDate(mondayDate.getDate() + i)
      days.push({
        value: date.toISOString().split('T')[0],
        label: formatDate(date.toISOString().split('T')[0])
      })
    }
    
    return days
  }

  const getWeekOptions = () => {
    const options = []
    const today = new Date()
    
    // Générer les options pour les 8 prochaines semaines
    for (let week = 0; week < 8; week++) {
      const weekDate = new Date(today)
      weekDate.setDate(today.getDate() + (week * 7))
      
      // Calculer le lundi de cette semaine
      const dayOfWeek = weekDate.getDay()
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const mondayDate = new Date(weekDate)
      mondayDate.setDate(weekDate.getDate() - daysSinceMonday)
      
      const weekStart = mondayDate.toISOString().split('T')[0]
      const weekEnd = new Date(mondayDate)
      weekEnd.setDate(mondayDate.getDate() + 4)
      
      const weekLabel = `Semaine du ${mondayDate.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      })} au ${weekEnd.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      })}`
      
      options.push({
        value: weekStart,
        label: weekLabel
      })
    }
    
    return options
  }

  const safeMenuItems = Array.isArray(menuItems) ? menuItems : []
  const safeWeekMenu = weekMenu && weekMenu.days && Array.isArray(weekMenu.days) ? weekMenu : null
  const safeAvailableItems = Array.isArray(availableItems) ? availableItems : []

  if (loading) {
    return (
      <Card className="bg-white">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestion du Menu</h3>
          <p className="text-sm text-gray-600">Mettez à jour le menu du restaurant</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'items' ? 'default' : 'outline'}
            onClick={() => setActiveTab('items')}
            size="sm"
          >
            <Utensils className="h-4 w-4 mr-2" />
            Plats
          </Button>
          <Button
            variant={activeTab === 'week' ? 'default' : 'outline'}
            onClick={() => setActiveTab('week')}
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Menu Semaine
          </Button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="bg-red-50 border-red-200">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Menu Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Add Item Button */}
          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-900">Plats du Menu</h4>
            <Button onClick={() => setShowItemForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Plat
            </Button>
          </div>

          {/* Item Form */}
          {showItemForm && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingItem ? 'Modifier le Plat' : 'Nouveau Plat'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du plat</Label>
                    <Input
                      id="name"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      placeholder="Ex: Thieboudienne"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type de cuisine</Label>
                    <Select
                      value={itemForm.type}
                      onValueChange={(value: 'senegalese' | 'european') => 
                        setItemForm({ ...itemForm, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="senegalese">Sénégalais</SelectItem>
                        <SelectItem value="european">Européen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Input
                    id="description"
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    placeholder="Description du plat"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={itemForm.is_available}
                    onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="is_available">Disponible</Label>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={editingItem ? handleUpdateItem : handleCreateItem}
                    disabled={!itemForm.name.trim()}
                  >
                    {editingItem ? 'Modifier' : 'Créer'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowItemForm(false)
                      setEditingItem(null)
                      setItemForm({ name: '', type: 'senegalese', description: '', is_available: true })
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items List */}
          <Card className="bg-white">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {safeMenuItems.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                      <Badge variant={item.type === 'senegalese' ? 'default' : 'secondary'}>
                        {item.type_display}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <Badge variant={item.is_available ? 'default' : 'destructive'}>
                        {item.is_available ? 'Disponible' : 'Indisponible'}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Week Menu Tab */}
      {activeTab === 'week' && (
        <div className="space-y-4">
          {/* Add Menu Button */}
          <div className="flex justify-end items-center">
            <Button onClick={() => setShowForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Menu
            </Button>
          </div>

          {/* Menu Form */}
          {showForm && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingDay ? 'Modifier le Menu' : 'Nouveau Menu'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="week">Semaine</Label>
                <Select
                  value={selectedWeek}
                  onValueChange={(value) => {
                    setSelectedWeek(value)
                    setFormData({ ...formData, date: '' }) // Reset la date quand on change de semaine
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une semaine" />
                  </SelectTrigger>
                  <SelectContent>
                    {getWeekOptions().map((week) => (
                      <SelectItem key={week.value} value={week.value}>
                        {week.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Jour</Label>
                <Select
                  value={formData.date}
                  onValueChange={(value) => setFormData({ ...formData, date: value })}
                  disabled={!selectedWeek}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedWeek ? "Sélectionner un jour" : "Sélectionnez d'abord une semaine"} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedWeek && getWeekDays(selectedWeek).map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_active">Menu actif</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Plat Sénégalais</Label>
                <Select
                  value={formData.senegalese_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, senegalese_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un plat sénégalais" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeAvailableItems
                      .filter(item => item.type === 'senegalese' && item.is_available)
                      .map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Plat Européen</Label>
                <Select
                  value={formData.european_id.toString()}
                  onValueChange={(value) => setFormData({ ...formData, european_id: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un plat européen" />
                  </SelectTrigger>
                  <SelectContent>
                    {safeAvailableItems
                      .filter(item => item.type === 'european' && item.is_available)
                      .map(item => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={editingDay ? () => handleUpdate(editingDay) : handleSubmit}
                disabled={!selectedWeek || !formData.date || formData.senegalese_id === 0 || formData.european_id === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                {editingDay ? 'Modifier' : 'Créer'}
              </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false)
                      setEditingDay(null)
                      setFormData({ date: '', senegalese_id: 0, european_id: 0, is_active: true })
                      setSelectedWeek('')
                    }}
                  >
                    Annuler
                  </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Week Menu */}
      {activeTab === 'week' && safeWeekMenu && safeWeekMenu.days.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Utensils className="h-5 w-5 text-blue-600" />
              Menu de la Semaine
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Service 12h-14h</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>Restaurant SAR</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {safeWeekMenu.days.map((dayMenu) => (
                <div key={dayMenu.day} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                  {/* En-tête du jour */}
                  <div className="text-center mb-3">
                    <h4 className="font-semibold text-gray-900 text-sm">{dayMenu.day_display}</h4>
                    <p className="text-xs text-gray-500 mb-2">{formatDate(dayMenu.date)}</p>
                    <Badge variant={dayMenu.is_active ? "default" : "secondary"} className="text-xs px-2 py-1">
                      {dayMenu.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>

                  {/* Plats */}
                  <div className="space-y-2 mb-3">
                    {/* Plat sénégalais */}
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        <span className="text-xs font-medium text-orange-700">Sénégalais</span>
                      </div>
                      <p className="text-xs text-gray-900 font-medium pl-2">
                        {dayMenu.senegalese.name}
                      </p>
                    </div>

                    {/* Plat européen */}
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-medium text-blue-700">Européen</span>
                      </div>
                      <p className="text-xs text-gray-900 font-medium pl-2">
                        {dayMenu.european.name}
                      </p>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex justify-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(dayMenu)}
                      className="h-6 px-2"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(dayMenu.id)}
                      className="h-6 px-2 text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'week' && (!safeWeekMenu || safeWeekMenu.days.length === 0) && (
        <Card className="bg-white">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun menu disponible</h3>
            <p className="text-gray-600">Créez un menu pour commencer.</p>
          </CardContent>
        </Card>
      )}
        </div>
      )}
    </div>
  )
}
