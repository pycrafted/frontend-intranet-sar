"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  BarChart3, 
  Users, 
  Calendar,
  Eye,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  MoreHorizontal,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useQuestionnaireManagement, Questionnaire, QuestionnaireStats } from '@/hooks/useQuestionnaireManagement'
import { QuestionnaireForm } from './questionnaire-form'
import { QuestionnaireTable } from './questionnaire-table'
import { QuestionnaireStatsCards } from './questionnaire-stats-cards'

interface QuestionnaireManagementProps {
  className?: string
}

export function QuestionnaireManagement({ className }: QuestionnaireManagementProps) {
  const {
    questionnaires,
    stats,
    loading,
    error,
    fetchQuestionnaires,
    fetchStats,
    deleteQuestionnaire,
    duplicateQuestionnaire,
    updateQuestionnaireStatus,
    createQuestionnaire,
    updateQuestionnaire
  } = useQuestionnaireManagement()

  const [showForm, setShowForm] = useState(false)
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Charger les données au montage
  useEffect(() => {
    fetchQuestionnaires()
    fetchStats()
  }, [])

  // Filtrer les enquêtes
  const filteredQuestionnaires = questionnaires.filter(questionnaire => {
    // Protection contre les éléments undefined/null
    if (!questionnaire || !questionnaire.title || !questionnaire.description) {
      return false
    }
    
    const matchesSearch = questionnaire.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         questionnaire.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || questionnaire.status === statusFilter
    const matchesType = typeFilter === 'all' || questionnaire.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleCreateNew = () => {
    setEditingQuestionnaire(null)
    setShowForm(true)
  }

  const handleEdit = (questionnaire: Questionnaire) => {
    setEditingQuestionnaire(questionnaire)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingQuestionnaire(null)
    // Recharger les données
    fetchQuestionnaires()
    fetchStats()
  }

  const handleSave = async (questionnaireData: Questionnaire) => {
    try {
      if (editingQuestionnaire) {
        // Mise à jour
        await updateQuestionnaire(editingQuestionnaire.id, questionnaireData)
      } else {
        // Création
        await createQuestionnaire(questionnaireData)
      }
      handleCloseForm()
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette enquête ?')) {
      const success = await deleteQuestionnaire(id)
      if (success) {
        fetchStats() // Recharger les stats
      }
    }
  }

  const handleDuplicate = async (id: number) => {
    const duplicated = await duplicateQuestionnaire(id)
    if (duplicated) {
      fetchStats() // Recharger les stats
    }
  }

  const handleViewDetails = (questionnaire: Questionnaire) => {
    // Pour l'instant, on ouvre le formulaire en mode lecture
    setEditingQuestionnaire(questionnaire)
    setShowForm(true)
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    await updateQuestionnaireStatus(id, newStatus)
    fetchStats() // Recharger les stats
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'closed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived': return 'bg-gray-100 text-gray-600 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />
      case 'active': return <Play className="h-4 w-4" />
      case 'paused': return <Pause className="h-4 w-4" />
      case 'closed': return <CheckCircle className="h-4 w-4" />
      case 'archived': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (showForm) {
    return (
      <QuestionnaireForm 
        questionnaire={editingQuestionnaire}
        onClose={handleCloseForm}
        onSave={handleSave}
      />
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec statistiques */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Enquêtes</h2>
          <p className="text-gray-600">Créez, gérez et analysez vos enquêtes internes</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Enquête
        </Button>
      </div>

      {/* Cartes de statistiques */}
      {stats && (
        <QuestionnaireStatsCards stats={stats} />
      )}

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher une enquête..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtre par statut */}
            <div className="lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="active">Actif</option>
                <option value="paused">En pause</option>
                <option value="closed">Fermé</option>
                <option value="archived">Archivé</option>
              </select>
            </div>

            {/* Filtre par type */}
            <div className="lg:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Tous les types</option>
                <option value="survey">Sondage</option>
                <option value="quiz">Quiz</option>
                <option value="evaluation">Évaluation</option>
                <option value="feedback">Retour d'expérience</option>
                <option value="poll">Sondage rapide</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des enquêtes */}
      <QuestionnaireTable
        questionnaires={filteredQuestionnaires}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
        onStatusChange={handleStatusChange}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
      />

      {/* Message d'erreur */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}