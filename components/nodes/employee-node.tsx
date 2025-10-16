"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import type { Employee } from "@/hooks/useOrgChart"

interface EmployeeNodeData {
  employee: Employee
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  isHighlighted?: boolean
  config?: {
    nodeWidth: number
    nodeHeight: number
  }
}

export const EmployeeNode = memo(({ data, isConnectable }: NodeProps) => {
  const { employee, onMouseEnter, onMouseLeave, isHighlighted, config } = data as unknown as EmployeeNodeData
  
  // Détecter si c'est le DG (pas de manager)
  const isCEO = !employee.manager

  // Utiliser la configuration responsive ou les valeurs par défaut
  const nodeWidth = config?.nodeWidth || 220
  const nodeHeight = config?.nodeHeight || 280

  return (
    <div
      className={`rounded-xl border-2 overflow-hidden transition-all duration-300 relative ${
        isCEO 
          ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-400 shadow-lg shadow-amber-200 ring-2 ring-amber-200" 
          : isHighlighted 
            ? "bg-white border-blue-500 shadow-lg shadow-blue-200 ring-2 ring-blue-200" 
            : "bg-white border-gray-200"
      }`}
      style={{
        minWidth: `${nodeWidth}px`,
        width: `${nodeWidth}px`,
        minHeight: `${nodeHeight}px`,
        height: `${nodeHeight}px`
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Couronne pour le DG */}
      {isCEO && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
            <svg 
              className="w-5 h-5 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
        </div>
      )}
      <div className="flex justify-center pt-6 pb-4">
        <img
          src={employee.avatar || "/placeholder-user.jpg"}
          alt={employee.full_name}
          className={`rounded-full object-cover ring-4 transition-all duration-300 ${
            isCEO 
              ? "ring-amber-300 shadow-lg" 
              : isHighlighted 
                ? "ring-blue-200" 
                : "ring-gray-100"
          }`}
          style={{
            width: `${Math.min(nodeWidth * 0.3, 80)}px`,
            height: `${Math.min(nodeWidth * 0.3, 80)}px`
          }}
          onError={(e) => {
            // Fallback vers l'avatar par défaut si l'image ne charge pas
            const target = e.target as HTMLImageElement;
            if (target.src !== "/placeholder-user.jpg") {
              target.src = "/placeholder-user.jpg";
            }
          }}
        />
      </div>

      <div className="px-6 pb-6 text-center">
        <h3 className={`font-semibold mb-1 ${
          isCEO ? "text-amber-800" : "text-gray-900"
        }`}
        style={{
          fontSize: `${Math.max(nodeWidth * 0.06, 12)}px`
        }}>
          {employee.job_title}
        </h3>
        <p className={`leading-relaxed ${
          isCEO ? "text-amber-700 font-medium" : "text-gray-500"
        }`}
        style={{
          fontSize: `${Math.max(nodeWidth * 0.05, 10)}px`
        }}>
          {employee.full_name}
        </p>

        {employee.department_name && (
          <div
            className={`mt-3 inline-block px-3 py-1.5 rounded-full font-medium transition-all duration-300 ${
              isCEO 
                ? "bg-amber-200 text-amber-800 border border-amber-300" 
                : isHighlighted 
                  ? "bg-blue-100 text-blue-700" 
                  : "bg-gray-100 text-gray-700"
            }`}
            style={{
              fontSize: `${Math.max(nodeWidth * 0.04, 8)}px`
            }}
          >
            {employee.department_name}
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className={`w-3 h-3 !border-2 !border-white ${
          isCEO ? "!bg-amber-500" : "!bg-gray-400"
        }`}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className={`w-3 h-3 !border-2 !border-white ${
          isCEO ? "!bg-amber-500" : "!bg-gray-400"
        }`}
      />
    </div>
  )
})

EmployeeNode.displayName = "EmployeeNode"
