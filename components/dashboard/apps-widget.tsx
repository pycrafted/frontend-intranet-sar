"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Folder, Plus, Sparkles, Globe } from "lucide-react"
import Image from "next/image"

// Interface pour les applications
interface App {
  id: string
  icon: React.ReactNode
  color: string
  url: string
  category: 'sar' | 'microsoft' | 'google' | 'other'
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

// Icônes pour les applications SAR
const SAPIcon = () => (
  <div className="group relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-blue-50">
    <img 
      src="/fiori.png" 
      alt="SAP Fiori" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      SAP FIORI
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

const QualiproIcon = () => (
  <div className="group relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-green-50">
    <img 
      src="/qualipro_test.png" 
      alt="Qualipro" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      Qualipro
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

const SAPFPIcon = () => (
  <img 
    src="/css-3.png" 
    alt="CSS3" 
    className="w-8 h-8 object-contain"
  />
)

const MaarchCourrierIcon = () => (
  <div className="group relative w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-purple-50">
    <img 
      src="/Courrier.png" 
      alt="Maarch Courrier" 
      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
    />
    {/* Tooltip personnalisé */}
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-50">
      Courrier
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>
  </div>
)

const MaarchParapheurIcon = () => (
  <img 
    src="/css-3.png" 
    alt="CSS3" 
    className="w-8 h-8 object-contain"
  />
)

// Données des applications
const APPS: App[] = [
  // Applications SAR
  {
    id: 'sap',
    icon: <SAPIcon />,
    color: 'from-orange-500 to-orange-600',
    url: 'https://srv-sap-prod.sar.sn:50443/sap/bc/ui2/flp',
    category: 'sar'
  },
  {
    id: 'qualipro',
    icon: <QualiproIcon />,
    color: 'from-green-500 to-green-600',
    url: 'http://srv-qualipro/Qualipro',
    category: 'sar'
  },
  {
    id: 'sap-fp',
    icon: <SAPFPIcon />,
    color: 'from-blue-500 to-blue-600',
    url: 'https://sar.eu20.hcs.cloud.sap/sap/fpa/ui/app.html#/home',
    category: 'sar'
  },
  {
    id: 'maarch-courrier',
    icon: <MaarchCourrierIcon />,
    color: 'from-purple-500 to-purple-600',
    url: 'https://sar-sygec.sar.sn/MaarchCourrier/postgres/dist/index.html#/home',
    category: 'sar'
  },
  {
    id: 'maarch-parapheur',
    icon: <MaarchParapheurIcon />,
    color: 'from-indigo-500 to-indigo-600',
    url: 'https://sar-sygeco.sar.sn/MaarchParapheur/dist/#/login',
    category: 'sar'
  },
  // Applications Microsoft
  {
    id: 'outlook',
    icon: <OutlookIcon />,
    color: 'from-blue-500 to-blue-600',
    url: '#',
    category: 'microsoft'
  },
  {
    id: 'teams',
    icon: <TeamsIcon />,
    color: 'from-purple-500 to-purple-600',
    url: '#',
    category: 'microsoft'
  },
  {
    id: 'onedrive',
    icon: <OneDriveIcon />,
    color: 'from-cyan-500 to-cyan-600',
    url: '#',
    category: 'microsoft'
  },
  {
    id: 'sharepoint',
    icon: <SharePointIcon />,
    color: 'from-green-500 to-green-600',
    url: '#',
    category: 'microsoft'
  },
  {
    id: 'word',
    icon: <WordIcon />,
    color: 'from-blue-600 to-blue-700',
    url: '#',
    category: 'microsoft'
  },
  {
    id: 'gmail',
    icon: <GmailIcon />,
    color: 'from-red-500 to-red-600',
    url: '#',
    category: 'google'
  },
  {
    id: 'drive',
    icon: <DriveIcon />,
    color: 'from-blue-500 to-blue-600',
    url: '#',
    category: 'google'
  },
  {
    id: 'calendar',
    icon: <CalendarIcon />,
    color: 'from-green-500 to-green-600',
    url: '#',
    category: 'google'
  },
  {
    id: 'meet',
    icon: <MeetIcon />,
    color: 'from-indigo-500 to-indigo-600',
    url: '#',
    category: 'google'
  },
  {
    id: 'forms',
    icon: <FormsIcon />,
    color: 'from-purple-500 to-purple-600',
    url: '#',
    category: 'google'
  }
]

export function AppsWidget() {
  const handleAppClick = (app: App) => {
    // Pour l'instant, on affiche juste une alerte
    // Plus tard, on pourra rediriger vers l'URL de l'application
    alert(`Ouverture de l'application - URL: ${app.url}`)
  }

  const sarApps = APPS.filter(app => app.category === 'sar')
  const microsoftApps = APPS.filter(app => app.category === 'microsoft')
  const googleApps = APPS.filter(app => app.category === 'google')

  return (
    <Card className="h-[28rem] flex flex-col overflow-hidden relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-0 hover:shadow-2xl transition-all duration-500 group">
      {/* Motifs décoratifs élégants */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-indigo-100/15 to-purple-100/20" />
        {/* Motifs décoratifs - Couleurs claires attrayantes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-300/30 rounded-full -translate-y-16 translate-x-16 group-hover:bg-blue-200/40 transition-colors duration-500" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-300/30 rounded-full translate-y-12 -translate-x-12 group-hover:bg-indigo-200/40 transition-colors duration-500" />
        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-purple-300/20 rounded-full -translate-x-8 -translate-y-8 group-hover:bg-purple-200/30 transition-colors duration-500" />
      </div>

      <CardHeader className="relative pb-4 flex-shrink-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-300/50 group-hover:scale-105 transition-all duration-300">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300">
                Accès Rapide
              </CardTitle>
              <p className="text-sm text-slate-600 font-medium">
                Applications & Services
              </p>
            </div>
          </div>
          
        </div>
      </CardHeader>
      
      <CardContent className="relative flex-1 flex flex-col justify-start p-6 pt-2 z-10">
        <div className="space-y-4">
          {/* Section SAR - Applications Internes */}
          <div>
            <h3 className="text-sm font-bold text-orange-600 mb-2 flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full shadow-lg"></div>
              <Globe className="h-4 w-4" />
              SAR - Applications Internes
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {sarApps.map((app) => (
                <Button
                  key={app.id}
                  variant="ghost"
                  className="h-16 w-16 p-0 hover:bg-slate-200/50 transition-all duration-300 group/app rounded-xl"
                  onClick={() => window.open(app.url, '_blank')}
                >
                  <div className="w-full h-full flex items-center justify-center text-slate-700 group-hover/app:scale-110 group-hover/app:rotate-3 transition-all duration-300">
                    {app.icon}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Section Microsoft */}
          <div>
            <h3 className="text-sm font-bold text-blue-600 mb-2 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg"></div>
              <ExternalLink className="h-4 w-4" />
              Microsoft
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {microsoftApps.map((app) => (
                <Button
                  key={app.id}
                  variant="ghost"
                  className="h-16 w-16 p-0 hover:bg-slate-200/50 transition-all duration-300 group/app rounded-xl"
                  onClick={() => handleAppClick(app)}
                >
                  <div className="w-full h-full flex items-center justify-center text-slate-700 group-hover/app:scale-110 group-hover/app:rotate-3 transition-all duration-300">
                    {app.icon}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Section Google */}
          <div>
            <h3 className="text-sm font-bold text-red-600 mb-2 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg"></div>
              <Globe className="h-4 w-4" />
              Google
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {googleApps.map((app) => (
                <Button
                  key={app.id}
                  variant="ghost"
                  className="h-16 w-16 p-0 hover:bg-slate-200/50 transition-all duration-300 group/app rounded-xl"
                  onClick={() => handleAppClick(app)}
                >
                  <div className="w-full h-full flex items-center justify-center text-slate-700 group-hover/app:scale-110 group-hover/app:rotate-3 transition-all duration-300">
                    {app.icon}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
