"use client"

import { useState, useEffect } from "react"
import { GripVertical, Trophy, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RankingListProps {
  question: {
    id: number
    text: string
    is_required: boolean
    ranking_items?: string[]
  }
  value?: string[]
  onChange: (value: string[]) => void
  error?: string
}

export function RankingList({ question, value = [], onChange, error }: RankingListProps) {
  const [items, setItems] = useState<string[]>([])
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [draggedOverItem, setDraggedOverItem] = useState<string | null>(null)

  // Initialiser les éléments à classer
  useEffect(() => {
    const defaultItems = question.ranking_items || [
      "Qualité du service",
      "Rapidité de réponse", 
      "Prix compétitif",
      "Support client",
      "Facilité d'utilisation"
    ]
    
    if (value.length === 0) {
      setItems(defaultItems)
    } else {
      setItems(value)
    }
  }, [question.ranking_items, value])

  const handleDragStart = (e: React.DragEvent, item: string) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, item: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDraggedOverItem(item)
  }

  const handleDragLeave = () => {
    setDraggedOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, targetItem: string) => {
    e.preventDefault()
    
    if (!draggedItem || draggedItem === targetItem) {
      setDraggedItem(null)
      setDraggedOverItem(null)
      return
    }

    const newItems = [...items]
    const draggedIndex = newItems.indexOf(draggedItem)
    const targetIndex = newItems.indexOf(targetItem)

    // Déplacer l'élément
    newItems.splice(draggedIndex, 1)
    newItems.splice(targetIndex, 0, draggedItem)

    setItems(newItems)
    onChange(newItems)
    setDraggedItem(null)
    setDraggedOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDraggedOverItem(null)
  }

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <GripVertical className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Instructions :</span>
        </div>
        <p>Glissez et déposez les éléments pour les classer par ordre de priorité (du plus important au moins important).</p>
      </div>

      {/* Liste des éléments à classer */}
      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={(e) => handleDragOver(e, item)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-move",
              "bg-white hover:bg-gray-50 hover:shadow-md",
              draggedItem === item 
                ? "opacity-50 scale-95" 
                : draggedOverItem === item
                ? "border-blue-400 bg-blue-50 shadow-lg"
                : "border-gray-200 hover:border-blue-300"
            )}
          >
            {/* Position */}
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full font-bold text-sm">
              {index + 1}
            </div>

            {/* Icône de drag */}
            <GripVertical className="h-5 w-5 text-gray-400" />

            {/* Texte de l'élément */}
            <div className="flex-1">
              <span className="font-medium text-gray-900">{item}</span>
            </div>

            {/* Icône de priorité */}
            {index < 3 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <Trophy className="h-4 w-4" />
                {index === 0 && <span className="text-xs font-bold">1er</span>}
                {index === 1 && <span className="text-xs font-bold">2ème</span>}
                {index === 2 && <span className="text-xs font-bold">3ème</span>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Résumé du classement */}
      {items.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Votre classement :</h4>
          <ol className="space-y-1">
            {items.map((item, index) => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <span className="font-bold text-blue-600">{index + 1}.</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  )
}
























