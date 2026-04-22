"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Newspaper, ExternalLink } from "lucide-react"
import { useLinkedInActualites, LinkedInActualite } from "@/hooks/useLinkedInActualites"
import LinkedInModal from "@/components/linkedin-modal"
import Link from "next/link"

const GENERIC_IMG = "/media/generique.jpg"

export function RecentNews() {
  const { items, loading, error } = useLinkedInActualites()
  const [modalItem, setModalItem] = useState<LinkedInActualite | null>(null)

  // 5 plus récents
  const recent = items.slice(0, 5)

  const excerpt = (text: string) => {
    const flat = text.replace(/\n+/g, ' ').trim()
    return flat.length > 1000 ? flat.slice(0, 1000) + '…' : flat
  }

  if (loading) {
    return (
      <Card className="h-[26rem] sm:h-[28rem] flex flex-col border-0">
        <CardHeader className="pb-2 pt-4 px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Newspaper className="h-5 w-5 text-slate-800" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 leading-tight">Actualités</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Dernières nouvelles SAR</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-16 h-14 bg-gray-200 rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-[26rem] sm:h-[28rem] flex flex-col border-0">
        <CardHeader className="pb-2 pt-4 px-5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Newspaper className="h-5 w-5 text-slate-800" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-800 leading-tight">Actualités</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Dernières nouvelles SAR</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">Erreur lors du chargement</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="h-[26rem] sm:h-[28rem] flex flex-col overflow-hidden border-0 hover:shadow-xl transition-all duration-500">
        <CardHeader className="pb-2 pt-4 px-5 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
                <Newspaper className="h-5 w-5 text-slate-800" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-slate-800 leading-tight">Actualités</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">Dernières nouvelles SAR</p>
              </div>
            </div>
            <Link href="/actualites" className="flex-shrink-0">
              <Button variant="ghost" size="sm" className="h-7 px-3 text-xs text-slate-600 hover:bg-slate-100 border border-slate-200">
                Voir tout
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="flex-1 min-h-0 overflow-y-auto px-5 pb-4 space-y-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#E52621]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
          {recent.length === 0 ? (
            <div className="text-center py-10">
              <Newspaper className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucune actualité disponible</p>
            </div>
          ) : (
            recent.map(item => {
              const imgSrc = item.image_url || GENERIC_IMG
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.linkedin_url && setModalItem(item)}
                  className="w-full text-left flex gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  {/* Image */}
                  <div className="flex-shrink-0 w-16 h-14 overflow-hidden rounded bg-gray-100">
                    <img
                      src={imgSrc}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = GENERIC_IMG }}
                    />
                  </div>
                  {/* Résumé */}
                  <div className="flex-1 min-w-0">
                    <div className="h-0.5 w-6 bg-[#E52621]/60 rounded-full mb-1" />
                    <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line line-clamp-[12]">
                      {excerpt(item.content)}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </CardContent>
      </Card>

      <LinkedInModal
        item={modalItem}
        allItems={recent.filter(i => i.linkedin_url)}
        onClose={() => setModalItem(null)}
        onNavigate={setModalItem}
      />
    </>
  )
}
