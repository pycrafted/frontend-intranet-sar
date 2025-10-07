"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Shield, 
  Users,
  Utensils,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Lightbulb,
  PieChart
} from 'lucide-react'
import { ArticleAdminTable } from './article-admin-table'
import { IdeasAdminTable } from './ideas-admin-table'
import { SafetyDataForm } from './safety-data-form'
import { SafetyDataTable } from './safety-data-table'
import { SafetyDashboard } from './safety-dashboard'
import { MenuManagement } from './menu-management'
import { EventManagement } from './event-management'

interface ControlCenterTabsProps {
  className?: string
  activeSection?: string
}

type TabType = 'articles' | 'ideas' | 'safety' | 'users' | 'menu' | 'events'

interface Tab {
  id: TabType
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const tabs: Tab[] = [
  {
    id: 'users',
    label: 'Utilisateurs',
    icon: Users,
    description: 'Gestion des utilisateurs et permissions'
  },
  {
    id: 'articles',
    label: 'Articles',
    icon: FileText,
    description: 'Gestion des actualités et annonces'
  },
  {
    id: 'ideas',
    label: 'Idées',
    icon: Lightbulb,
    description: 'Gestion des idées soumises via la boîte à idées'
  },
  {
    id: 'safety',
    label: 'Sécurité',
    icon: Shield,
    description: 'Données de sécurité au travail'
  },
  {
    id: 'menu',
    label: 'Menu',
    icon: Utensils,
    description: 'Gestion du menu de la semaine'
  },
  {
    id: 'events',
    label: 'Événements',
    icon: Calendar,
    description: 'Gestion des événements et calendrier'
  },
]

export function ControlCenterTabs({ className, activeSection }: ControlCenterTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('users')
  
  // Mettre à jour l'onglet actif basé sur la section du sidebar
  React.useEffect(() => {
    if (activeSection && activeSection !== activeTab) {
      setActiveTab(activeSection as TabType)
    }
  }, [activeSection, activeTab])


  const renderTabContent = () => {
    switch (activeTab) {
      case 'articles':
        return <ArticleAdminTable />
      
      case 'ideas':
        return <IdeasAdminTable />
      
      case 'safety':
        return (
          <div className="space-y-6">
            <SafetyDashboard />
            <SafetyDataForm />
          </div>
        )
      
      case 'menu':
        return <MenuManagement />
      
      case 'events':
        return <EventManagement />
      
      
      case 'users':
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Gestion des utilisateurs</h3>
              <p className="text-gray-500 mb-4">Cette fonctionnalité sera bientôt disponible</p>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                En développement
              </Badge>
            </CardContent>
          </Card>
        )
      
      
      default:
        return null
    }
  }

  return (
    <div className={className}>
      {/* Contenu de l'onglet actif */}
      <div className="min-h-[600px]">
        {renderTabContent()}
      </div>
    </div>
  )
}
