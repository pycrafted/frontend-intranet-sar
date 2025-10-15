"use client"

import type React from "react"
import { useState, useCallback, useRef, useMemo } from "react"
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
}

export default function ReactFlowOrganigramme({ employees, loading = false, error = null }: ReactFlowOrganigrammeProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  // Convertir les employés en nœuds React Flow
  const { nodes, edges } = useMemo(() => {
    if (!employees || employees.length === 0) {
      return { nodes: [], edges: [] }
    }

    // Créer un map des employés par ID
    const employeeMap = new Map<number, Employee>()
    employees.forEach(emp => {
      employeeMap.set(emp.id, emp)
    })

    // Trouver le CEO (employé sans manager)
    const ceo = employees.find(emp => !emp.manager)
    if (!ceo) {
      return { nodes: [], edges: [] }
    }

    // Construire la hiérarchie récursivement
    const buildHierarchy = (employee: Employee, level: number = 0, x: number = 0, y: number = 0): { nodes: Node[], edges: Edge[] } => {
      const node: Node = {
        id: employee.id.toString(),
        type: "employee",
        position: { x, y },
        data: {
          employee,
          onMouseEnter: () => setHoveredNodeId(employee.id.toString()),
          onMouseLeave: () => setHoveredNodeId(null),
          isHighlighted: false,
        },
      }

      const nodes = [node]
      const edges: Edge[] = []

      // Trouver les subordonnés
      const subordinates = employees.filter(emp => emp.manager === employee.id)
      
      if (subordinates.length > 0) {
        const spacing = 300
        const startX = x - (subordinates.length - 1) * spacing / 2
        
        subordinates.forEach((sub, index) => {
          const subX = startX + index * spacing
          const subY = y + 200
          
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
        })
      }

      return { nodes, edges }
    }

    return buildHierarchy(ceo, 0, 0, 0)
  }, [employees])

  const [nodesState, setNodes, onNodesChange] = useNodesState(nodes)
  const [edgesState, setEdges, onEdgesChange] = useEdgesState(edges)

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge({ ...params, type: "custom" }, eds)),
    [setEdges],
  )

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const findPathToCEO = useCallback((nodeId: string, edges: Edge[]): { edgeIds: string[]; nodeIds: string[] } => {
    const edgeIds: string[] = []
    const nodeIds: string[] = [nodeId]
    let currentNodeId = nodeId
    const ceoId = nodes.find(n => n.data.employee.manager === null)?.id

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
    <div className="flex h-screen relative">
      <div className="flex-1 flex flex-col">
        <div className="flex-1" ref={reactFlowWrapper}>
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
              fitView
              snapToGrid
              snapGrid={[15, 15]}
              defaultEdgeOptions={{ type: "custom" }}
              defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {selectedNode && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Section with Photo */}
            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 px-8 pt-12 pb-8">
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/80 rounded-full transition-all duration-200 group"
              >
                <X className="h-5 w-5 text-slate-600 group-hover:text-slate-900" />
              </button>

              {/* Photo and Basic Info */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl">
                    <img
                      src={selectedNode.data.employee.avatar || "/placeholder-user.jpg"}
                      alt={selectedNode.data.employee.full_name}
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

                <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                  {selectedNode.data.employee.full_name}
                </h2>
                <p className="text-lg text-slate-600 mb-3 font-medium">{selectedNode.data.employee.job_title}</p>
                <span className="inline-flex items-center px-4 py-1.5 bg-white text-slate-700 text-sm font-medium rounded-full shadow-sm border border-slate-200">
                  {selectedNode.data.employee.department_name}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-8 overflow-y-auto max-h-[calc(85vh-280px)]">
              {/* Contact Information */}
              <div className="mb-8">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span>Contact</span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href={`mailto:${selectedNode.data.employee.email}`}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">Email</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{selectedNode.data.employee.email}</p>
                    </div>
                  </a>

                  <a
                    href={`tel:${selectedNode.data.employee.phone_fixed || selectedNode.data.employee.phone_mobile}`}
                    className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">Téléphone</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedNode.data.employee.phone_fixed || selectedNode.data.employee.phone_mobile}
                      </p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Employment Details */}
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <div className="h-px flex-1 bg-slate-200"></div>
                  <span>Informations Professionnelles</span>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                      <IdCard className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">Matricule</p>
                      <p className="text-sm font-medium text-slate-900">{selectedNode.data.employee.matricule}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                      <User className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 mb-0.5">Manager</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedNode.data.employee.manager_name || "Aucun"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
