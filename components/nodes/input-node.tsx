"use client"

import { memo } from "react"
import { Handle, Position, type NodeProps } from "@xyflow/react"
import type { NodeData } from "@/lib/types"

export const InputNode = memo(({ data, isConnectable }: NodeProps<NodeData>) => {
  return (
    <div
      className={`bg-white rounded-xl border-2 overflow-hidden min-w-[220px] transition-all duration-300 ${
        data.isHighlighted ? "border-blue-500 shadow-lg shadow-blue-200 ring-2 ring-blue-200" : "border-gray-200"
      }`}
      onMouseEnter={data.onMouseEnter}
      onMouseLeave={data.onMouseLeave}
    >
      {data.photo && (
        <div className="flex justify-center pt-6 pb-4">
          <img
            src={data.photo || "/placeholder.svg"}
            alt={data.label}
            className={`w-20 h-20 rounded-full object-cover ring-4 transition-all duration-300 ${
              data.isHighlighted ? "ring-blue-200" : "ring-gray-100"
            }`}
          />
        </div>
      )}

      <div className="px-6 pb-6 text-center">
        <h3 className="text-base font-semibold text-gray-900 mb-1">{data.label || "Input"}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{data.description || "Data input node"}</p>

        {data.department && (
          <div
            className={`mt-3 inline-block text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300 ${
              data.isHighlighted ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
            }`}
          >
            {data.department}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 !bg-gray-400 !border-2 !border-white"
      />
    </div>
  )
})

InputNode.displayName = "InputNode"
