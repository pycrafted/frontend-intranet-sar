"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Crown,
  Building2,
  ChevronRight,
  ChevronDown,
  Loader2,
  MessageCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Employee } from "@/hooks/useOrgChart"

interface OrgChartProps {
  employees: Employee[]
  loading?: boolean
  error?: string | null
}

const InteractiveOrgChart: React.FC<OrgChartProps> = ({ employees, loading = false, error = null }) => {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isInitialized, setIsInitialized] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<Employee | null>(null)
  const [hoveredNode, setHoveredNode] = useState<Employee | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [containerWidth, setContainerWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()

  console.log('🏢 [INTERACTIVE_ORGCHART] Initialisation - DONNÉES VIA PROPS')

  console.log('📊 [INTERACTIVE_ORGCHART] Données reçues:', {
    source: 'PROPS',
    employeesCount: employees?.length || 0,
    loading,
    error: error || 'Aucune erreur',
    employees: employees?.map(emp => ({ id: emp.id, name: emp.full_name, manager: emp.manager })) || []
  })

  // Convertir les données de l'API en structure hiérarchique
  const buildOrgStructure = (): Employee[] => {
    console.log('🏗️ [INTERACTIVE_ORGCHART] Construction de la structure hiérarchique - DONNÉES VIA API')
    
    // Utiliser les données des employés pour construire la hiérarchie
    if (employees && employees.length > 0) {
      console.log('📊 [INTERACTIVE_ORGCHART] Données employés disponibles:', {
        source: 'API_DATA',
        count: employees.length,
        employees: employees.map(emp => ({ id: emp.id, name: emp.full_name, manager: emp.manager }))
      })
      
      // Créer un map des employés par ID pour un accès rapide
      const employeeMap = new Map<number, Employee>()
      employees.forEach(emp => {
        employeeMap.set(emp.id, { ...emp, children: [] })
      })
      
      // Trouver le CEO (employé sans manager)
      const ceo = employees.find(emp => !emp.manager)
      if (!ceo) {
        console.warn('⚠️ [INTERACTIVE_ORGCHART] Aucun CEO trouvé (employé sans manager)')
        return []
      }
      
      console.log('👑 [INTERACTIVE_ORGCHART] CEO identifié:', {
        id: ceo.id,
        name: ceo.full_name,
        source: 'API_DATA'
      })
      
      // Construire la hiérarchie récursivement
      const buildHierarchy = (employeeId: number): Employee[] => {
        const employee = employeeMap.get(employeeId)
        if (!employee) return []
        
        // Trouver tous les employés qui ont cet employé comme manager
        const subordinates = employees
          .filter(emp => emp.manager === employeeId)
          .map(sub => {
            const subEmployee = employeeMap.get(sub.id)
            if (subEmployee) {
              subEmployee.children = buildHierarchy(sub.id)
            }
            return subEmployee
          })
          .filter(Boolean) as Employee[]
        
        return subordinates
      }
      
      // Construire la hiérarchie à partir du CEO
      const ceoEmployee = employeeMap.get(ceo.id)!
      ceoEmployee.children = buildHierarchy(ceo.id)
      
      console.log('✅ [INTERACTIVE_ORGCHART] Structure hiérarchique construite:', {
        source: 'API_DATA',
        ceo: ceoEmployee.full_name,
        totalSubordinates: ceoEmployee.children.length
      })
      
      return [ceoEmployee]
    }
    
    // Fallback avec des données de démonstration si aucune donnée API
    return [{
      id: 1,
      first_name: "Amadou",
      last_name: "Diallo",
      full_name: "Amadou Diallo",
      initials: "AD",
      email: "amadou.diallo@sar.sn",
      phone: "+221 33 123 4567",
      employee_id: "SAR001",
      position: 1,
      position_title: "Directeur Général",
      department_name: "Direction",
      manager: null,
      manager_name: null,
      hierarchy_level: 1,
      is_manager: true,
      office_location: "Dakar - Siège",
      work_schedule: "Temps plein",
      is_active: true,
      hire_date: "2020-01-01",
      avatar: "/media/avatars/directeur-general--2048x1657.jpg",
      children: []
    }]
  }


  const orgStructure = useMemo(() => {
    const structure = buildOrgStructure()
    console.log('🏗️ [INTERACTIVE_ORGCHART] Structure hiérarchique construite:', {
      orgStructureLength: structure?.length || 0,
      orgStructure: structure?.map(emp => ({ id: emp.id, name: emp.full_name, children: emp.children?.length || 0 })) || []
    })
    return structure
  }, [employees])

  // Effet pour calculer la largeur du conteneur et centrer l'organigramme
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth
        setContainerWidth(width)
        // Centrer l'organigramme horizontalement (largeur approximative de l'organigramme: 1200px)
        const orgChartWidth = 1200
        setPosition({ x: (width - orgChartWidth) / 2, y: 0 })
        setIsInitialized(true)
      }
    }

    // Délai pour s'assurer que le DOM est complètement chargé
    const timeoutId = setTimeout(() => {
      updateContainerWidth()
    }, 100)

    window.addEventListener('resize', updateContainerWidth)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', updateContainerWidth)
    }
  }, [])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    setZoom(1)
    // Centrer l'organigramme horizontalement
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth
      const orgChartWidth = 1200
      setPosition({ x: (width - orgChartWidth) / 2, y: 0 })
      setIsInitialized(true)
    } else {
      setPosition({ x: 0, y: 0 })
    }
    setSelectedNode(null)
  }

  const handleFitToScreen = () => {
    setZoom(1)
    // Centrer l'organigramme horizontalement
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth
      const orgChartWidth = 1200
      setPosition({ x: (width - orgChartWidth) / 2, y: 0 })
      setIsInitialized(true)
    } else {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleFullscreen = async () => {
    if (!containerRef.current) return

    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen()
        } else if ((containerRef.current as any).webkitRequestFullscreen) {
          await (containerRef.current as any).webkitRequestFullscreen()
        } else if ((containerRef.current as any).msRequestFullscreen) {
          await (containerRef.current as any).msRequestFullscreen()
        }
        setIsFullscreen(true)
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Erreur lors du changement de mode plein écran:', error)
    }
  }

  // Écouter les changements de plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isInitialized) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  const getNodeStyle = (employee: Employee) => {
    if (!employee) return {}
    
    const baseStyle = {
      transform: `scale(1)`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    }

    const level = employee.hierarchy_level || employee.level || 1
    
    if (level === 1) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
        boxShadow: '0 20px 40px rgba(220, 38, 38, 0.3)',
        border: '2px solid #fbbf24'
      }
    } else if (employee.level === 2) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
        boxShadow: '0 15px 30px rgba(37, 99, 235, 0.2)',
        border: '2px solid #60a5fa'
      }
    } else {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #059669, #047857)',
        boxShadow: '0 10px 20px rgba(5, 150, 105, 0.2)',
        border: '2px solid #34d399'
      }
    }
  }

  const renderNode = (employee: Employee, x: number, y: number) => {
    // Vérification de sécurité
    if (!employee || !employee.id) {
      console.warn('Employee invalide dans renderNode:', employee)
      return null
    }
    
    const isSelected = selectedNode?.id === employee.id
    const isHovered = hoveredNode?.id === employee.id

    return (
      <div
        key={employee.id}
        className="absolute cursor-pointer group"
        style={{
          left: x,
          top: y,
          transform: `translate(-50%, -50%) scale(${isHovered ? 1.05 : 1})`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: isSelected ? 20 : employee.level === 1 ? 15 : 10
        }}
        onMouseEnter={() => setHoveredNode(employee)}
        onMouseLeave={() => setHoveredNode(null)}
        onClick={() => setSelectedNode(employee)}
      >
        <Card
          className={cn(
            "w-44 h-28 relative overflow-hidden",
            "hover:shadow-2xl transition-all duration-300",
            isSelected && "ring-4 ring-yellow-400 ring-opacity-50",
            isHovered && "shadow-2xl"
          )}
          style={getNodeStyle(employee)}
        >
          {/* Effet de brillance */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          

          <CardContent className="p-2 h-full flex flex-col justify-center text-center text-white relative z-10">
            <div className="flex items-center justify-center mb-1">
              <Avatar className="w-6 h-6 mr-1">
                <AvatarImage 
                  src={employee.avatar ? `${process.env.NEXT_PUBLIC_API_URL || 'https://backend-intranet-sar-1.onrender.com'}${employee.avatar}` : "/placeholder.svg"} 
                  alt={employee.full_name || employee.name || "Employé"} 
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <AvatarFallback className="text-xs font-bold">
                  {employee.initials || "??"}
                </AvatarFallback>
              </Avatar>
              {(employee.hierarchy_level || employee.level || 1) === 1 && <Crown className="w-3 h-3 text-yellow-300" />}
            </div>
            
            <h4 className="font-bold text-xs leading-tight mb-1">
              {employee.full_name || employee.name || "Nom inconnu"}
            </h4>
            
            <p className="text-xs opacity-90 mb-1 leading-tight">
              {employee.position_title || employee.role || "Poste inconnu"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderConnection = (from: { x: number, y: number }, to: { x: number, y: number }) => {
    const midX = (from.x + to.x) / 2
    const midY = (from.y + to.y) / 2
    const length = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2))
    const angle = Math.atan2(to.y - from.y, to.x - from.x) * 180 / Math.PI

    return (
      <div
        key={`${from.x}-${from.y}-${to.x}-${to.y}`}
        className="absolute pointer-events-none"
        style={{
          left: from.x,
          top: from.y,
          width: length,
          height: 2,
          background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)',
          transformOrigin: '0 50%',
          transform: `rotate(${angle}deg)`,
          opacity: 0.6,
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
        }}
      />
    )
  }

  const renderOrgChart = () => {
    const nodes: JSX.Element[] = []
    const connections: JSX.Element[] = []
    
    // Vérification de sécurité
    if (!orgStructure || orgStructure.length === 0) {
      console.warn('Aucune structure organisationnelle trouvée')
      return { nodes, connections }
    }
    
    // Construire la hiérarchie dynamiquement avec positionnement intelligent
    const buildHierarchy = (employee: Employee, x: number, y: number, level: number = 0, usedPositions: Set<string> = new Set()): void => {
      // Éviter les positions dupliquées
      const positionKey = `${x},${y}`
      if (usedPositions.has(positionKey)) {
        // Ajuster la position si elle est déjà utilisée
        x += 50
        y += 20
      }
      usedPositions.add(`${x},${y}`)
      
      const node = renderNode(employee, x, y)
      if (node) {
        nodes.push(node)
      }
      
      const children = employee.children || []
      if (children.length > 0) {
        const nextY = y + 250 // Plus d'espace vertical
        const baseSpacing = 300 // Espacement de base plus large
        const spacing = Math.max(baseSpacing, baseSpacing / Math.max(1, children.length))
        const startX = x - ((children.length - 1) * spacing) / 2
        
        children.forEach((child, index) => {
          const childX = startX + index * spacing
          const childY = nextY
          
          // Vérifier que la position n'est pas déjà utilisée
          const childPositionKey = `${childX},${childY}`
          if (!usedPositions.has(childPositionKey)) {
            // Ajouter la connexion
            connections.push(renderConnection({ x, y }, { x: childX, y: childY }))
            
            // Récursion pour les enfants
            buildHierarchy(child, childX, childY, level + 1, usedPositions)
          }
        })
      }
    }
    
    // Position centrale pour le directeur général
    const centerX = 600
    const centerY = 100
    
    // Construire la hiérarchie à partir du CEO
    const ceo = orgStructure[0]
    if (ceo && ceo.id) {
      buildHierarchy(ceo, centerX, centerY)
    }
    
    return { nodes, connections }
  }

  const { nodes, connections } = renderOrgChart()

  // Gestion du loading et des erreurs
  if (loading) {
    return (
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#e5e7eb' }}>
        <div className="text-center text-slate-600">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Chargement de l'organigramme...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#e5e7eb' }}>
        <div className="text-center text-slate-600">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-lg mb-2">Erreur de chargement</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    )
  }

  if (!orgStructure || orgStructure.length === 0) {
    console.log('⚠️ [INTERACTIVE_ORGCHART] Aucune structure hiérarchique trouvée:', {
      orgStructure,
      orgStructureLength: orgStructure?.length,
      employeesCount: employees?.length,
      employees: employees?.map(emp => ({ id: emp.id, name: emp.full_name, manager: emp.manager }))
    })
    return (
      <div className="relative w-full h-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#e5e7eb' }}>
        <div className="text-center text-slate-600">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <p className="text-lg mb-2">Aucun employé trouvé</p>
          <p className="text-sm opacity-80">Ajoutez des employés dans l'administration Django</p>
          <p className="text-xs opacity-60 mt-2">
            Debug: {employees?.length || 0} employés reçus
          </p>
        </div>
      </div>
    )
  }

  console.log('🎨 [INTERACTIVE_ORGCHART] Rendu principal de l\'organigramme:', {
    orgStructureLength: orgStructure?.length,
    isInitialized,
    containerWidth,
    zoom,
    position
  })

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden ${isFullscreen ? 'h-screen' : 'h-full'}`} 
      style={{ backgroundColor: '#e5e7eb', minHeight: '600px' }}
    >

      {/* Contrôles */}
      <div className="absolute top-4 right-4 z-30 flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          className="bg-black bg-opacity-50 text-white border-white border-opacity-30 hover:bg-opacity-70"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          className="bg-black bg-opacity-50 text-white border-white border-opacity-30 hover:bg-opacity-70"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="bg-black bg-opacity-50 text-white border-white border-opacity-30 hover:bg-opacity-70"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleFullscreen}
          className="bg-black bg-opacity-50 text-white border-white border-opacity-30 hover:bg-opacity-70"
        >
          {isFullscreen ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Zone de dessin */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {/* Connexions */}
        {connections}

        {/* Nœuds */}
        {nodes}
      </div>

      {/* Panneau d'informations - Style Annuaire */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-30 w-80">
          <Card className="group hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-blue-300 bg-white">
            <CardHeader className="text-center pb-4 pt-6">
              <div className="relative">
                <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-slate-100 group-hover:ring-blue-100 transition-all duration-300">
                  <AvatarImage 
                    src={selectedNode.avatar ? `${process.env.NEXT_PUBLIC_API_URL || 'https://backend-intranet-sar-1.onrender.com'}${selectedNode.avatar}` : "/placeholder.svg"} 
                    alt={selectedNode.full_name || selectedNode.name || "Employé"} 
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    {selectedNode.initials || "??"}
                  </AvatarFallback>
                </Avatar>
                {(selectedNode.hierarchy_level || selectedNode.level || 1) === 1 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-yellow-800 text-lg">👑</span>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedNode(null)}
                  className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full p-0 shadow-lg"
                >
                  ×
                </Button>
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {selectedNode.full_name || selectedNode.name || "Nom inconnu"}
              </CardTitle>
              <CardDescription className="text-sm font-medium text-blue-600">
                {selectedNode.position_title || selectedNode.role || "Poste inconnu"}
              </CardDescription>
              <Badge variant="outline" className="w-fit mx-auto mt-2 border-slate-200 text-slate-600 bg-slate-50">
                {selectedNode.department_name || selectedNode.department || "Département inconnu"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span className="truncate">{selectedNode.email || "Email non renseigné"}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600">
                  <Phone className="h-4 w-4 text-green-500" />
                  <span>{selectedNode.phone || "Téléphone non renseigné"}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all"
                  onClick={() => window.open(`mailto:${selectedNode.email}`)}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Email
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-all"
                  onClick={() => {
                    // Fonctionnalité de chat future
                    
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Chatter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}


    </div>
  )
}

export default InteractiveOrgChart
