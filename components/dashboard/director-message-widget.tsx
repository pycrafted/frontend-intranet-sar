"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Crown, Quote, X, Pencil } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/hooks/useAuth"
import { getApiUrl } from "@/lib/config"

const DEFAULT_FULL_MESSAGE = `Chers collaborateurs,

Au service de l'économie sénégalaise, la Société Africaine de Raffinage (SAR) a pour mission d'approvisionner en produits pétroliers les entreprises et les distributeurs du pays de manière régulière et aux moindres coûts. Ainsi la SAR contribue activement à assurer la sécurité d'approvisionnement en énergie du Sénégal.

Cette fonction s'amplifie avec les perspectives de valorisation du pétrole brut de Sangomar. La SAR prendra toutes les dispositions pour relever les nouveaux défis ainsi posés et ceci avec le soutien et l'accompagnement des pouvoirs publics.

La transparence, la responsabilité sociale, la forte exigence de qualité, et la sécurité sont au cœur de la gouvernance de la SAR.

Nous prenons l'engagement d'améliorer de façon continue nos outils pour vous servir toujours mieux.

Le Directeur Général`

interface DirectorData {
  director_name: string
  director_title: string
  director_short_message: string
  director_full_message: string
}

export function DirectorMessageWidget() {
  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [data, setData] = useState<DirectorData>({
    director_name: "M. Mamadou Abib Diop",
    director_title: "Le Directeur Général",
    director_short_message: "Au service de l'économie sénégalaise, la SAR contribue activement à assurer la sécurité d'approvisionnement en énergie au Sénégal",
    director_full_message: DEFAULT_FULL_MESSAGE,
  })

  // Formulaire d'édition
  const [editData, setEditData] = useState<DirectorData>(data)

  useEffect(() => {
    fetch(`${getApiUrl()}/config/director/`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        if (json) {
          setData({
            director_name: json.director_name || data.director_name,
            director_title: json.director_title || data.director_title,
            director_short_message: json.director_short_message || data.director_short_message,
            director_full_message: json.director_full_message || DEFAULT_FULL_MESSAGE,
          })
        }
      })
      .catch(() => {})
  }, [])

  const handleOpenEdit = () => {
    setEditData(data)
    setIsEditOpen(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`${getApiUrl()}/config/director/update/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      setData(updated)
      setIsEditOpen(false)
    } catch {
      alert("Erreur lors de la sauvegarde.")
    } finally {
      setIsSaving(false)
    }
  }

  const fullMessage = data.director_full_message || DEFAULT_FULL_MESSAGE

  return (
    <>
      <Card
        className="h-[26rem] sm:h-[28rem] lg:h-[28rem] border-0 shadow-2xl transition-all duration-700 group flex flex-col overflow-hidden relative"
        style={{
          backgroundImage: 'url(/directeur.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
          boxShadow: '0 4px 6px -1px rgba(238, 0, 9, 0.1), 0 2px 4px -1px rgba(238, 0, 9, 0.06)'
        }}
      >
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.15) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, transparent 50%, rgba(59,130,246,0.1) 100%)' }} />

        {/* Icône citation décorative */}
        <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center opacity-60" style={{ background: 'rgba(238,0,9,0.6)' }}>
          <Quote className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
        </div>

        {/* Bouton édition admin — bas droite, visible au survol */}
        {isAdmin && (
          <button
            onClick={handleOpenEdit}
            title="Modifier les informations"
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg bg-white/90 hover:bg-white text-gray-500 hover:text-blue-600 shadow-md"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}

        {/* Header */}
        <CardHeader className="pb-2 pt-4 px-5 flex-shrink-0 relative z-10">
          <div className="flex items-center gap-3">
              <div
                className="p-2.5 rounded-xl shadow-lg group-hover:scale-105 transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(238,0,9,0.9) 0%, rgba(196,30,58,0.9) 100%)',
                  boxShadow: '0 8px 20px rgba(238,0,9,0.3)'
                }}
              >
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold leading-tight" style={{ color: 'rgba(0,0,0,0.9)' }}>
                  Mot du Directeur
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">{data.director_name}</p>
              </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-center items-center text-center relative z-10 pt-2 sm:pt-4 p-2 sm:p-3 md:p-6">
          <div className="space-y-2 sm:space-y-3 md:space-y-6 w-full">
            <div
              className="relative overflow-hidden transition-all duration-700 scale-[1.02] shadow-2xl mx-2 sm:mx-4"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(238,0,9,0.1)',
                borderRadius: '16px'
              }}
            >
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #ee0009 0%, #c41e3a 50%, #ee0009 100%)' }} />
              <div className="p-2 sm:p-3 md:p-5">
                <blockquote className="text-center">
                  <p className="text-gray-800 text-xs sm:text-sm md:text-base leading-relaxed font-medium italic" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif', lineHeight: '1.5', letterSpacing: '-0.01em' }}>
                    "{data.director_short_message}"
                  </p>
                </blockquote>
              </div>
            </div>

            <div className="pt-2 sm:pt-3 md:pt-4">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="group relative overflow-hidden rounded-lg px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 text-[10px] sm:text-xs md:text-sm font-semibold text-white border-0 transition-all duration-300 hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #ee0009 0%, #c41e3a 100%)', boxShadow: '0 6px 20px rgba(238,0,9,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 25px rgba(238,0,9,0.5)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(238,0,9,0.3)' }}
              >
                <span className="flex items-center relative z-10">
                  <span className="hidden sm:inline">Lire le message complet</span>
                  <span className="sm:hidden">Lire plus</span>
                </span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)' }} />
              </Button>
            </div>
          </div>
        </CardContent>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-100 transition-opacity duration-700" />
      </Card>

      {/* Modal message complet */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="max-w-5xl lg:max-w-6xl max-h-[95vh] border-0 shadow-2xl mx-2 sm:mx-4 p-0 rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}
        >
          <div className="h-2 w-full" style={{ background: 'linear-gradient(90deg, #ee0009 0%, #c41e3a 50%, #ee0009 100%)' }} />
          <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </DialogClose>

          <div className="relative p-6 pb-4">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-red-100/30 to-orange-100/30 rounded-full -translate-y-12 translate-x-12" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 rounded-full translate-y-8 -translate-x-8" />
            <div className="flex flex-col items-center gap-4 relative z-10">
              <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
                <div className="absolute inset-0 rounded-full p-1 shadow-2xl" style={{ background: 'linear-gradient(135deg, #ee0009 0%, #c41e3a 100%)', boxShadow: '0 15px 30px rgba(238,0,9,0.3)' }}>
                  <div className="w-full h-full bg-white rounded-full p-1 shadow-inner">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                      <Image src="/dg.jpg" alt="Directeur Général SAR" width={80} height={80} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{data.director_name}</DialogTitle>
                <div className="inline-flex items-center text-white px-4 py-2 rounded-full text-sm font-medium" style={{ background: 'linear-gradient(135deg, #ee0009 0%, #c41e3a 100%)', boxShadow: '0 8px 20px rgba(238,0,9,0.3)' }}>
                  <span>{data.director_title}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="relative overflow-hidden rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)', boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(238,0,9,0.1)', borderRadius: '16px' }}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #ee0009 0%, #c41e3a 50%, #ee0009 100%)' }} />
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[50vh]">
                {fullMessage.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-800 text-sm sm:text-base leading-relaxed font-medium" style={{ fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif', lineHeight: '1.5', letterSpacing: '-0.01em' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal édition admin */}
      {isAdmin && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent style={{ width: '540px', maxWidth: 'calc(100vw - 2rem)' }}>
            <DialogHeader>
              <DialogTitle>Modifier le Mot du Directeur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Nom</Label>
                <input
                  type="text"
                  value={editData.director_name}
                  onChange={e => setEditData(p => ({ ...p, director_name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Titre</Label>
                <input
                  type="text"
                  value={editData.director_title}
                  onChange={e => setEditData(p => ({ ...p, director_title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Citation courte (affichée sur la carte)</Label>
                <Textarea
                  value={editData.director_short_message}
                  onChange={e => setEditData(p => ({ ...p, director_short_message: e.target.value }))}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Message complet (affiché dans le modal)</Label>
                <Textarea
                  value={editData.director_full_message}
                  onChange={e => setEditData(p => ({ ...p, director_full_message: e.target.value }))}
                  rows={10}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
