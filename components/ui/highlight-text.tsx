"use client"

import { cn } from "@/lib/utils"

interface HighlightTextProps {
  text: string
  searchTerm: string
  className?: string
}

export function HighlightText({ text, searchTerm, className }: HighlightTextProps) {
  if (!searchTerm || !text) {
    return <span className={className}>{text}</span>
  }

  // Créer une regex insensible à la casse pour la recherche
  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = regex.test(part)
        return isMatch ? (
          <mark
            key={index}
            className="bg-yellow-200 text-yellow-900 px-1 rounded-sm font-medium"
          >
            {part}
          </mark>
        ) : (
          part
        )
      })}
    </span>
  )
}


