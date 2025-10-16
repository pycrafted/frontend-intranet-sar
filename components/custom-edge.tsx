"use client"

import type React from "react"

import { useCallback } from "react"
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, useReactFlow } from "@xyflow/react"

export default function CustomEdge({ id, sourceX, sourceY, targetX, targetY, data, style = {}, markerEnd }: EdgeProps) {
  const { setEdges } = useReactFlow()

  // 1. Ligne verticale du parent vers le milieu
  // 2. Ligne horizontale au milieu
  // 3. Ligne verticale du milieu vers l'enfant
  const midY = sourceY + (targetY - sourceY) / 2

  // Créer le chemin SVG en forme de T
  const edgePath = `
    M ${sourceX} ${sourceY}
    L ${sourceX} ${midY}
    L ${targetX} ${midY}
    L ${targetX} ${targetY}
  `

  // Position du label au milieu de la ligne
  const labelX = (sourceX + targetX) / 2
  const labelY = midY

  const onEdgeClick = useCallback(
    (evt: React.MouseEvent<SVGGElement, MouseEvent>, id: string) => {
      evt.stopPropagation()
      setEdges((edges) => edges.filter((edge) => edge.id !== id))
    },
    [setEdges],
  )

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "#94a3b8", // Couleur grise élégante
        }}
      />
      <EdgeLabelRenderer>
        {data?.label && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: "white",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: 500,
              pointerEvents: "all",
              border: "1px solid #e2e8f0",
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  )
}