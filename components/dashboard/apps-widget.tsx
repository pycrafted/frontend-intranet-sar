"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Folder, Plus } from "lucide-react"

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
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M7.5 2h9A1.5 1.5 0 0 1 18 3.5v17a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20.5v-17A1.5 1.5 0 0 1 7.5 2zM12 7.5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/>
  </svg>
)

const TeamsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M20.5 2.02h-17A1.5 1.5 0 0 0 2 3.52v17A1.5 1.5 0 0 0 3.5 22.02h17a1.5 1.5 0 0 0 1.5-1.5v-17a1.5 1.5 0 0 0-1.5-1.5zM7 20.02H4v-3h3v3zm0-4.5H4v-3h3v3zm0-4.5H4V8h3v3zm4.5 9H8.5v-3h3v3zm0-4.5h-3v-3h3v3zm0-4.5h-3V8h3v3zm4.5 9H13v-3h3v3zm0-4.5h-3v-3h3v3zm0-4.5h-3V8h3v3z"/>
  </svg>
)

const OneDriveIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
)

const SharePointIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
)

const GmailIcon = () => (
  <img 
    src="/gmail.png" 
    alt="Gmail" 
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
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
  </svg>
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
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
)

const QualiproIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
)

const SAPFPIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
  </svg>
)

const MaarchCourrierIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
)

const MaarchParapheurIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
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
    <Card className="h-[28rem] bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 border-0 hover:shadow-xl transition-all duration-500 group flex flex-col overflow-hidden relative">
       {/* Effet de brillance en arrière-plan */}
       <div className="absolute inset-0 bg-gradient-to-br from-slate-200/20 via-transparent to-gray-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
       {/* Header */}
       <CardHeader className="pb-4 flex-shrink-0 relative z-10">
         <div className="flex items-center justify-center">
           <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-slate-700 transition-colors duration-300">
           </CardTitle>
         </div>
       </CardHeader>
      
      <CardContent className="relative flex-1 flex flex-col justify-start p-6 pt-2">
        <div className="space-y-4">
          {/* Section SAR */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              SAR - Applications Internes
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {sarApps.map((app) => (
                <Button
                  key={app.id}
                  variant="ghost"
                  className="h-16 w-16 p-0 hover:bg-white/50 transition-all duration-200 group/app rounded-xl"
                  onClick={() => window.open(app.url, '_blank')}
                >
                  <div className={`w-full h-full rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white group-hover/app:scale-110 transition-transform duration-200 shadow-lg`}>
                    {app.icon}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Section Microsoft */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Microsoft
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {microsoftApps.map((app) => (
                <Button
                  key={app.id}
                  variant="ghost"
                  className="h-16 w-16 p-0 hover:bg-white/50 transition-all duration-200 group/app rounded-xl"
                  onClick={() => handleAppClick(app)}
                >
                  <div className={`w-full h-full rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white group-hover/app:scale-110 transition-transform duration-200 shadow-lg`}>
                    {app.icon}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Section Google */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Google
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {googleApps.map((app) => (
                <Button
                  key={app.id}
                  variant="ghost"
                  className="h-16 w-16 p-0 hover:bg-white/50 transition-all duration-200 group/app rounded-xl"
                  onClick={() => handleAppClick(app)}
                >
                  <div className={`w-full h-full rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center text-white group-hover/app:scale-110 transition-transform duration-200 shadow-lg`}>
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
