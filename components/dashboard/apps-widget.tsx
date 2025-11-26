"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Folder, Plus, Sparkles, Globe, Linkedin } from "lucide-react"
import Image from "next/image"

// Interface pour les applications
interface App {
  id: string
  icon: React.ReactNode
  color: string
  url: string
  category: 'sar' | 'microsoft' | 'google' | 'tools' | 'other'
  name?: string // Nom de l'application pour le carousel mobile
}

// Composants SVG pour les logos
const OutlookIcon = () => (
  <img 
    src="/bureau.png" 
    alt="Outlook" 
    className="w-8 h-8 object-contain"
  />
)

const TeamsIcon = () => (
  <img 
    src="/entreprise.png" 
    alt="Teams" 
    className="w-8 h-8 object-contain"
  />
)

const OneDriveIcon = () => (
  <img 
    src="/microsoft.png" 
    alt="OneDrive" 
    className="w-8 h-8 object-contain"
  />
)

const SharePointIcon = () => (
  <img 
    src="/microsoft-access.png" 
    alt="SharePoint" 
    className="w-8 h-8 object-contain"
  />
)

const WordIcon = () => (
  <img 
    src="/exceller.png" 
    alt="Word" 
    className="w-8 h-8 object-contain"
  />
)

const GmailIcon = () => (
  <img 
    src="/google-docs.png" 
    alt="Google Docs" 
    className="w-8 h-8 object-contain"
  />
)

const DriveIcon = () => (
  <img 
    src="/google-drive.png" 
    alt="Google Drive" 
    className="w-8 h-8 object-contain"
  />
)

const CalendarIcon = () => (
  <img 
    src="/calendrier-google.png" 
    alt="Google Calendar" 
    className="w-8 h-8 object-contain"
  />
)

const MeetIcon = () => (
  <img 
    src="/icons8-google-meet-480.png" 
    alt="Google Meet" 
    className="w-8 h-8 object-contain"
  />
)

const FormsIcon = () => (
  <img 
    src="/formulaires-google.png" 
    alt="Google Forms" 
    className="w-8 h-8 object-contain"
  />
)

// Icônes pour les liens utiles
const SARIcon = () => (
  <div className="group/icon relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-blue-50">
    <img 
      src="/sitesar.jpg" 
      alt="SAR Site Officiel" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover/icon:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      Site SAR
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

const PetrosenIcon = () => (
  <div className="group/icon relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-green-50">
    <img 
      src="/petrosen.png" 
      alt="Petrosen Site Officiel" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover/icon:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      Site Petrosen
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

const EnergyMinesIcon = () => (
  <div className="group/icon relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-orange-50">
    <img 
      src="/ministere.png" 
      alt="Ministère Énergie-Mines" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover/icon:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      Ministère Énergie-Mines
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

const LinkedInIcon = () => (
  <div className="group/icon relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-blue-50">
    <img 
      src="/cos.png" 
      alt="COS Petrogaz" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover/icon:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      COS
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

const OfficeIcon = () => (
  <Globe className="w-8 h-8 text-indigo-600" />
)

const LinkedInSARIcon = () => (
  <div className="group/icon relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-blue-50">
    <img 
      src="/SAR.png" 
      alt="LinkedIn SAR" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover/icon:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      LinkedIn SAR
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

// Icônes pour les applications SAR
const SAPIcon = () => (
  <div className="group/icon relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-blue-50">
    <img 
      src="/fiori.png" 
      alt="SAP Fiori" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover/icon:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      SAP FIORI
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

const QualiproIcon = () => (
  <div className="group/icon relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-green-50">
    <img 
      src="/qualipro_test.png" 
      alt="Qualipro" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover/icon:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      Qualipro
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

const SAPFPIcon = () => (
  <div className="group/icon relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-blue-50">
    <img 
      src="/logo_hana.png" 
      alt="SAP S/4HANA" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover/icon:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      SAP S/4HANA
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

const MaarchCourrierIcon = () => (
  <div className="group/icon relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-purple-50">
    <img 
      src="/courrier.png" 
      alt="Maarch Courrier" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover/icon:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      Courrier
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

const MaarchParapheurIcon = () => (
  <div className="group/icon relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-indigo-50">
    <img 
      src="/paraphe.png" 
      alt="MaarchParapheur" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover/icon:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover/icon:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      Paraphe
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

// Données des applications
const APPS: App[] = [
  // Applications SAR
  {
    id: 'sap',
    icon: <SAPIcon />,
    color: 'from-orange-500 to-orange-600',
    url: 'https://srv-sap-prod.sar.sn:50443/sap/bc/ui2/flp',
    category: 'sar',
    name: 'SAP FIORI'
  },
  {
    id: 'qualipro',
    icon: <QualiproIcon />,
    color: 'from-green-500 to-green-600',
    url: 'http://srv-qualipro/Qualipro',
    category: 'sar',
    name: 'Qualipro'
  },
  {
    id: 'sap-fp',
    icon: <SAPFPIcon />,
    color: 'from-blue-500 to-blue-600',
    url: 'https://sar.eu20.hcs.cloud.sap/approuter/v1/redirect?url=%2Fsap%2Ffpa%2Fui%2Fapp.html%23%2Fhome',
    category: 'sar',
    name: 'SAP S/4HANA'
  },
  {
    id: 'maarch-courrier',
    icon: <MaarchCourrierIcon />,
    color: 'from-purple-500 to-purple-600',
    url: 'https://sar-sygec.sar.sn/MaarchCourrier/postgres/dist/index.html#/login',
    category: 'sar',
    name: 'Courrier'
  },
  {
    id: 'maarch-parapheur',
    icon: <MaarchParapheurIcon />,
    color: 'from-indigo-500 to-indigo-600',
    url: 'https://sar-sygeco.sar.sn/MaarchParapheur/dist/#/login',
    category: 'sar',
    name: 'Maarch Parapheur'
  },
  // Applications Microsoft
  {
    id: 'outlook',
    icon: <OutlookIcon />,
    color: 'from-blue-500 to-blue-600',
    url: 'https://outlook.office.com/mail',
    category: 'microsoft'
  },
  {
    id: 'teams',
    icon: <TeamsIcon />,
    color: 'from-purple-500 to-purple-600',
    url: 'https://teams.microsoft.com',
    category: 'microsoft'
  },
  {
    id: 'onedrive',
    icon: <OneDriveIcon />,
    color: 'from-cyan-500 to-cyan-600',
    url: 'https://onedrive.live.com',
    category: 'microsoft'
  },
  {
    id: 'sharepoint',
    icon: <SharePointIcon />,
    color: 'from-green-500 to-green-600',
    url: 'https://www.office.com/launch/sharepoint',
    category: 'microsoft'
  },
  {
    id: 'word',
    icon: <WordIcon />,
    color: 'from-blue-600 to-blue-700',
    url: 'https://www.office.com/launch/word',
    category: 'microsoft'
  },
  {
    id: 'gmail',
    icon: <GmailIcon />,
    color: 'from-red-500 to-red-600',
    url: 'https://mail.google.com',
    category: 'google'
  },
  {
    id: 'drive',
    icon: <DriveIcon />,
    color: 'from-blue-500 to-blue-600',
    url: 'https://drive.google.com',
    category: 'google'
  },
  {
    id: 'calendar',
    icon: <CalendarIcon />,
    color: 'from-green-500 to-green-600',
    url: 'https://calendar.google.com',
    category: 'google'
  },
  {
    id: 'meet',
    icon: <MeetIcon />,
    color: 'from-indigo-500 to-indigo-600',
    url: 'https://meet.google.com',
    category: 'google'
  },
  {
    id: 'forms',
    icon: <FormsIcon />,
    color: 'from-purple-500 to-purple-600',
    url: 'https://forms.google.com',
    category: 'google'
  },
  // Liens utiles
  {
    id: 'sar-website',
    icon: <SARIcon />,
    color: 'from-blue-500 to-blue-600',
    url: 'https://www.sar.sn/',
    category: 'tools'
  },
  {
    id: 'petrosen-website',
    icon: <PetrosenIcon />,
    color: 'from-green-500 to-green-600',
    url: 'https://www.petrosen.sn/',
    category: 'tools'
  },
  {
    id: 'energy-mines',
    icon: <EnergyMinesIcon />,
    color: 'from-orange-500 to-orange-600',
    url: 'https://energie-mines.gouv.sn/',
    category: 'tools'
  },
  {
    id: 'linkedin-cos',
    icon: <LinkedInIcon />,
    color: 'from-blue-400 to-blue-500',
    url: 'https://www.linkedin.com/company/cos-petrogaz/?originalSubdomain=sn',
    category: 'tools'
  },
  {
    id: 'linkedin-sar',
    icon: <LinkedInSARIcon />,
    color: 'from-blue-600 to-blue-700',
    url: 'https://www.linkedin.com/company/societe-africaine-de-raffinage/',
    category: 'tools'
  }
]

export function AppsWidget() {
  // Carousel automatique pour mobile - 5 apps spécifiques
  const mobileCarouselApps = ['sap', 'qualipro', 'sap-fp', 'maarch-courrier', 'maarch-parapheur']
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0)
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)

  // Carousel automatique - change toutes les 4 secondes
  useEffect(() => {
    if (!isCarouselPaused && mobileCarouselApps.length > 0) {
      const interval = setInterval(() => {
        setCurrentCarouselIndex((prev) => (prev + 1) % mobileCarouselApps.length)
      }, 4000)

      return () => clearInterval(interval)
    }
  }, [isCarouselPaused, mobileCarouselApps.length])

  const handleAppClick = (app: App) => {
    // Ouvrir directement l'application (Google détecte automatiquement le compte connecté au navigateur)
    if (app.url && app.url !== '#') {
      console.log('🔗 [APPS_WIDGET] Ouverture de l\'application:', app.id, app.url)
      window.open(app.url, '_blank')
    } else {
      console.log('⚠️ [APPS_WIDGET] Aucune URL définie pour:', app.id)
      alert(`Application ${app.id} - Fonctionnalité à venir`)
    }
  }

  const sarApps = APPS.filter(app => app.category === 'sar')
  const toolsApps = APPS.filter(app => app.category === 'tools')
  
  // Apps pour le carousel mobile
  const carouselApps = APPS.filter(app => mobileCarouselApps.includes(app.id))

  return (
    <Card className="h-[26rem] sm:h-[28rem] lg:h-[28rem] flex flex-col overflow-hidden relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 hover:shadow-2xl transition-all duration-500 group">
      {/* Motifs décoratifs élégants */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-indigo-100/15 to-purple-100/20" />
        {/* Motifs décoratifs - Couleurs claires attrayantes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300/30 rounded-full -translate-y-16 translate-x-16 group-hover:bg-blue-200/40 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-300/30 rounded-full translate-y-12 -translate-x-12 group-hover:bg-indigo-200/40 transition-colors duration-500" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-purple-300/20 rounded-full -translate-x-8 -translate-y-8 group-hover:bg-purple-200/30 transition-colors duration-500" />
      </div>

      <CardHeader className="relative pb-2 sm:pb-3 md:pb-4 flex-shrink-0 z-10 p-2 sm:p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 md:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg group-hover:shadow-blue-300/50 group-hover:scale-105 transition-all duration-300">
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300">
                Accès Rapide
              </CardTitle>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-600 font-medium">
                Applications & Services
              </p>
            </div>
          </div>
          
        </div>
      </CardHeader>
      
      <CardContent className="relative flex-1 flex flex-col justify-start md:justify-center p-4 sm:p-4 md:p-6 pt-2 z-10">
        <div className="space-y-2 sm:space-y-3 md:space-y-8">
          {/* Carousel automatique pour mobile - Section SAR */}
          <div className="block sm:hidden w-full h-full flex-1">
            {carouselApps.length > 0 && (() => {
              const currentApp = carouselApps[currentCarouselIndex]
              return (
                <div 
                  className="w-full h-full flex flex-col items-center justify-center pt-8"
                  onMouseEnter={() => setIsCarouselPaused(true)}
                  onMouseLeave={() => setIsCarouselPaused(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full flex-1 flex flex-col items-center justify-center gap-6 p-8 hover:bg-slate-200/50 transition-all duration-300 rounded-xl border-0 min-h-0"
                    onClick={() => handleAppClick(currentApp)}
                  >
                    <div className="flex-shrink-0 scale-[1.8] sm:scale-150">
                      {currentApp.icon}
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-800">
                        {currentApp.name || currentApp.id}
                      </p>
                    </div>
                  </Button>
                  
                  {/* Indicateurs de pagination */}
                  <div className="flex gap-2 mt-6 mb-4 flex-shrink-0">
                    {carouselApps.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentCarouselIndex
                            ? 'w-8 bg-blue-600'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Section SAR - Applications Internes (Desktop/Tablette) */}
          <div className="hidden sm:block">
            <h3 className="hidden md:flex text-base font-bold text-orange-600 mb-2 md:mb-3 items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full shadow-lg"></div>
              <Globe className="h-5 w-5" />
              SAR - Applications Internes
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {sarApps.map((app) => (
                <div key={app.id} className="group/app-item relative">
                  <Button
                    variant="ghost"
                    className="h-14 w-14 sm:h-14 sm:w-14 md:h-16 md:w-16 p-0 hover:bg-slate-200/50 transition-all duration-300 rounded-xl border-2 !border-blue-400 hover:!border-blue-500"
                    onClick={() => window.open(app.url, '_blank')}
                  >
                    <div className="w-full h-full flex items-center justify-center text-slate-700 group-hover/app-item:scale-110 group-hover/app-item:rotate-3 transition-all duration-300">
                      {app.icon}
                    </div>
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Section SAR - Sites web externes (Desktop/Tablette uniquement) */}
          <div className="hidden sm:block">
            <h3 className="hidden md:flex text-base font-bold text-blue-600 mb-2 md:mb-3 items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg"></div>
              <Globe className="h-5 w-5" />
              SAR - Sites web externes
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {toolsApps.map((app) => {
                // Masquer certains liens sur mobile pour une meilleure disposition
                const isHiddenOnMobile = ['linkedin-sar', 'linkedin-cos', 'energy-mines', 'petrosen-website'].includes(app.id)
                return (
                  <div 
                    key={app.id} 
                    className={`group/app-item relative ${isHiddenOnMobile ? 'hidden sm:block' : ''}`}
                  >
                    <Button
                      variant="ghost"
                      className="h-14 w-14 sm:h-14 sm:w-14 md:h-16 md:w-16 p-0 hover:bg-slate-200/50 transition-all duration-300 rounded-xl border-2 !border-blue-400 hover:!border-blue-500"
                      onClick={() => handleAppClick(app)}
                    >
                      <div className="w-full h-full flex items-center justify-center text-slate-700 group-hover/app-item:scale-110 group-hover/app-item:rotate-3 transition-all duration-300">
                        {app.icon}
                      </div>
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
