 "use client"

import type React from "react"
import { useState, useCallback, useRef, useMemo, useEffect, forwardRef, useImperativeHandle } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
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
import "@/styles/organigramme.css"
import { User } from "lucide-react"
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
  sidebarWidth?: number
}

export interface ReactFlowOrganigrammeRef {
  selectEmployeeByName: (name: string) => void
  selectEmployeeById: (id: number) => void
}

const ReactFlowOrganigramme = forwardRef<ReactFlowOrganigrammeRef, ReactFlowOrganigrammeProps>(({ employees, loading = false, error = null, sidebarWidth = 0 }, ref) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)
  const [viewportCenter, setViewportCenter] = useState<{ x: number; y: number } | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStartCenter, setPanStartCenter] = useState<{ x: number; y: number } | null>(null)

  // Debug: Log des employés reçus
  console.log('🎯 [REACT_FLOW] Employés reçus:', {
    count: employees?.length || 0,
    employees: employees?.map(emp => ({
      id: emp.id,
      name: emp.full_name,
      department: emp.main_direction_name,
      directions: []
    })) || []
  })

  // Calculer la configuration responsive avec taille fixe des cartes
  const getResponsiveConfig = useCallback(() => {
    if (typeof window === 'undefined') {
      return {
        nodeWidth: 240, // Taille fixe - ne varie pas selon le nombre de cartes
        nodeHeight: 300,
        horizontalSpacing: 60, // Espacement minimal pour rapprocher au maximum les cartes
        verticalSpacing: 500, // Augmenté pour une ligne verticale plus longue
        zoom: 0.6,
        padding: 50,
        gridCols: 1
      }
    }

    const width = window.innerWidth

    // Configuration avec taille fixe des cartes et gap adaptatif
    // Même configuration sur mobile et desktop pour permettre le scroll
    let config
    if (width < 640) {
      // Mobile - même configuration que desktop pour permettre le scroll
      config = {
        nodeWidth: 240, // Même taille que desktop
        nodeHeight: 300,
        horizontalSpacing: 60, // Espacement minimal pour rapprocher au maximum les cartes
        verticalSpacing: 500, // Augmenté pour une ligne verticale plus longue
        zoom: 0.6, // Même zoom que desktop pour voir tout l'organigramme
        padding: 50,
        gridCols: 1
      }
    } else if (width < 768) {
      // Small tablet
      config = {
        nodeWidth: 220, // Taille fixe
        nodeHeight: 260,
        horizontalSpacing: 60, // Espacement minimal pour rapprocher au maximum les cartes
        verticalSpacing: 450, // Augmenté pour une ligne verticale plus longue
        zoom: 0.9,
        padding: 30,
        gridCols: 2
      }
    } else if (width < 1024) {
      // Tablet
      config = {
        nodeWidth: 240, // Taille fixe - w-56 md:w-64 équivalent
        nodeHeight: 300,
        horizontalSpacing: 70, // Espacement minimal pour rapprocher au maximum les cartes
        verticalSpacing: 500, // Augmenté pour une ligne verticale plus longue
        zoom: 0.8,
        padding: 40,
        gridCols: 3
      }
    } else if (width < 1280) {
      // Desktop - largeurs fixes
      config = {
        nodeWidth: 240, // w-56 md:w-64 - taille fixe
        nodeHeight: 300,
        horizontalSpacing: 80, // Espacement minimal pour rapprocher au maximum les cartes
        verticalSpacing: 550, // Augmenté pour une ligne verticale plus longue
        zoom: 0.7,
        padding: 50,
        gridCols: 4
      }
    } else if (width < 1536) {
      // Large desktop
      config = {
        nodeWidth: 256, // w-64 - taille fixe
        nodeHeight: 320,
        horizontalSpacing: 90, // Espacement minimal pour rapprocher au maximum les cartes
        verticalSpacing: 580, // Augmenté pour une ligne verticale plus longue
        zoom: 0.65,
        padding: 60,
        gridCols: 5
      }
    } else {
      // Ultra wide
      config = {
        nodeWidth: 256, // w-64 - taille fixe
        nodeHeight: 320,
        horizontalSpacing: 100, // Espacement minimal pour rapprocher au maximum les cartes
        verticalSpacing: 600, // Augmenté pour une ligne verticale plus longue
        zoom: 0.6,
        padding: 80,
        gridCols: 6
      }
    }

    return config
  }, [])

  const config = getResponsiveConfig()
  console.log('📐 [REACT_FLOW] Configuration responsive:', config)

  // Fonction pour calculer la largeur totale d'un sous-arbre (avec rendu conditionnel et répartition équitable)
  const calculateTotalWidth = (emp: Employee, level: number = 0): number => {
    const subordinates = employees?.filter(e => e.manager === emp.id) || []
    if (subordinates.length === 0) return config.nodeWidth
    
    // Calculer la largeur totale nécessaire pour tous les subordonnés
    const childWidths: number[] = []
    subordinates.forEach(sub => {
      const subWidth = calculateTotalWidth(sub, level + 1)
      childWidths.push(subWidth)
    })
    
    // Répartition équitable selon la règle :
    // - Si nombre pair x : x/2 à gauche, x/2 à droite
    // - Si nombre impair x : (x-1)/2 à gauche, 1 au centre, (x-1)/2 à droite
    const isOdd = subordinates.length % 2 === 1
    const hasCenterCard = isOdd
    const sideCount = Math.floor(subordinates.length / 2)  // (x-1)/2 si impair, x/2 si pair
    
    let leftWidth = 0
    let rightWidth = 0
    let centerCardWidth = 0
    
    // Si carte centrale, calculer sa largeur
    if (hasCenterCard) {
      centerCardWidth = childWidths[sideCount]
    }
    
    // Largeur totale à gauche
    for (let i = 0; i < sideCount; i++) {
      leftWidth += childWidths[i]
      if (i < sideCount - 1) {
        leftWidth += config.horizontalSpacing
      }
    }
    
    // Largeur totale à droite (en sautant la carte centrale si elle existe)
    const rightStartIndex = hasCenterCard ? sideCount + 1 : sideCount
    for (let i = rightStartIndex; i < subordinates.length; i++) {
      rightWidth += childWidths[i]
      if (i < subordinates.length - 1) {
        rightWidth += config.horizontalSpacing
      }
    }
    
    // Largeur totale = largeur gauche + largeur droite + carte centrale + espacements
    const centerGap = config.horizontalSpacing
    const totalWidth = leftWidth + rightWidth + centerCardWidth + (hasCenterCard ? centerGap * 2 : 0)
    
    return Math.max(config.nodeWidth, totalWidth)
  }

  // Callbacks pour les événements de souris
  const handleMouseEnter = useCallback((nodeId: string) => {
    setHoveredNodeId(nodeId)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredNodeId(null)
  }, [])

  // Fonction pour construire la hiérarchie (tous les nœuds sont toujours affichés)
  const buildHierarchy = (employee: Employee, level: number = 0, x: number = 0, y: number = 0): { nodes: Node[], edges: Edge[], optimalViewport: { x: number, y: number, zoom: number } } => {
      const node: Node = {
        id: employee.id.toString(),
        type: "employee",
        position: { x, y },
      style: {
        width: config.nodeWidth, // Taille fixe - ne varie pas
        height: config.nodeHeight, // Taille fixe
      },
        data: {
          employee,
        onMouseEnter: () => handleMouseEnter(employee.id.toString()),
        onMouseLeave: handleMouseLeave,
          isHighlighted: false,
        config: config, // Passer la config au composant
        },
      }

      const nodes = [node]
      const edges: Edge[] = []

      // Trouver les subordonnés
    let subordinates = employees?.filter(emp => emp.manager === employee.id) || []
      
      // Trier les subordonnés par nom de direction (main_direction_name), puis par nom complet en cas d'égalité
      subordinates = subordinates.sort((a, b) => {
        const directionA = a.main_direction_name || ''
        const directionB = b.main_direction_name || ''
        
        // Comparer d'abord par direction
        if (directionA !== directionB) {
          return directionA.localeCompare(directionB, 'fr', { sensitivity: 'base' })
        }
        
        // Si même direction, trier par nom complet
        const nameA = a.full_name || ''
        const nameB = b.full_name || ''
        return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' })
      })
      
      // Toujours afficher tous les subordonnés
      if (subordinates.length > 0) {
        // Design horizontal avec espacement optimisé pour permettre le scroll
        // Calculer la largeur totale nécessaire pour tous les subordonnés
        let totalChildrenWidth = 0
        const childWidths: number[] = []
        
        subordinates.forEach(sub => {
          const subWidth = calculateTotalWidth(sub)
          childWidths.push(subWidth)
          totalChildrenWidth += subWidth
        })
        
        // Gap adaptatif : espacement horizontal fixe (comme gap-4 sm:gap-6 md:gap-8)
        const horizontalSpacing = config.horizontalSpacing
        
        // Répartition équitable selon la règle :
        // - Si nombre pair x : x/2 à gauche, x/2 à droite
        // - Si nombre impair x : (x-1)/2 à gauche, 1 au centre, (x-1)/2 à droite
        const totalSubordinates = subordinates.length
        const isOdd = totalSubordinates % 2 === 1
        const hasCenterCard = isOdd
        
        // Nombre de cartes de chaque côté (sans compter le centre si impair)
        // Pour pair : sideCount = x/2
        // Pour impair : sideCount = (x-1)/2
        const sideCount = Math.floor(totalSubordinates / 2)
        
        const startY = y + config.verticalSpacing
        const rightStartIndex = hasCenterCard ? sideCount + 1 : sideCount
        
        // SOLUTION HYBRIDE : Positionner avec largeur fixe pour distances égales, puis ajuster pour éviter chevauchements
        
        // Étape 1 : Calculer les positions initiales avec config.nodeWidth (largeur fixe) pour avoir des distances égales
        const fixedCardWidth = config.nodeWidth
        const initialPositions: number[] = []
        
        if (hasCenterCard) {
          // NOMBRE IMPAIR : carte centrale + répartition équitable
          // Positionner les cartes à gauche (de droite à gauche)
          // La dernière carte à gauche doit être à horizontalSpacing de la carte centrale
          let currentX = x - fixedCardWidth / 2 - horizontalSpacing
          for (let i = sideCount - 1; i >= 0; i--) {
            initialPositions[i] = currentX
            currentX -= fixedCardWidth + horizontalSpacing
          }
          
          // Carte centrale alignée avec la branche verticale
          initialPositions[sideCount] = x
          
          // Positionner les cartes à droite (de gauche à droite)
          currentX = x + fixedCardWidth / 2 + horizontalSpacing
          for (let i = rightStartIndex; i < totalSubordinates; i++) {
            initialPositions[i] = currentX
            currentX += fixedCardWidth + horizontalSpacing
          }
        } else {
          // NOMBRE PAIR : symétrie parfaite
          // La branche verticale (x) est au milieu entre les deux cartes centrales
          // Positionner les cartes à gauche (de droite à gauche)
          let currentX = x - horizontalSpacing / 2 - fixedCardWidth / 2
          for (let i = sideCount - 1; i >= 0; i--) {
            initialPositions[i] = currentX
            currentX -= fixedCardWidth + horizontalSpacing
          }
          
          // Positionner les cartes à droite (de gauche à droite)
          currentX = x + horizontalSpacing / 2 + fixedCardWidth / 2
          for (let i = rightStartIndex; i < totalSubordinates; i++) {
            initialPositions[i] = currentX
            currentX += fixedCardWidth + horizontalSpacing
          }
        }
        
        // Étape 2 : Ajuster les positions pour éviter les chevauchements entre sous-arbres
        const finalPositions: number[] = [...initialPositions]
        
        // Vérifier et ajuster les chevauchements de gauche à droite
        for (let i = 0; i < totalSubordinates - 1; i++) {
          const currentPos = finalPositions[i]
          const currentSubtreeWidth = childWidths[i]
          const currentRightEdge = currentPos + currentSubtreeWidth / 2
          
          const nextPos = finalPositions[i + 1]
          const nextSubtreeWidth = childWidths[i + 1]
          const nextLeftEdge = nextPos - nextSubtreeWidth / 2
          
          // Si chevauchement détecté
          if (currentRightEdge + horizontalSpacing > nextLeftEdge) {
            // Calculer la position minimale pour éviter le chevauchement
            const minRequiredPos = currentRightEdge + horizontalSpacing + nextSubtreeWidth / 2
            
            // Décaler la carte suivante et toutes celles après
            const offset = minRequiredPos - nextPos
            for (let j = i + 1; j < totalSubordinates; j++) {
              finalPositions[j] += offset
            }
          }
        }
        
        // Étape 3 : Positionner toutes les cartes avec les positions finales ajustées
        subordinates.forEach((sub, index) => {
          const subX = finalPositions[index]
          const subY = startY
          
          const subResult = buildHierarchy(sub, level + 1, subX, subY)
          nodes.push(...subResult.nodes)
          edges.push(...subResult.edges)
          
          // Toujours créer les edges pour connecter le parent à ses subordonnés
          edges.push({
            id: `e-${employee.id}-${sub.id}`,
            source: employee.id.toString(),
            target: sub.id.toString(),
            type: "custom",
            data: { isHighlighted: false }
          })
        })
    }

    return { nodes, edges, optimalViewport: { x: 0, y: 0, zoom: 1 } }
  }

  // Convertir les employés en nœuds React Flow et calculer le viewport optimal
  const { nodes, edges, optimalViewport, calculatedExtent } = useMemo((): { nodes: Node[], edges: Edge[], optimalViewport: { x: number, y: number, zoom: number }, calculatedExtent?: [[number, number], [number, number]] } => {
    console.log('🔄 [REACT_FLOW] Construction des nœuds avec employés:', employees?.length || 0)
    
    if (!employees || employees.length === 0) {
      console.log('❌ [REACT_FLOW] Aucun employé, retour de nœuds vides')
      return { nodes: [], edges: [], optimalViewport: { x: 0, y: 0, zoom: 1 }, calculatedExtent: undefined }
    }

    // Créer un map des employés par ID
    const employeeMap = new Map<number, Employee>()
    employees.forEach(emp => {
      employeeMap.set(emp.id, emp)
    })

    // Trouver le CEO (employé sans manager) - optionnel pour le filtrage
    const ceo = employees.find(emp => !emp.manager)
    console.log('👑 [REACT_FLOW] CEO trouvé:', ceo ? { id: ceo.id, name: ceo.full_name } : 'Aucun')
    
    // Si pas de CEO dans la liste filtrée, essayer de construire une hiérarchie partielle
    if (!ceo) {
      console.log('🔄 [REACT_FLOW] Pas de CEO dans la liste filtrée, construction d\'une hiérarchie partielle')
      
      // Trouver les employés de plus haut niveau dans la liste filtrée
      const topLevelEmployees = employees.filter(emp => {
        // Un employé est de plus haut niveau si son manager n'est pas dans la liste filtrée
        return !emp.manager || !employees.find(e => e.id === emp.manager)
      })
      
      console.log('🏢 [REACT_FLOW] Employés de plus haut niveau trouvés:', topLevelEmployees.map(emp => ({
        id: emp.id,
        name: emp.full_name,
        level: emp.hierarchy_level
      })))
      
      const nodes: Node[] = []
      const edges: Edge[] = []
      
      // Construire la hiérarchie à partir de chaque employé de plus haut niveau
      topLevelEmployees.forEach((topEmployee, topIndex) => {
        const result = buildHierarchy(topEmployee, 0, topIndex * 400, 0)
        nodes.push(...result.nodes)
        edges.push(...result.edges)
      })
      
      // Si aucun employé de plus haut niveau trouvé, utiliser une grille simple
      if (topLevelEmployees.length === 0) {
        console.log('📐 [REACT_FLOW] Aucun employé de plus haut niveau, utilisation d\'une grille simple')
        
        const cols = config.gridCols
        const rows = Math.ceil(employees.length / cols)
        const totalWidth = (cols - 1) * config.horizontalSpacing + config.nodeWidth
        const startX = -totalWidth / 2
        const startY = 0
        
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
      }
      
      // Générer les edges pour tous les employés
      employees.forEach(employee => {
        if (employee.manager) {
          // Vérifier que le manager est aussi dans la liste filtrée
          const managerInFiltered = employees.find(emp => emp.id === employee.manager)
          if (managerInFiltered) {
            const edge: Edge = {
              id: `edge-${employee.manager}-${employee.id}`,
              source: employee.manager.toString(),
              target: employee.id.toString(),
              type: "custom",
              data: {
                sourceEmployee: managerInFiltered,
                targetEmployee: employee
              }
            }
            edges.push(edge)
          }
        }
      })
      
      console.log('🔗 [REACT_FLOW] Edges générés pour le filtrage:', { 
        edgesCount: edges.length,
        edges: edges.map(e => ({ 
          id: e.id, 
          source: e.source, 
          target: e.target,
          sourceName: (e.data as any)?.sourceEmployee?.full_name,
          targetName: (e.data as any)?.targetEmployee?.full_name
        }))
      })
      
      // Calculer les dimensions pour le translateExtent
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      nodes.forEach(node => {
        const x = node.position.x
        const y = node.position.y
        const width = (node.style?.width as number) || config.nodeWidth
        const height = (node.style?.height as number) || config.nodeHeight
        
        minX = Math.min(minX, x - width / 2)
        maxX = Math.max(maxX, x + width / 2)
        minY = Math.min(minY, y - height / 2)
        maxY = Math.max(maxY, y + height / 2)
      })
      
      const padding = 500
      const calculatedExtent: [[number, number], [number, number]] = [
        [minX - padding, minY - padding],
        [maxX + padding, maxY + padding]
      ]
      
      // Le viewport sera géré par fitView et les useEffect
      return { nodes, edges, optimalViewport: { x: 0, y: 0, zoom: 1 }, calculatedExtent }
    }

    
    // Placer le CEO au centre
    const ceoX = 0  // Centré
    const ceoY = 0
    
    console.log('👑 [REACT_FLOW] Calcul du CEO (centré):', {
      ceoX,
      ceoY,
      ceoName: ceo.full_name,
      subordinatesCount: employees?.filter(e => e.manager === ceo.id).length || 0
    })
    
    const result = buildHierarchy(ceo, 0, ceoX, ceoY)
    
    // Calculer les dimensions réelles de l'organigramme pour adapter le translateExtent
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    result.nodes.forEach(node => {
      const x = node.position.x
      const y = node.position.y
      const width = (node.style?.width as number) || config.nodeWidth
      const height = (node.style?.height as number) || config.nodeHeight
      
      minX = Math.min(minX, x - width / 2)
      maxX = Math.max(maxX, x + width / 2)
      minY = Math.min(minY, y - height / 2)
      maxY = Math.max(maxY, y + height / 2)
    })
    
    // Ajouter un padding pour le scroll
    // Padding plus petit en haut car le DG est positionné en haut
    const paddingX = 500
    const paddingYTop = 100  // Petit padding en haut car le DG est près du bord
    const paddingYBottom = 500  // Plus de padding en bas pour les subordonnés
    const calculatedExtent: [[number, number], [number, number]] = [
      [minX - paddingX, minY - paddingYTop],
      [maxX + paddingX, maxY + paddingYBottom]
    ]
    
    console.log('✅ [REACT_FLOW] Nœuds générés:', { 
      nodesCount: result.nodes.length, 
      edgesCount: result.edges.length,
      dimensions: { minX, maxX, minY, maxY },
      calculatedExtent
    })
    
    return { ...result, optimalViewport: { x: 0, y: 0, zoom: 1 }, calculatedExtent }
  }, [employees, config.horizontalSpacing, config.verticalSpacing, config.gridCols, handleMouseEnter, handleMouseLeave])

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

  // Forcer l'alignement à gauche après l'initialisation
  useEffect(() => {
    if (reactFlowInstance && nodes && nodes.length > 0) {
      console.log('🎯 [REACT_FLOW] Alignement à gauche de l\'organigramme...')
      
      // Délai pour s'assurer que React Flow est complètement initialisé
      setTimeout(() => {
        // Zoom fixe - ne varie pas selon le nombre de cartes
        const screenWidth = window.innerWidth
        let fixedZoom = 0.7  // Zoom fixe par défaut
        if (screenWidth < 640) fixedZoom = 0.8      // Mobile
        else if (screenWidth < 768) fixedZoom = 0.75  // Small tablet
        else if (screenWidth < 1024) fixedZoom = 0.7 // Tablet
        else if (screenWidth < 1280) fixedZoom = 0.65 // Desktop
        else if (screenWidth < 1536) fixedZoom = 0.6 // Large desktop
        else fixedZoom = 0.55                        // Ultra wide
        
        // Calculer le nœud le plus à gauche de l'organigramme
        let minX = Infinity
        nodes.forEach(node => {
          const x = node.position.x
          const width = (node.style?.width as number) || config.nodeWidth
          const leftEdge = x - width / 2
          minX = Math.min(minX, leftEdge)
        })
        
        // Positionner le nœud le plus à gauche à 5px du bord gauche, en tenant compte du sidebar
        // Le padding doit inclure la largeur du sidebar pour éviter que la carte soit cachée
        const basePadding = 5
        const paddingLeft = basePadding + sidebarWidth
        const screenTop = 100 // Offset du haut pour laisser de l'espace (navbar, etc.)
        
        // Calculer la position du viewport pour placer le nœud le plus à gauche avec le padding
        // viewportX = paddingLeft - (minX * zoom)
        const viewportX = paddingLeft - (minX * fixedZoom)
        const viewportY = screenTop - (0 * fixedZoom)   // DG à y=0, positionné en haut
        
        reactFlowInstance.setViewport({
          x: viewportX,
          y: viewportY,
          zoom: fixedZoom  // Zoom fixe - toujours le même
        })
        
        // Initialiser le centre de référence
        const center = { x: 0, y: 0 }  // Le DG est toujours à (0, 0)
        setViewportCenter(center)
        
        console.log('✅ [REACT_FLOW] Viewport aligné à gauche appliqué:', {
          viewportX,
          viewportY,
          zoom: fixedZoom,
          minX,
          center,
          nodesCount: nodes.length,
          message: 'Organigramme aligné à gauche avec padding de 5px'
        })
      }, 200)
    }
  }, [reactFlowInstance, nodes, config.nodeWidth, sidebarWidth])


  // Hook pour détecter les changements de taille d'écran et réaligner à gauche
  useEffect(() => {
    const handleResize = () => {
      if (reactFlowInstance && nodes && nodes.length > 0) {
        console.log('📱 [REACT_FLOW] Redimensionnement détecté, réalignement à gauche...')
        
        // Réaligner à gauche avec zoom fixe après redimensionnement
        setTimeout(() => {
          // Zoom fixe - ne varie pas selon le nombre de cartes
          const screenWidth = window.innerWidth
          let fixedZoom = 0.7  // Zoom fixe par défaut
          if (screenWidth < 640) fixedZoom = 0.8      // Mobile
          else if (screenWidth < 768) fixedZoom = 0.75  // Small tablet
          else if (screenWidth < 1024) fixedZoom = 0.7 // Tablet
          else if (screenWidth < 1280) fixedZoom = 0.65 // Desktop
          else if (screenWidth < 1536) fixedZoom = 0.6 // Large desktop
          else fixedZoom = 0.55                        // Ultra wide
          
          // Calculer le nœud le plus à gauche de l'organigramme
          let minX = Infinity
          nodes.forEach(node => {
            const x = node.position.x
            const width = (node.style?.width as number) || config.nodeWidth
            const leftEdge = x - width / 2
            minX = Math.min(minX, leftEdge)
          })
          
          // Positionner le nœud le plus à gauche à 5px du bord gauche, en tenant compte du sidebar
          // Le padding doit inclure la largeur du sidebar pour éviter que la carte soit cachée
          const basePadding = 5
          const paddingLeft = basePadding + sidebarWidth
          const screenTop = 100 // Offset du haut pour laisser de l'espace
          
          const viewportX = paddingLeft - (minX * fixedZoom)
          const viewportY = screenTop - (0 * fixedZoom)   // DG à y=0, positionné en haut
          
          reactFlowInstance.setViewport({
            x: viewportX,
            y: viewportY,
            zoom: fixedZoom  // Zoom fixe - toujours le même
          })

          // Mettre à jour le centre de référence
          const center = { x: 0, y: 0 }  // Le DG est toujours à (0, 0)
          setViewportCenter(center)
        }, 100)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [reactFlowInstance, nodes, config.nodeWidth, sidebarWidth])

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    [setEdges],
  )

  const onNodeClick = useCallback(() => {
    // Désactivé - ne fait rien
  }, [])

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
      } else {
        console.log('❌ [REACT_FLOW] Aucun employé trouvé pour:', searchTerm)
      }
    },
    selectEmployeeById: (id: number) => {
      const employee = employees.find(emp => emp.id === id)
      if (employee) {
        console.log('✅ [REACT_FLOW] Employé trouvé par ID:', employee.full_name)
      }
    }
  }), [employees, nodes])

  const onPaneClick = useCallback(() => {
    // Désactivé - ne fait rien
  }, [])

  const findPathToCEO = useCallback((nodeId: string, edges: Edge[]): { edgeIds: string[]; nodeIds: string[] } => {
    const edgeIds: string[] = []
    const nodeIds: string[] = [nodeId]
    let currentNodeId = nodeId

    const visited = new Set<string>()

    // Remonter la hiérarchie jusqu'à ce qu'on ne trouve plus de parent
    while (!visited.has(currentNodeId)) {
      visited.add(currentNodeId)

      const parentEdge = edges.find((edge) => edge.target === currentNodeId)
      if (!parentEdge) break

      edgeIds.push(parentEdge.id)
      currentNodeId = parentEdge.source
      nodeIds.push(currentNodeId)
    }

    return { edgeIds, nodeIds }
  }, [])

  const highlightedPath = useMemo(() => {
    if (!hoveredNodeId) return { edgeIds: new Set<string>(), nodeIds: new Set<string>() }
    const path = findPathToCEO(hoveredNodeId, edgesState)
    return {
      edgeIds: new Set(path.edgeIds),
      nodeIds: new Set(path.nodeIds),
    }
  }, [hoveredNodeId, edgesState, findPathToCEO])

  const edgesWithHighlight = useMemo(() => {
    return edgesState.map((edge) => {
      const isInPath = highlightedPath.edgeIds.has(edge.id)
      const isConnectedToPath = highlightedPath.nodeIds.has(edge.source) || highlightedPath.nodeIds.has(edge.target)
      
      return {
        ...edge,
        data: {
          ...edge.data,
          isHighlighted: isInPath,
          isConnected: isConnectedToPath && !isInPath, // Connecté au chemin mais pas dans le chemin
        },
      }
    })
  }, [edgesState, highlightedPath.edgeIds, highlightedPath.nodeIds])

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
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full relative bg-gray-50">
      <div className="flex-1 flex flex-col h-full">
        <div 
          className="flex-1 relative organigramme-container overflow-auto" 
          ref={reactFlowWrapper}
          style={{
            touchAction: 'pan-x pan-y pinch-zoom',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            minWidth: 'max-content', // Le conteneur prend la largeur minimale nécessaire
            minHeight: 'max-content', // Le conteneur prend la hauteur minimale nécessaire
            height: '100%' // Prend toute la hauteur disponible
          }}
        >
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
              nodesDraggable={false}
              nodesConnectable={false}
              onMove={(event, viewport) => {
                // Pendant le déplacement, maintenir la référence au centre
                if (reactFlowInstance) {
                  // Utiliser une méthode plus robuste pour calculer le centre
                  // qui fonctionne même pour les grandes structures comme la Direction Générale
                  try {
                    // Méthode 1: Utiliser screenToFlowPosition (plus précis pour les grandes structures)
                    const center = reactFlowInstance.screenToFlowPosition({
                      x: window.innerWidth / 2,
                      y: window.innerHeight / 2
                    })
                    
                    // Vérifier que le centre est valide (pas NaN ou Infinity)
                    if (center && typeof center.x === 'number' && typeof center.y === 'number' && 
                        !isNaN(center.x) && !isNaN(center.y) && 
                        isFinite(center.x) && isFinite(center.y)) {
                      setViewportCenter(center)
                    } else {
                      // Méthode 2: Fallback - calculer depuis le viewport
                      const currentViewport = reactFlowInstance.getViewport()
                      const flowCenter = {
                        x: -currentViewport.x / currentViewport.zoom,
                        y: -currentViewport.y / currentViewport.zoom
                      }
                      setViewportCenter(flowCenter)
                    }
                  } catch (error) {
                    console.warn('⚠️ [REACT_FLOW] Erreur calcul centre:', error)
                    // Fallback: utiliser le viewport directement
                    const currentViewport = reactFlowInstance.getViewport()
                    const flowCenter = {
                      x: -currentViewport.x / currentViewport.zoom,
                      y: -currentViewport.y / currentViewport.zoom
                    }
                    setViewportCenter(flowCenter)
                  }
                }
              }}
              onMoveStart={(event, viewport) => {
                // Début du déplacement - capturer le centre de référence
                if (reactFlowInstance) {
                  setIsPanning(true)
                  
                  // Calculer le centre avec méthode robuste
                  let center
                  try {
                    center = reactFlowInstance.screenToFlowPosition({
                      x: window.innerWidth / 2,
                      y: window.innerHeight / 2
                    })
                    
                    // Vérifier la validité du centre
                    if (!center || isNaN(center.x) || isNaN(center.y) || 
                        !isFinite(center.x) || !isFinite(center.y)) {
                      // Fallback: calculer depuis le viewport
                      const currentViewport = reactFlowInstance.getViewport()
                      center = {
                        x: -currentViewport.x / currentViewport.zoom,
                        y: -currentViewport.y / currentViewport.zoom
                      }
                    }
                  } catch (error) {
                    // Fallback en cas d'erreur
                    const currentViewport = reactFlowInstance.getViewport()
                    center = {
                      x: -currentViewport.x / currentViewport.zoom,
                      y: -currentViewport.y / currentViewport.zoom
                    }
                  }
                  
                  setPanStartCenter(center)
                  setViewportCenter(center)
                  
                  console.log('🎯 [REACT_FLOW] Début du déplacement - Centre de référence:', center)
                }
              }}
              onMoveEnd={(event, viewport) => {
                // Fin du déplacement - finaliser le centre de référence
                if (reactFlowInstance) {
                  // Calculer le centre avec méthode robuste
                  let center
                  try {
                    center = reactFlowInstance.screenToFlowPosition({
                      x: window.innerWidth / 2,
                      y: window.innerHeight / 2
                    })
                    
                    // Vérifier la validité du centre
                    if (!center || isNaN(center.x) || isNaN(center.y) || 
                        !isFinite(center.x) || !isFinite(center.y)) {
                      // Fallback: calculer depuis le viewport
                      const currentViewport = reactFlowInstance.getViewport()
                      center = {
                        x: -currentViewport.x / currentViewport.zoom,
                        y: -currentViewport.y / currentViewport.zoom
                      }
                    }
                  } catch (error) {
                    // Fallback en cas d'erreur
                    const currentViewport = reactFlowInstance.getViewport()
                    center = {
                      x: -currentViewport.x / currentViewport.zoom,
                      y: -currentViewport.y / currentViewport.zoom
                    }
                  }
                  
                  setViewportCenter(center)
                  setIsPanning(false)
                  setPanStartCenter(null)
                  
                  console.log('🎯 [REACT_FLOW] Fin du déplacement - Centre de référence finalisé:', center)
                }
              }}
              onViewportChange={(viewport) => {
                // Mettre à jour le centre de référence lors des changements de viewport
                if (reactFlowInstance) {
                  try {
                    const center = reactFlowInstance.screenToFlowPosition({
                      x: window.innerWidth / 2,
                      y: window.innerHeight / 2
                    })
                    
                    // Vérifier la validité du centre
                    if (center && typeof center.x === 'number' && typeof center.y === 'number' && 
                        !isNaN(center.x) && !isNaN(center.y) && 
                        isFinite(center.x) && isFinite(center.y)) {
                      setViewportCenter(center)
                    } else {
                      // Fallback: calculer depuis le viewport
                      const flowCenter = {
                        x: -viewport.x / viewport.zoom,
                        y: -viewport.y / viewport.zoom
                      }
                      setViewportCenter(flowCenter)
                    }
                  } catch (error) {
                    // Fallback en cas d'erreur
                    const flowCenter = {
                      x: -viewport.x / viewport.zoom,
                      y: -viewport.y / viewport.zoom
                    }
                    setViewportCenter(flowCenter)
                  }
                }
              }}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView={false}
              fitViewOptions={{
                padding: 0.05,
                includeHiddenNodes: false,
                minZoom: 0.1,
                maxZoom: 2
              }}
              snapToGrid
              snapGrid={[15, 15]}
              defaultEdgeOptions={{ type: "custom" }}
              minZoom={0.1}
              maxZoom={2}
              translateExtent={calculatedExtent || [[-5000, -2000], [5000, 2000]]}
              panOnScroll={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
              panOnDrag={true}
              selectNodesOnDrag={false}
            >
              <Background />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  )
})

ReactFlowOrganigramme.displayName = "ReactFlowOrganigramme"

export default ReactFlowOrganigramme
