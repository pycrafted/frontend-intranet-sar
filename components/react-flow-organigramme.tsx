"use client"

import type React from "react"
import { useState, useCallback, useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type NodeTypes,
  type EdgeTypes,
  type Node,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { X, Mail, Phone, Award as IdCard, User } from "lucide-react"
import CustomEdge from "./custom-edge"
import { EmployeeNode } from "./nodes/employee-node"
import type { Employee } from "@/hooks/useOrgChart"

const nodeTypes: NodeTypes = {
  employee: EmployeeNode,
}

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

interface ReactFlowOrganigrammeProps {
  employees: Employee[]
  loading?: boolean
  error?: string | null
  onEmployeeSelect?: (employee: Employee) => void
}

export interface ReactFlowOrganigrammeRef {
  selectEmployeeByName: (name: string) => void
  selectEmployeeById: (id: number) => void
}

const ReactFlowOrganigramme = forwardRef<ReactFlowOrganigrammeRef, ReactFlowOrganigrammeProps>(({ employees, loading = false, error = null, onEmployeeSelect }, ref) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  // Le viewport sera calculé dynamiquement

  // Debug: Log des employés reçus
  console.log('🎯 [REACT_FLOW] Employés reçus:', {
    count: employees?.length || 0,
    employees: employees?.map(emp => ({
      id: emp.id,
      name: emp.full_name,
      department: emp.department_name,
      directions: []
    })) || []
  })

  // Calculer la configuration responsive basée sur la grille
  const getResponsiveConfig = useCallback(() => {
    if (typeof window === 'undefined') {
      return {
        nodeWidth: 220, // Largeur comme dans l'exemple
        nodeHeight: 280,
        horizontalSpacing: 300,
        verticalSpacing: 200,
        zoom: 0.6,
        padding: 50,
        gridCols: 1
      }
    }

    const width = window.innerWidth
    const employeeCount = employees?.length || 1

    // Configuration basée sur la largeur d'écran avec espacement fixe comme dans l'exemple
    let config
    if (width < 640) {
      // Mobile - 1 colonne
      config = {
        nodeWidth: 200, // Mobile - légèrement plus petit
        nodeHeight: 240,
        horizontalSpacing: 0,
        verticalSpacing: 250,
        zoom: 1.2,
        padding: 20,
        gridCols: 1
      }
    } else if (width < 768) {
      // Small tablet - 2 colonnes
      config = {
        nodeWidth: 220, // Largeur comme dans l'exemple
        nodeHeight: 260,
        horizontalSpacing: 320, // Espacement proportionnel (220 + 100)
        verticalSpacing: 280,
        zoom: 1.1,
        padding: 30,
        gridCols: 2
      }
    } else if (width < 1024) {
      // Tablet - 3 colonnes
      config = {
        nodeWidth: 220, // Largeur comme dans l'exemple
        nodeHeight: 280,
        horizontalSpacing: 320, // Espacement proportionnel (220 + 100)
        verticalSpacing: 320,
        zoom: 1.0,
        padding: 40,
        gridCols: 3
      }
    } else if (width < 1280) {
      // Desktop - 4 colonnes
      config = {
        nodeWidth: 240, // Desktop - plus grand
        nodeHeight: 300,
        horizontalSpacing: 340, // Espacement proportionnel (240 + 100)
        verticalSpacing: 360,
        zoom: 0.9,
        padding: 50,
        gridCols: 4
      }
    } else if (width < 1536) {
      // Large desktop - 5 colonnes
      config = {
        nodeWidth: 260, // Large desktop - encore plus grand
        nodeHeight: 320,
        horizontalSpacing: 360, // Espacement proportionnel (260 + 100)
        verticalSpacing: 400,
        zoom: 0.8,
        padding: 60,
        gridCols: 5
      }
    } else {
      // Ultra wide - 6 colonnes
      config = {
        nodeWidth: 280, // Ultra wide - le plus grand
        nodeHeight: 340,
        horizontalSpacing: 380, // Espacement proportionnel (280 + 100)
        verticalSpacing: 440,
        zoom: 0.7,
        padding: 80,
        gridCols: 6
      }
    }

    return config
  }, [employees?.length])

  const config = getResponsiveConfig()
  console.log('📐 [REACT_FLOW] Configuration responsive:', config)

  // Convertir les employés en nœuds React Flow et calculer le viewport optimal
  const { nodes, edges, optimalViewport } = useMemo((): { nodes: Node[], edges: Edge[], optimalViewport: { x: number, y: number, zoom: number } } => {
    console.log('🔄 [REACT_FLOW] Construction des nœuds avec employés:', employees?.length || 0)
    
    if (!employees || employees.length === 0) {
      console.log('❌ [REACT_FLOW] Aucun employé, retour de nœuds vides')
      return { nodes: [], edges: [], optimalViewport: { x: 0, y: 0, zoom: 1 } }
    }

    // Créer un map des employés par ID
    const employeeMap = new Map<number, Employee>()
    employees.forEach(emp => {
      employeeMap.set(emp.id, emp)
    })

    // Trouver le CEO (employé sans manager) - optionnel pour le filtrage
    const ceo = employees.find(emp => !emp.manager)
    console.log('👑 [REACT_FLOW] CEO trouvé:', ceo ? { id: ceo.id, name: ceo.full_name } : 'Aucun')
    
    // Si pas de CEO, afficher tous les employés de la direction en grille
    if (!ceo) {
      console.log('🔄 [REACT_FLOW] Pas de CEO, affichage de tous les employés de la direction en grille')
      const nodes: Node[] = []
      const edges: Edge[] = []
      
      // Calculer les positions en grille
      const cols = config.gridCols
      const rows = Math.ceil(employees.length / cols)
      
      // Centrer la grille sur l'axe X uniquement
      // Calculer la largeur totale nécessaire : (nombre de colonnes - 1) * espacement + largeur d'une carte
      const totalWidth = (cols - 1) * config.horizontalSpacing + config.nodeWidth
      const totalHeight = (rows - 1) * config.verticalSpacing + config.nodeHeight
      const startX = -totalWidth / 2
      const startY = 0
      
      console.log('📐 [REACT_FLOW] Calcul de la grille:', {
        cols,
        rows,
        totalWidth,
        totalHeight,
        startX,
        startY,
        horizontalSpacing: config.horizontalSpacing,
        nodeWidth: config.nodeWidth
      })
      
      employees.forEach((employee, index) => {
        const row = Math.floor(index / cols)
        const col = index % cols
        
        const x = startX + col * config.horizontalSpacing
        const y = startY + row * config.verticalSpacing
        
        const node: Node = {
          id: employee.id.toString(),
          type: 'employee',
          position: { x, y },
          style: {
            width: config.nodeWidth,
            height: config.nodeHeight,
          },
          data: { 
            employee,
            config: config
          }
        }
        nodes.push(node)
      })
      
      // Le viewport sera géré par fitView et les useEffect
      return { nodes, edges, optimalViewport: { x: 0, y: 0, zoom: 1 } }
    }

    // Construire la hiérarchie récursivement
    const buildHierarchy = (employee: Employee, level: number = 0, x: number = 0, y: number = 0): { nodes: Node[], edges: Edge[], optimalViewport: { x: number, y: number, zoom: number } } => {
      const node: Node = {
        id: employee.id.toString(),
        type: "employee",
        position: { x, y },
        style: {
          width: config.nodeWidth,
          height: config.nodeHeight,
        },
        data: {
          employee,
          onMouseEnter: () => setHoveredNodeId(employee.id.toString()),
          onMouseLeave: () => setHoveredNodeId(null),
          isHighlighted: false,
          config: config, // Passer la config au composant
        },
      }

      const nodes = [node]
      const edges: Edge[] = []

      // Trouver les subordonnés
      const subordinates = employees.filter(emp => emp.manager === employee.id)
      
      if (subordinates.length > 0) {
        // Calculer la largeur totale nécessaire pour tous les subordonnés
        let totalChildrenWidth = 0
        const childWidths: number[] = []
        
        subordinates.forEach(sub => {
          const subWidth = calculateTotalWidth(sub)
          childWidths.push(subWidth)
          totalChildrenWidth += subWidth
        })
        
        // Ajouter l'espacement entre les enfants
        if (subordinates.length > 1) {
          totalChildrenWidth += (subordinates.length - 1) * config.horizontalSpacing
        }
        
        // Centrer les subordonnés sous le manager
        const startX = x - totalChildrenWidth / 2
        const startY = y + config.verticalSpacing
        
        let currentX = startX
        
        subordinates.forEach((sub, index) => {
          const subWidth = childWidths[index]
          const subX = currentX + subWidth / 2 - config.nodeWidth / 2
          const subY = startY
          
          const subResult = buildHierarchy(sub, level + 1, subX, subY)
          nodes.push(...subResult.nodes)
          edges.push(...subResult.edges)
          
          // Ajouter l'edge vers le subordonné
          edges.push({
            id: `e-${employee.id}-${sub.id}`,
            source: employee.id.toString(),
            target: sub.id.toString(),
            type: "custom",
            data: { isHighlighted: false }
          })
          
          // Déplacer la position pour le prochain enfant
          currentX += subWidth + config.horizontalSpacing
        })
      }

      return { nodes, edges, optimalViewport: { x: 0, y: 0, zoom: 1 } }
    }

    // Calculer la largeur totale de l'organigramme pour centrer le CEO
    const calculateTotalWidth = (emp: Employee, level: number = 0): number => {
      const subordinates = employees.filter(e => e.manager === emp.id)
      if (subordinates.length === 0) return config.nodeWidth
      
      // Calculer la largeur totale nécessaire pour tous les subordonnés
      let totalChildrenWidth = 0
      subordinates.forEach(sub => {
        const subWidth = calculateTotalWidth(sub, level + 1)
        totalChildrenWidth += subWidth
      })
      
      // Ajouter l'espacement entre les enfants (nombre d'enfants - 1) * espacement
      if (subordinates.length > 1) {
        totalChildrenWidth += (subordinates.length - 1) * config.horizontalSpacing
      }
      
      return Math.max(config.nodeWidth, totalChildrenWidth)
    }
    
    const totalOrgWidth = calculateTotalWidth(ceo)
    const ceoX = -totalOrgWidth / 2
    
    console.log('👑 [REACT_FLOW] Calcul du CEO:', {
      totalOrgWidth,
      ceoX,
      ceoName: ceo.full_name
    })
    
    const result = buildHierarchy(ceo, 0, ceoX, 0)
    console.log('✅ [REACT_FLOW] Nœuds générés:', { 
      nodesCount: result.nodes.length, 
      edgesCount: result.edges.length,
      nodeIds: result.nodes.map(n => n.id),
      nodePositions: result.nodes.map(n => ({ id: n.id, x: n.position.x, y: n.position.y }))
    })
    
    // Le viewport sera géré par fitView et les useEffect
    return { ...result, optimalViewport: { x: 0, y: 0, zoom: 1 } }
  }, [employees, config.horizontalSpacing, config.verticalSpacing, config.gridCols])

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes)
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges)

  // Synchroniser les nœuds et edges quand ils changent
  useEffect(() => {
    console.log('🔄 [REACT_FLOW] Mise à jour des nœuds:', { 
      oldCount: nodesState.length, 
      newCount: nodes.length,
      nodeIds: nodes.map(n => n.id)
    })
    setNodes(nodes)
    setEdges(edges)
  }, [nodes, edges, setNodes, setEdges])

  // Forcer le centrage parfait après l'initialisation
  useEffect(() => {
    if (reactFlowInstance && nodes && nodes.length > 0) {
      console.log('🎯 [REACT_FLOW] Forçage du centrage parfait...')
      
      // Délai pour s'assurer que React Flow est complètement initialisé
      setTimeout(() => {
        // Calculer le zoom optimal selon la taille d'écran
        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight
        
        let optimalZoom = 0.5
        if (screenWidth < 640) optimalZoom = 0.8      // Mobile
        else if (screenWidth < 768) optimalZoom = 0.6  // Small tablet
        else if (screenWidth < 1024) optimalZoom = 0.5 // Tablet
        else if (screenWidth < 1280) optimalZoom = 0.4 // Desktop
        else if (screenWidth < 1536) optimalZoom = 0.3 // Large desktop
        else optimalZoom = 0.25                        // Ultra wide
        
        // Utiliser fitView pour centrer parfaitement
        reactFlowInstance.fitView({
          padding: 0.1,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 2
        })
        
        // Ajuster la position Y et le zoom pour remonter l'organigramme
        const currentViewport = reactFlowInstance.getViewport()
        const yOffset = screenHeight * 0.15 // Remonte de 15%
        
        reactFlowInstance.setViewport({
          x: currentViewport.x,
          y: currentViewport.y - yOffset,
          zoom: Math.min(optimalZoom, currentViewport.zoom) // Utiliser le zoom optimal
        })
        
        console.log('✅ [REACT_FLOW] Centrage parfait appliqué:', {
          originalY: currentViewport.y,
          adjustedY: currentViewport.y - yOffset,
          zoom: currentViewport.zoom
        })
      }, 200)
    }
  }, [reactFlowInstance, nodes])

  // Hook pour détecter les changements de taille d'écran et recentrer
  useEffect(() => {
    const handleResize = () => {
      if (reactFlowInstance && employees && employees.length > 0) {
        console.log('📱 [REACT_FLOW] Redimensionnement détecté, recentrage...')
        
        // Recentrer avec fitView après redimensionnement
        setTimeout(() => {
          // Calculer le zoom optimal selon la nouvelle taille d'écran
          const screenWidth = window.innerWidth
          const screenHeight = window.innerHeight
          
          let optimalZoom = 0.5
          if (screenWidth < 640) optimalZoom = 0.8      // Mobile
          else if (screenWidth < 768) optimalZoom = 0.6  // Small tablet
          else if (screenWidth < 1024) optimalZoom = 0.5 // Tablet
          else if (screenWidth < 1280) optimalZoom = 0.4 // Desktop
          else if (screenWidth < 1536) optimalZoom = 0.3 // Large desktop
          else optimalZoom = 0.25                        // Ultra wide
          
          reactFlowInstance.fitView({
            padding: 0.1,
            includeHiddenNodes: false,
            minZoom: 0.1,
            maxZoom: 2
          })
          
          // Ajuster la position Y et le zoom
          const currentViewport = reactFlowInstance.getViewport()
          const yOffset = screenHeight * 0.15
          
          reactFlowInstance.setViewport({
            x: currentViewport.x,
            y: currentViewport.y - yOffset,
            zoom: Math.min(optimalZoom, currentViewport.zoom)
          })
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [reactFlowInstance, employees?.length])

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    [setEdges],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    onEmployeeSelect?.(node.data.employee as Employee)
  }, [onEmployeeSelect])

  // Méthodes exposées via ref
  useImperativeHandle(ref, () => ({
    selectEmployeeByName: (name: string) => {
      const searchTerm = name.toLowerCase().trim()
      console.log('🔍 [REACT_FLOW] Recherche d\'employé:', { searchTerm, employeesCount: employees.length })
      
      // 1. Recherche exacte par nom complet (priorité maximale)
      let employee = employees.find(emp => 
        emp.full_name.toLowerCase() === searchTerm
      )
      console.log('1️⃣ [REACT_FLOW] Recherche exacte:', employee ? employee.full_name : 'Aucun')
      
      // 2. Si pas trouvé, recherche par nom complet qui commence par le terme
      if (!employee) {
        employee = employees.find(emp => 
          emp.full_name.toLowerCase().startsWith(searchTerm)
        )
        console.log('2️⃣ [REACT_FLOW] Recherche par début:', employee ? employee.full_name : 'Aucun')
      }
      
      // 3. Si pas trouvé, recherche par prénom seul (premier mot)
      if (!employee) {
        const firstName = searchTerm.split(' ')[0]
        employee = employees.find(emp => {
          const empFirstName = emp.full_name.split(' ')[0].toLowerCase()
          return empFirstName === firstName
        })
        console.log('3️⃣ [REACT_FLOW] Recherche par prénom:', { firstName, found: employee ? employee.full_name : 'Aucun' })
      }
      
      // 4. Si pas trouvé, recherche par nom de famille seul (dernier mot)
      if (!employee) {
        const lastName = searchTerm.split(' ').pop()
        if (lastName) {
          employee = employees.find(emp => {
            const empLastName = emp.full_name.split(' ').pop()?.toLowerCase()
            return empLastName === lastName
          })
          console.log('4️⃣ [REACT_FLOW] Recherche par nom:', { lastName, found: employee ? employee.full_name : 'Aucun' })
        }
      }
      
      // 5. En dernier recours, recherche par inclusion (comme avant)
      if (!employee) {
        employee = employees.find(emp => 
          emp.full_name.toLowerCase().includes(searchTerm)
        )
        console.log('5️⃣ [REACT_FLOW] Recherche par inclusion:', employee ? employee.full_name : 'Aucun')
      }
      
      if (employee) {
        console.log('✅ [REACT_FLOW] Employé trouvé:', employee.full_name)
        const node = nodes.find(n => (n.data.employee as Employee).id === employee.id)
        if (node) {
          setSelectedNode(node)
          onEmployeeSelect?.(employee)
        }
      } else {
        console.log('❌ [REACT_FLOW] Aucun employé trouvé pour:', searchTerm)
      }
    },
    selectEmployeeById: (id: number) => {
      const employee = employees.find(emp => emp.id === id)
      if (employee) {
        const node = nodes.find(n => (n.data.employee as Employee).id === employee.id)
        if (node) {
          setSelectedNode(node)
          onEmployeeSelect?.(employee)
        }
      }
    }
  }), [employees, nodes, onEmployeeSelect])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const findPathToCEO = useCallback((nodeId: string, edges: Edge[]): { edgeIds: string[]; nodeIds: string[] } => {
    const edgeIds: string[] = []
    const nodeIds: string[] = [nodeId]
    let currentNodeId = nodeId
    const ceoId = nodes.find(n => (n.data.employee as Employee).manager === null)?.id

    if (!ceoId) return { edgeIds, nodeIds }

    const visited = new Set<string>()

    while (currentNodeId !== ceoId && !visited.has(currentNodeId)) {
      visited.add(currentNodeId)

      const parentEdge = edges.find((edge) => edge.target === currentNodeId)
      if (!parentEdge) break

      edgeIds.push(parentEdge.id)
      currentNodeId = parentEdge.source
      nodeIds.push(currentNodeId)
    }

    return { edgeIds, nodeIds }
  }, [nodes])

  const highlightedPath = useMemo(() => {
    if (!hoveredNodeId) return { edgeIds: new Set<string>(), nodeIds: new Set<string>() }
    const path = findPathToCEO(hoveredNodeId, edgesState)
    return {
      edgeIds: new Set(path.edgeIds),
      nodeIds: new Set(path.nodeIds),
    }
  }, [hoveredNodeId, edgesState, findPathToCEO])

  const edgesWithHighlight = useMemo(() => {
    return edgesState.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        isHighlighted: highlightedPath.edgeIds.has(edge.id),
      },
    }))
  }, [edgesState, highlightedPath.edgeIds])

  const nodesWithHoverHandler = useMemo(() => {
    return nodesState.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onMouseEnter: () => setHoveredNodeId(node.id),
        onMouseLeave: () => setHoveredNodeId(null),
        isHighlighted: highlightedPath.nodeIds.has(node.id),
      },
    }))
  }, [nodesState, highlightedPath.nodeIds])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Chargement de l'organigramme...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-lg mb-2">Erreur de chargement</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!employees || employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8" />
          </div>
          <p className="text-lg mb-2">Aucun employé trouvé</p>
          <p className="text-sm text-gray-600">Ajoutez des employés dans l'administration Django</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen relative bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodesWithHoverHandler}
              edges={edgesWithHighlight}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView={true}
              fitViewOptions={{
                padding: 0.1,
                includeHiddenNodes: false,
                minZoom: 0.1,
                maxZoom: 2
              }}
              snapToGrid
              snapGrid={[15, 15]}
              defaultEdgeOptions={{ type: "custom" }}
              minZoom={0.1}
              maxZoom={2}
              translateExtent={[[-2000, -2000], [2000, 2000]]}
              panOnScroll={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
              panOnDrag={true}
              selectNodesOnDrag={false}
            >
              <Background />
              <Controls 
                position="top-right"
                showZoom={true}
                showFitView={true}
                showInteractive={false}
                style={{
                  top: '10px',
                  right: '10px',
                  zIndex: 10
                }}
                className="!bg-white/90 !backdrop-blur-sm !border !border-gray-200 !rounded-lg !shadow-lg"
              />
              <MiniMap 
                position="top-left"
                style={{
                  top: '10px',
                  left: '10px',
                  zIndex: 10
                }}
                className="!bg-white/90 !backdrop-blur-sm !border !border-gray-200 !rounded-lg !shadow-lg"
                nodeColor={(node) => {
                  const employee = node.data?.employee as Employee
                  if (employee && !employee.manager) {
                    return '#f59e0b' // Amber pour le CEO
                  }
                  return '#6b7280' // Gray pour les autres
                }}
                maskColor="rgba(0, 0, 0, 0.1)"
              />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {selectedNode && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setSelectedNode(null)}
        >
          {(() => {
            const employee = selectedNode.data.employee as Employee
            const isCEO = !employee.manager
            return (
              <div
                className={`rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-lg lg:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden ${
                  isCEO 
                    ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200" 
                    : "bg-white"
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header Section with Photo - Responsive */}
                <div className={`relative px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-12 pb-6 sm:pb-8 ${
                  isCEO 
                    ? "bg-gradient-to-br from-amber-100 to-yellow-100" 
                    : "bg-gradient-to-br from-slate-50 to-slate-100"
                }`}>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 lg:top-6 lg:right-6 p-1.5 sm:p-2 hover:bg-white/80 rounded-full transition-all duration-200 group"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 group-hover:text-slate-900" />
                  </button>

                  {/* Photo and Basic Info - Responsive */}
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4 sm:mb-6">
                      {/* Couronne pour le DG - Responsive */}
                      {isCEO && (
                        <div className="absolute -top-2 sm:-top-3 lg:-top-4 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                            <svg 
                              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7 text-white" 
                              fill="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className={`w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-full overflow-hidden ring-2 sm:ring-4 shadow-lg sm:shadow-xl ${
                        isCEO ? "ring-amber-300" : "ring-white"
                      }`}>
                        <img
                          src={employee.avatar || "/placeholder-user.jpg"}
                          alt={employee.full_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback vers l'avatar par défaut si l'image ne charge pas
                            const target = e.target as HTMLImageElement;
                            if (target.src !== "/placeholder-user.jpg") {
                              target.src = "/placeholder-user.jpg";
                            }
                          }}
                        />
                      </div>
                    </div>

                    <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 tracking-tight ${
                      isCEO ? "text-amber-900" : "text-slate-900"
                    }`}>
                      {employee.full_name}
                    </h2>
                    <p className={`text-sm sm:text-base lg:text-lg mb-2 sm:mb-3 font-medium ${
                      isCEO ? "text-amber-800" : "text-slate-600"
                    }`}>
                      {employee.job_title}
                    </p>
                    <span className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium rounded-full shadow-sm ${
                      isCEO 
                        ? "bg-amber-200 text-amber-800 border border-amber-300" 
                        : "bg-white text-slate-700 border border-slate-200"
                    }`}>
                      {employee.department_name}
                    </span>
                  </div>
                </div>

            {/* Content Section - Responsive */}
            <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 overflow-y-auto max-h-[calc(90vh-200px)] sm:max-h-[calc(85vh-280px)]">
              {/* Contact Information - Responsive */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span>Contact</span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <a
                    href={`mailto:${employee.email}`}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">Email</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 truncate">{employee.email}</p>
                    </div>
                  </a>

                  <a
                    href={`tel:${employee.phone_fixed || employee.phone_mobile}`}
                    className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">Téléphone</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-900">
                        {employee.phone_fixed || employee.phone_mobile}
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Employment Details - Responsive */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 sm:mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span className="text-xs sm:text-xs">Informations Professionnelles</span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <IdCard className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">Matricule</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-900">{employee.matricule}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">Manager</p>
                      <p className="text-xs sm:text-sm font-medium text-slate-900">
                        {employee.manager_name || "Aucun"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
})

ReactFlowOrganigramme.displayName = "ReactFlowOrganigramme"

export default ReactFlowOrganigramme
