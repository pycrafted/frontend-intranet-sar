"use client"

import { useEffect } from 'react'
import { X, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { LinkedInActualite } from '@/hooks/useLinkedInActualites'

function getLinkedInEmbedUrl(postUrl: string): string {
  if (postUrl.includes('urn:li:')) {
    const urnMatch = postUrl.match(/urn:li:(ugcPost|activity|share):(\d+)/)
    if (urnMatch)
      return `https://www.linkedin.com/embed/feed/update/urn:li:${urnMatch[1]}:${urnMatch[2]}`
  }
  const m1 = postUrl.match(/activity[-:](\d+)/)
  if (m1) return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${m1[1]}`
  const m2 = postUrl.match(/ugcPost[-:](\d+)/)
  if (m2) return `https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:${m2[1]}`
  const m3 = postUrl.match(/share[-:](\d+)/)
  if (m3) return `https://www.linkedin.com/embed/feed/update/urn:li:share:${m3[1]}`
  return postUrl
}

interface Props {
  item: LinkedInActualite | null
  allItems: LinkedInActualite[]
  onClose: () => void
  onNavigate: (item: LinkedInActualite) => void
}

export default function LinkedInModal({ item, allItems, onClose, onNavigate }: Props) {
  const modalIndex = item ? allItems.findIndex(a => a.id === item.id) : -1

  const prev = () => {
    if (modalIndex < 0) return
    onNavigate(allItems[(modalIndex - 1 + allItems.length) % allItems.length])
  }
  const next = () => {
    if (modalIndex < 0) return
    onNavigate(allItems[(modalIndex + 1) % allItems.length])
  }

  useEffect(() => {
    if (!item) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, modalIndex])

  const embedUrl = item?.linkedin_url ? getLinkedInEmbedUrl(item.linkedin_url) : null
  const titleText = item
    ? item.content.replace(/\n+/g, ' ').trim().slice(0, 80) + (item.content.length > 80 ? '…' : '')
    : ''

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-6 lg:p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full sm:max-w-4xl flex flex-col overflow-hidden shadow-2xl h-[100dvh] sm:h-[min(92vh,860px)] sm:rounded-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Barre de tête */}
            <div className="flex items-center gap-3 bg-white border-b border-neutral-100 border-l-4 px-4 py-3 flex-shrink-0 sm:rounded-t-2xl" style={{ borderLeftColor: '#344256' }}>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-neutral-100 hover:bg-neutral-200 transition-colors rounded-full"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
              <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600 truncate">
                {titleText}
              </span>
              {item.linkedin_url && (
                <a
                  href={item.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-white text-[10px] font-semibold uppercase tracking-widest transition-colors rounded-lg"
                  style={{ backgroundColor: '#344256' }}
                >
                  <ExternalLink className="w-3 h-3" />
                  LinkedIn
                </a>
              )}
            </div>

            {/* Zone iframe */}
            <div
              className="flex-1 min-h-0 bg-white overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full"
              style={{ scrollbarColor: '#344256 #f3f4f6', scrollbarWidth: 'thin' }}
            >
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Post LinkedIn"
                  className="w-full border-0"
                  style={{ minHeight: 700 }}
                  allowFullScreen
                />
              ) : (
                <div className="p-6 text-sm text-gray-500">
                  <p>{item.content}</p>
                </div>
              )}
            </div>

            {/* Barre nav prev/next */}
            {allItems.length > 1 && (
              <div className="flex items-center justify-between bg-white border-t border-neutral-200 px-5 py-3 flex-shrink-0 sm:rounded-b-2xl">
                <button
                  type="button"
                  onClick={prev}
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest transition-colors hover:opacity-70"
                  style={{ color: '#344256' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Précédent
                </button>
                <span className="text-[11px] font-mono text-gray-400 font-bold">
                  {modalIndex + 1} / {allItems.length}
                </span>
                <button
                  type="button"
                  onClick={next}
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest transition-colors hover:opacity-70"
                  style={{ color: '#344256' }}
                >
                  Suivant
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
