"use client"

import { cn } from "@/lib/utils"

interface HighlightTextProps {
  text: string
  searchTerm: string
  className?: string
}

// Fonction pour détecter et transformer les URLs en liens
function detectAndLinkify(text: string): Array<string | JSX.Element> {
  // Regex pour détecter les URLs (http://, https://, www., ou domaines simples)
  const urlRegex = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}[^\s<>"']*)/g
  const parts: Array<string | JSX.Element> = []
  let lastIndex = 0
  let matchIndex = 0

  const matches: Array<{ start: number; end: number; url: string }> = []
  
  // Collecter toutes les correspondances d'URLs
  let match
  while ((match = urlRegex.exec(text)) !== null) {
    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      url: match[0]
    })
  }

  // Si aucune URL trouvée, retourner le texte tel quel
  if (matches.length === 0) {
    return [text]
  }

  // Construire les parties avec les liens
  matches.forEach((urlMatch) => {
    // Ajouter le texte avant l'URL
    if (urlMatch.start > lastIndex) {
      parts.push(text.substring(lastIndex, urlMatch.start))
    }

    // Préparer l'URL pour l'affichage
    let url = urlMatch.url
    let href = url

    // Ajouter https:// si l'URL commence par www.
    if (url.startsWith('www.')) {
      href = `https://${url}`
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Si c'est juste un domaine, ajouter https://
      href = `https://${url}`
    }

    // Créer le lien
    parts.push(
      <a
        key={`link-${matchIndex++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
      >
        {url}
      </a>
    )

    lastIndex = urlMatch.end
  })

  // Ajouter le reste du texte
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

export function HighlightText({ text, searchTerm, className }: HighlightTextProps) {
  if (!text) {
    return <span className={className}></span>
  }

  // D'abord, détecter et transformer les URLs
  const linkifiedParts = detectAndLinkify(text)

  // Si pas de terme de recherche, retourner juste avec les liens
  if (!searchTerm || searchTerm.trim() === '') {
    return (
      <span className={className}>
        {linkifiedParts.map((part, index) => {
          if (typeof part === 'string') {
            return <span key={index}>{part}</span>
          }
          return part
        })}
      </span>
    )
  }

  // Si on a un terme de recherche, combiner avec la détection de liens
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const searchRegex = new RegExp(`(${escapedSearchTerm})`, 'gi')
  
  return (
    <span className={className}>
      {linkifiedParts.map((part, partIndex) => {
        if (typeof part === 'string') {
          // Diviser le texte par le terme de recherche
          const searchParts = part.split(searchRegex)
          return (
            <span key={partIndex}>
              {searchParts.map((searchPart, searchIndex) => {
                if (!searchPart) return null
                // Vérifier si cette partie correspond au terme de recherche
                const testRegex = new RegExp(`^${escapedSearchTerm}$`, 'gi')
                const isMatch = testRegex.test(searchPart)
                return isMatch ? (
                  <mark
                    key={`${partIndex}-${searchIndex}`}
                    className="bg-yellow-200 text-yellow-900 px-1 rounded-sm font-medium"
                  >
                    {searchPart}
                  </mark>
                ) : (
                  <span key={`${partIndex}-${searchIndex}`}>{searchPart}</span>
                )
              })}
            </span>
          )
        }
        // Si c'est déjà un lien, le retourner tel quel
        return part
      })}
    </span>
  )
}


