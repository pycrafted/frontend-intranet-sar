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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Utensils, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  MapPin
} from 'lucide-react'
import { useMenu } from '@/hooks/useMenu'

interface MenuItem {
  id: number
  name: string
  type: 'senegalese' | 'european'
  type_display: string
  description?: string
  is_available: boolean
  created_at: string
  updated_at: string
}

interface DayMenu {
  id: number
  day: string
  day_display: string
  date: string
  senegalese: MenuItem
  european: MenuItem
  is_active: boolean
  created_at: string
  updated_at: string
}

interface WeekMenu {
  week_start: string
  week_end: string
  days: DayMenu[]
}

export function MenuManagement() {
  const { 
    menuItems, 
    dayMenus, 
    weekMenu, 
    loading, 
    error,
    fetchMenuItems, 
    createMenuItem, 
    updateMenuItem, 
    deleteMenuItem,
    fetchDayMenus,
    createDayMenu,
    updateDayMenu,
    deleteDayMenu,
    fetchWeekMenu,
    createWeekMenu,
    fetchAvailableItems,
    getMenuForDate
  } = useMenu()

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  // Fonction pour calculer les classes de grille dynamiques
  const getDynamicGridClasses = (dayCount: number) => {
    if (dayCount === 0) return 'grid-cols-1'
    if (dayCount === 1) return 'grid-cols-1'
    if (dayCount === 2) return 'grid-cols-1 md:grid-cols-2'
    if (dayCount === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
    if (dayCount === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    if (dayCount === 5) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
    
    // Pour plus de 5 jours, utiliser une grille flexible
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
  }

  const [activeTab, setActiveTab] = useState<'items' | 'week'>('week')
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showWeekForm, setShowWeekForm] = useState(false)
  const [editingDayMenu, setEditingDayMenu] = useState<DayMenu | null>(null)
  
  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    type: 'senegalese' as 'senegalese' | 'european',
    description: '',
    is_available: true
  })
  
  // Fonction pour calculer les jours restants de la semaine
  const getRemainingWeekDays = (startDate: string) => {
    if (!startDate) return []
    
    const inputDate = new Date(startDate)
    const today = new Date()
    
    // Normaliser les dates pour comparer seulement la partie date (sans l'heure)
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Calculer le lundi de la semaine de la date donnée (comme le backend)
    // getDay() : Dimanche=0, Lundi=1, Mardi=2, ..., Samedi=6
    // weekday() : Lundi=0, Mardi=1, Mercredi=2, ..., Dimanche=6
    const daysSinceMonday = inputDate.getDay() === 0 ? 6 : inputDate.getDay() - 1
    const mondayDate = new Date(inputDate)
    mondayDate.setDate(inputDate.getDate() - daysSinceMonday)
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
    const remainingDays = []
    
    for (let i = 0; i < 5; i++) {
      const currentDate = new Date(mondayDate)
      currentDate.setDate(mondayDate.getDate() + i)
      
      // Normaliser la date courante pour la comparaison
      const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
      
      // Inclure TOUS les jours de la semaine (passés, présents et futurs)
      // Permettre la création/modification de menu pour tous les jours de la semaine courante
      const dateString = currentDate.toISOString().split('T')[0]
      const existingMenu = getMenuForDate(dateString)
      
      remainingDays.push({
        day: days[i],
        dayName: dayNames[i],
        date: dateString,
        senegalese_id: existingMenu?.senegalese?.id || 0,
        european_id: existingMenu?.european?.id || 0,
        is_active: existingMenu?.is_active ?? true,
        existing: !!existingMenu
      })
    }
    
    return remainingDays
  }

  const [weekForm, setWeekForm] = useState({
    week_start: '',
    menus: [] as Array<{
      day: string
      dayName: string
      date: string
      senegalese_id: number
      european_id: number
      is_active: boolean
      existing?: boolean
    }>
  })

  const [availableItems, setAvailableItems] = useState<MenuItem[]>([])
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Load data on mount
  useEffect(() => {
    fetchMenuItems()
    fetchDayMenus()
    fetchWeekMenu()
  }, [])

  // Recalculer les jours restants quand la date change
  useEffect(() => {
    if (weekForm.week_start) {
      const remainingDays = getRemainingWeekDays(weekForm.week_start)
      setWeekForm(prev => ({
        ...prev,
        menus: remainingDays
      }))
    }
  }, [weekForm.week_start])

  // Ensure menuItems is always an array
  const safeMenuItems = Array.isArray(menuItems) ? menuItems : []
  const safeWeekMenu = weekMenu && weekMenu.days && Array.isArray(weekMenu.days) ? weekMenu : null
  const safeAvailableItems = Array.isArray(availableItems) ? availableItems : []

  // Load available items when needed
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

  // Menu Item handlers
  const handleCreateItem = async () => {
    const result = await createMenuItem(itemForm)
    if (result.success) {
      setSuccessMessage('Plat créé avec succès')
      setItemForm({ name: '', type: 'senegalese', description: '', is_available: true })
      setShowItemForm(false)
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
    } else {
      setErrorMessage(result.error?.error || 'Erreur lors de la modification')
    }
  }

  const handleDeleteItem = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
      const result = await deleteMenuItem(id)
      if (result.success) {
        setSuccessMessage('Plat supprimé avec succès')
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

  // Week Menu handlers
  const handleCreateWeekMenu = async () => {
    // Vérifier qu'il y a au moins un menu
    if (weekForm.menus.length === 0) {
      setErrorMessage('Aucun jour disponible pour créer un menu')
      return
    }
    
    // Vérifier que tous les champs sont remplis
    const hasEmptyFields = weekForm.menus.some(menu => 
      menu.senegalese_id === 0 || menu.european_id === 0
    )
    
    if (hasEmptyFields) {
      setErrorMessage('Veuillez sélectionner un plat sénégalais et européen pour chaque jour')
      return
    }
    
    const result = await createWeekMenu({
      week_start: weekForm.week_start,
      menus: weekForm.menus
    })
    
    if (result.success) {
      setSuccessMessage(`Menu créé avec succès pour ${weekForm.menus.length} jour(s)`)
      setWeekForm({
        week_start: '',
        menus: []
      })
      setShowWeekForm(false)
    } else {
      setErrorMessage(result.error?.error || 'Erreur lors de la création')
    }
  }

  const handleUpdateDayMenu = async (dayMenu: DayMenu) => {
    const result = await updateDayMenu(dayMenu.id, {
      senegalese_id: dayMenu.senegalese.id,
      european_id: dayMenu.european.id,
      is_active: dayMenu.is_active
    })
    
    if (result.success) {
      setSuccessMessage('Menu du jour modifié avec succès')
      fetchWeekMenu()
    } else {
      setErrorMessage(result.error?.error || 'Erreur lors de la modification')
    }
  }

  const handleDeleteDayMenu = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce menu du jour ?')) {
      const result = await deleteDayMenu(id)
      if (result.success) {
        setSuccessMessage('Menu du jour supprimé avec succès')
        fetchWeekMenu()
      } else {
        setErrorMessage(result.error?.error || 'Erreur lors de la suppression')
      }
    }
  }

  const getDayName = (day: string) => {
    const days = {
      'monday': 'Lundi',
      'tuesday': 'Mardi', 
      'wednesday': 'Mercredi',
      'thursday': 'Jeudi',
      'friday': 'Vendredi',
      'saturday': 'Samedi',
      'sunday': 'Dimanche'
    }
    return days[day as keyof typeof days] || day
  }

  // Show loading state if data is being fetched
  if (loading && safeMenuItems.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
          </div>
        </div>
        <Card className="bg-white">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des données...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center">
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

          {/* Items Table */}
          <Card className="bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                 <TableBody>
                   {safeMenuItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant={item.type === 'senegalese' ? 'default' : 'secondary'}>
                          {item.type_display}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {item.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.is_available ? 'default' : 'destructive'}>
                          {item.is_available ? 'Disponible' : 'Indisponible'}
                        </Badge>
                      </TableCell>
                      <TableCell>
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
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Week Menu Tab */}
      {activeTab === 'week' && (
        <div className="space-y-4">
          {/* Week Menu Header */}
          <div className="flex justify-end items-center">
            <Button onClick={() => setShowWeekForm(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Créer Menu Semaine
            </Button>
          </div>

          {/* Week Form */}
          {showWeekForm && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Nouveau Menu de la Semaine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="week_start">Date de début de la semaine</Label>
                  <Input
                    id="week_start"
                    type="date"
                    value={weekForm.week_start}
                    onChange={(e) => setWeekForm({ ...weekForm, week_start: e.target.value })}
                  />
       <p className="text-sm text-gray-500 mt-1">
         Les menus seront créés/mis à jour pour les jours restants de la semaine (y compris aujourd'hui si nécessaire)
       </p>
       <p className="text-xs text-blue-600 mt-1">
         💡 Les menus existants seront mis à jour, les nouveaux seront créés
       </p>
                  {weekForm.week_start && weekForm.menus.length > 0 && (
                    <p className="text-sm text-blue-600 mt-1">
                      Semaine du {new Date(weekForm.week_start).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} - {weekForm.menus.length} jour(s) restant(s)
                    </p>
                  )}
                </div>
       {weekForm.menus.length === 0 && weekForm.week_start && (
         <div className="text-center py-8 text-gray-500">
           <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
           <p>Aucun jour restant dans cette semaine</p>
           <p className="text-sm">Tous les jours de la semaine sont déjà passés ou terminés</p>
         </div>
       )}
                
                <div className="space-y-4">
                  {weekForm.menus.map((menu, index) => (
                    <div key={index} className={`border rounded-lg p-4 ${menu.existing ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium">
                          {menu.dayName} - {menu.date}
                        </h5>
                        {menu.existing && (
                          <Badge variant="secondary" className="text-xs">
                            Menu existant
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Plat Sénégalais</Label>
                          <Select
                            value={menu.senegalese_id.toString()}
                            onValueChange={(value) => {
                              const newMenus = [...weekForm.menus]
                              newMenus[index].senegalese_id = parseInt(value)
                              setWeekForm({ ...weekForm, menus: newMenus })
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un plat" />
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
                            value={menu.european_id.toString()}
                            onValueChange={(value) => {
                              const newMenus = [...weekForm.menus]
                              newMenus[index].european_id = parseInt(value)
                              setWeekForm({ ...weekForm, menus: newMenus })
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un plat" />
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
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleCreateWeekMenu}
                    disabled={!weekForm.week_start}
                  >
                    Créer Menu Semaine
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowWeekForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

           {/* Current Week Menu */}
           {safeWeekMenu && safeWeekMenu.days.length > 0 && (
            <Card className="h-auto flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-blue-600" />
                  Menu de la Semaine du {formatDate(safeWeekMenu.week_start)}
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
              
              <CardContent className="flex-1 overflow-hidden">
                <div className={`grid ${getDynamicGridClasses(safeWeekMenu.days.length)} gap-4 h-full overflow-y-auto custom-scrollbar`}>
                  {safeWeekMenu.days.map((dayMenu) => (
                    <div key={dayMenu.day} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                      {/* En-tête du jour */}
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900 text-center">{dayMenu.day_display}</h3>
                        <p className="text-xs text-gray-500 text-center">{formatDate(dayMenu.date)}</p>
                      </div>

                      {/* Plats */}
                      <div className="p-4 space-y-3">
                        {/* Plat sénégalais */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span className="text-xs font-medium text-orange-700">Sénégalais</span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">
                            {dayMenu.senegalese.name}
                          </p>
                        </div>

                        {/* Plat européen */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-medium text-blue-700">Européen</span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium">
                            {dayMenu.european.name}
                          </p>
                        </div>
                      </div>

                      {/* Boutons d'action */}
                      <div className="p-4 border-t border-gray-100 flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateDayMenu(dayMenu)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteDayMenu(dayMenu.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
           )}

           {(!safeWeekMenu || safeWeekMenu.days.length === 0) && (
            <Card className="bg-white">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun menu de la semaine</h3>
                <p className="text-gray-600">Créez un menu pour la semaine en cours.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
