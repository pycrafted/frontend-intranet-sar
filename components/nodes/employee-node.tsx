"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import type { Employee } from "@/hooks/useOrgChart"

interface EmployeeNodeData {
  employee: Employee
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  isHighlighted?: boolean
}

export const EmployeeNode = memo(({ data, isConnectable }: NodeProps) => {
  const { employee, onMouseEnter, onMouseLeave, isHighlighted } = data as unknown as EmployeeNodeData

  return (
    <div
      className={`bg-white rounded-xl border-2 overflow-hidden min-w-[220px] transition-all duration-300 ${
        isHighlighted ? "border-blue-500 shadow-lg shadow-blue-200 ring-2 ring-blue-200" : "border-gray-200"
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex justify-center pt-6 pb-4">
        <img
          src={employee.avatar || "/placeholder-user.jpg"}
          alt={employee.full_name}
          className={`w-20 h-20 rounded-full object-cover ring-4 transition-all duration-300 ${
            isHighlighted ? "ring-blue-200" : "ring-gray-100"
          }`}
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
        <h3 className="text-base font-semibold text-gray-900 mb-1">{employee.position_title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{employee.full_name}</p>

        {employee.department_name && (
          <div
            className={`mt-3 inline-block text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300 ${
              isHighlighted ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
            }`}
          >
            {employee.department_name}
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />
    </div>
  )
})

EmployeeNode.displayName = "EmployeeNode"
