"use client"

import React from 'react'
import { cn } from "@/lib/utils"
import { useScreenSize } from "@/hooks/useScreenSize"
import { LoadingMessage } from "../loading-message"
import { Message } from "@/hooks/useSariaChatbot"

interface ResponsiveMessagesAreaProps {
  messages: Message[]
  isTyping: boolean
  loadingMessage: string
  loadingPhase: 'searching' | 'processing'
  messagesEndRef: React.RefObject<HTMLDivElement>
  onSendMessage?: (message: string) => void
  className?: string
}

// Convertit un bloc de lignes markdown table en HTML table
function parseTable(block: string): string {
  const rows = block.trim().split('\n').filter(r => r.trim())
  if (rows.length < 2) return block

  const parseRow = (row: string) =>
    row.replace(/^\||\|$/g, '').split('|').map(c => c.trim())

  const headers = parseRow(rows[0])
  // rows[1] est la ligne de séparation (---|---), on la saute
  const bodyRows = rows.slice(2)

  const th = headers
    .map(h => `<th class="px-3 py-2 text-left text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 whitespace-nowrap">${h}</th>`)
    .join('')

  const trs = bodyRows.map((row, i) => {
    const cells = parseRow(row)
    const td = cells
      .map(c => `<td class="px-3 py-2 text-xs text-gray-800 border border-gray-200">${c}</td>`)
      .join('')
    const bg = i % 2 === 0 ? '' : ' class="bg-gray-50"'
    return `<tr${bg}>${td}</tr>`
  }).join('')

  return `<div class="overflow-x-auto my-2 rounded-lg border border-gray-200"><table class="w-full border-collapse text-sm"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table></div>`
}

const PHOTOS: Record<string, string> = {
  dg: '/dg.jpg',
  senghor: '/senghor.jpg',
  raffinerie: '/4.png',
}

const MAPS: Record<string, { label: string; lat: number; lng: number }> = {
  usine: { label: 'Usine SAR — Km 18, Route de Rufisque, Mbao', lat: 14.742100, lng: -17.347433 },
  siege: { label: 'Siège social SAR — 15 Bd de la République, Dakar', lat: 14.665754, lng: -17.435310 },
}

function renderPhoto(key: string): string {
  const src = PHOTOS[key]
  if (!src) return ''
  return `<div class="my-3"><img src="${src}" alt="${key}" class="rounded-xl max-w-[220px] shadow-md border border-gray-200" /></div>`
}

function renderMap(key: string): string {
  const map = MAPS[key]
  if (!map) return ''
  const googleUrl = `https://www.google.com/maps?q=${map.lat},${map.lng}`
  const staticImg = `https://staticmap.openstreetmap.de/staticmap.php?center=${map.lat},${map.lng}&zoom=15&size=400x180&markers=${map.lat},${map.lng},red`
  return `<div class="my-3 rounded-xl overflow-hidden border border-gray-200 shadow-md max-w-[320px]">
    <a href="${googleUrl}" target="_blank" rel="noopener noreferrer">
      <img src="${staticImg}" alt="${map.label}" class="w-full block" onerror="this.style.display='none'" />
      <div class="px-3 py-2 bg-white flex items-center justify-between gap-2">
        <span class="text-xs text-gray-700 font-medium leading-tight">${map.label}</span>
        <span class="text-xs text-blue-600 whitespace-nowrap font-medium">Ouvrir dans Maps</span>
      </div>
    </a>
  </div>`
}

// Rendu markdown → HTML sécurisé
function renderMarkdown(text: string): string {
  // 0. Balises enrichissement SAR
  text = text.replace(/\[PHOTO:(\w+)\]/g, (_, key) => renderPhoto(key))
  text = text.replace(/\[MAP:(\w+)\]/g, (_, key) => renderMap(key))

  // 1. Extraire et remplacer les tableaux markdown avant les autres transformations
  const tableRegex = /^(\|.+\|\n\|[-:| ]+\|\n(?:\|.+\|\n?)*)/gm
  text = text.replace(tableRegex, match => parseTable(match))

  return text
    // Blocs de code
    .replace(/```[\s\S]*?```/g, m => `<pre class="bg-gray-100 rounded p-2 text-xs overflow-x-auto my-1">${m.slice(3, -3).trim()}</pre>`)
    // Code inline
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 rounded px-1 text-xs font-mono">$1</code>')
    // Gras
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italique
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Listes à puces (- ou •)
    .replace(/^[ \t]*[-•]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    // Listes numérotées
    .replace(/^[ \t]*\d+\.\s+(.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Regrouper les <li> consécutifs
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul class="space-y-0.5 my-1">${m}</ul>`)
    // Sauts de ligne simples (éviter les <br/> dans les blocs déjà traités)
    .replace(/\n/g, '<br/>')
}

// N'extrait que les options courtes proposées comme choix (tirets de 1er niveau)
function extractQuestions(content: string): string[] {
  const questions: string[] = []
  const lines = content.split('\n')
  for (const line of lines) {
    const raw = line.trim()
    // Seulement les lignes qui commencent par "- " (options proposées)
    if (!/^[-•]\s/.test(raw)) continue
    const text = raw
      .replace(/^[-•]\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .trim()
    // Doit se terminer par "?" et rester concis
    if (text.endsWith('?') && text.length > 8 && text.length < 120) {
      questions.push(text)
    }
  }
  return questions.slice(0, 5)
}

export function ResponsiveMessagesArea({
  messages,
  isTyping,
  loadingMessage,
  loadingPhase,
  messagesEndRef,
  onSendMessage,
  className
}: ResponsiveMessagesAreaProps) {
  const { isMobile, isSmallMobile } = useScreenSize()

  // Afficher le message d'aide uniquement s'il n'y a que le message de bienvenue
  const showHelpMessage = messages.length === 1 && messages[0].sender === 'mai'

  return (
    <div className={cn(
      "flex-1 overflow-y-auto space-y-6 bg-gradient-to-b from-transparent",
      // Padding responsif
      isSmallMobile ? "p-3" : isMobile ? "p-4" : "p-6",
      className
    )}
    style={{ background: "linear-gradient(to bottom, transparent, rgba(52, 66, 86, 0.05))" }}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex saria-message group",
            message.sender === 'user' ? "justify-end" : "justify-start"
          )}
        >
          {/* Message */}
          <div
            className={cn(
              "rounded-2xl px-4 py-3 text-sm shadow-lg transition-all duration-200 group-hover:shadow-xl",
              message.sender === 'user'
                ? "text-white rounded-br-md"
                : "bg-white/80 backdrop-blur-sm text-gray-800 rounded-bl-md border border-gray-200/50",
              // Largeurs responsives
              isSmallMobile ? "max-w-[92%]" : isMobile ? "max-w-[90%]" : "max-w-[88%]"
            )}
            style={message.sender === 'user' ? { backgroundColor: "#344256" } : undefined}
          >
            {message.sender === 'mai' ? (
              <div
                className="leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
              />
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
            )}
            {message.sender === 'mai' && onSendMessage && (() => {
              const questions = extractQuestions(message.content)
              return questions.length > 0 ? (
                <div className="flex flex-col gap-2 mt-3">
                  {questions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => onSendMessage(q)}
                      className="text-left text-xs px-3 py-2 rounded-xl border transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]"
                      style={{
                        backgroundColor: 'rgba(52, 66, 86, 0.07)',
                        borderColor: 'rgba(52, 66, 86, 0.25)',
                        color: '#344256'
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(52, 66, 86, 0.15)'
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#344256'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(52, 66, 86, 0.07)'
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(52, 66, 86, 0.25)'
                      }}
                    >
                      <span className="mr-1.5 opacity-60">↩</span>{q}
                    </button>
                  ))}
                </div>
              ) : null
            })()}
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs",
              message.sender === 'user' ? "text-white/70" : "text-gray-500"
            )}>
              <div className={cn(
                "rounded-full",
                message.sender === 'user' ? "" : "bg-gray-400",
                isSmallMobile ? "h-0.5 w-0.5" : "h-1 w-1"
              )}
              style={message.sender === 'user' ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' } : undefined}
              ></div>
              <span>
                {message.timestamp.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
          
        </div>
      ))}
      
      {/* Message d'aide sur les domaines couverts */}
      {showHelpMessage && (
        <div className="flex gap-3 justify-start">
          <div className={cn(
            "bg-blue-50/80 backdrop-blur-sm text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm shadow-lg border border-blue-200/50",
            // Largeurs responsives
            isSmallMobile ? "max-w-[85%]" : isMobile ? "max-w-[80%]" : "max-w-[75%]"
          )}>
            <div className="flex items-start gap-2">
              <svg className={cn(
                "flex-shrink-0 text-blue-600",
                isSmallMobile ? "h-4 w-4 mt-0.5" : "h-5 w-5 mt-0.5"
              )} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold text-blue-900 mb-1.5">Je peux vous aider sur :</p>
                <ul className="space-y-1 text-gray-700 text-xs">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">🖨️</span>
                    <span><strong>Imprimante</strong> - Hors ligne, file bloquée, pilote, bourrage papier</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">💻</span>
                    <span><strong>Poste de travail</strong> - Lenteur, écran bleu, périphériques, réseau</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">📧</span>
                    <span><strong>Messagerie & Comptes</strong> - Outlook, mot de passe, session</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">⚙️</span>
                    <span><strong>SAP Fiori & HANA</strong> - Launchpad, autorisations, services, performances</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Indicateur de frappe avec messages intelligents */}
      {isTyping && (
        <div className="flex justify-start saria-message group">
          <div className={cn(
            "bg-white/80 backdrop-blur-sm text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 text-sm shadow-lg border border-gray-200/50",
            // Largeurs responsives
            isSmallMobile ? "max-w-[85%]" : isMobile ? "max-w-[80%]" : "max-w-[75%]"
          )}>
            {loadingMessage ? (
              <LoadingMessage 
                message={loadingMessage}
                phase={loadingPhase}
              />
            ) : (
              <div className="flex items-center gap-3">
                {/* Animation de chargement par défaut */}
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: "#344256" }}></div>
                  <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: "#344256", animationDelay: '0.1s', opacity: 0.7 }}></div>
                  <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: "#344256", animationDelay: '0.2s', opacity: 0.5 }}></div>
                </div>
                <div className="text-gray-700 font-medium animate-pulse">
                  Traitement en cours...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  )
}

