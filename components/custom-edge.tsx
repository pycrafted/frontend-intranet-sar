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

  // États de surbrillance
  const isHighlighted = data?.isHighlighted || false
  const isConnected = data?.isConnected || false

  const onEdgeClick = useCallback(
    (evt: React.MouseEvent<SVGGElement, MouseEvent>, id: string) => {
      evt.stopPropagation()
      setEdges((edges) => edges.filter((edge) => edge.id !== id))
    },
    [setEdges],
  )

  return (
    <>
      {/* Styles CSS pour les animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              stroke-width: 3;
            }
            50% {
              opacity: 0.7;
              stroke-width: 4;
            }
          }
        `}
      </style>
      
      {/* Définir les marqueurs SVG personnalisés */}
      <defs>
        <marker
          id={`arrowhead-${isHighlighted ? 'highlighted' : isConnected ? 'connected' : 'normal'}-${id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={isHighlighted ? "#3b82f6" : isConnected ? "#60a5fa" : "#94a3b8"}
            stroke={isHighlighted ? "#3b82f6" : isConnected ? "#60a5fa" : "#94a3b8"}
            strokeWidth={isHighlighted ? 2 : isConnected ? 1.5 : 1}
            style={{
              transition: "all 0.3s ease-in-out",
              filter: isHighlighted ? "drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))" : isConnected ? "drop-shadow(0 0 1px rgba(96, 165, 250, 0.3))" : "none",
              animation: isHighlighted ? "pulse 2s infinite" : "none",
              opacity: isConnected ? 0.8 : 1,
            }}
          />
        </marker>
      </defs>
      
      <BaseEdge
        path={edgePath}
        markerEnd={`url(#arrowhead-${isHighlighted ? 'highlighted' : isConnected ? 'connected' : 'normal'}-${id})`}
        style={{
          ...style,
          strokeWidth: isHighlighted ? 3 : isConnected ? 2.5 : 2,
          stroke: isHighlighted ? "#3b82f6" : isConnected ? "#60a5fa" : "#94a3b8", // Bleu vif si surligné, bleu clair si connecté, gris sinon
          strokeDasharray: isHighlighted ? "5,5" : isConnected ? "3,3" : "none", // Pointillés différents selon l'état
          transition: "all 0.3s ease-in-out", // Transition fluide
          filter: isHighlighted ? "drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))" : isConnected ? "drop-shadow(0 0 2px rgba(96, 165, 250, 0.3))" : "none", // Ombres différentes
          animation: isHighlighted ? "pulse 2s infinite" : "none", // Animation de pulsation seulement si surligné
          opacity: isConnected ? 0.8 : 1, // Légèrement transparent si connecté
        }}
      />
      <EdgeLabelRenderer>
        {data?.label && (
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: isHighlighted ? "#dbeafe" : isConnected ? "#f0f9ff" : "white",
              padding: "4px 8px",
              borderRadius: 4,
              fontSize: 12,
              fontWeight: isHighlighted ? 600 : isConnected ? 550 : 500,
              pointerEvents: "all",
              border: isHighlighted ? "2px solid #3b82f6" : isConnected ? "1px solid #60a5fa" : "1px solid #e2e8f0",
              color: isHighlighted ? "#1e40af" : isConnected ? "#1d4ed8" : "inherit",
              transition: "all 0.3s ease-in-out",
              boxShadow: isHighlighted ? "0 2px 4px rgba(59, 130, 246, 0.2)" : isConnected ? "0 1px 2px rgba(96, 165, 250, 0.1)" : "none",
              animation: isHighlighted ? "pulse 2s infinite" : "none",
              opacity: isConnected ? 0.9 : 1,
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