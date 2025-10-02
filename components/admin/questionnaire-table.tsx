"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Edit, 
  Trash2, 
  Eye, 
  Play, 
  Pause, 
  MoreHorizontal,
  Download,
  Calendar,
  Users,
  BarChart3,
  AlertCircle
} from 'lucide-react'
import { Questionnaire } from '@/hooks/useQuestionnaireManagement'
import { QuestionnaireResults } from './questionnaire-results'

interface QuestionnaireTableProps {
  questionnaires: Questionnaire[]
  loading: boolean
  onEdit: (questionnaire: Questionnaire) => void
  onDelete: (id: number) => void
  onViewDetails: (questionnaire: Questionnaire) => void
  onStatusChange: (id: number, status: string) => void
  getStatusColor: (status: string) => string
  getStatusIcon: (status: string) => React.ReactNode
}

export function QuestionnaireTable({
  questionnaires,
  loading,
  onEdit,
  onDelete,
  onViewDetails,
  onStatusChange,
  getStatusColor,
  getStatusIcon
}: QuestionnaireTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [viewingResults, setViewingResults] = useState<Questionnaire | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusActions = (questionnaire: Questionnaire) => {
    switch (questionnaire.status) {
      case 'draft':
        return [
          { label: 'Activer', action: () => onStatusChange(questionnaire.id, 'active'), icon: Play },
          { label: 'Archiver', action: () => onStatusChange(questionnaire.id, 'archived'), icon: AlertCircle }
        ]
      case 'active':
        return [
          { label: 'Mettre en pause', action: () => onStatusChange(questionnaire.id, 'paused'), icon: Pause },
          { label: 'Fermer', action: () => onStatusChange(questionnaire.id, 'closed'), icon: AlertCircle }
        ]
      case 'paused':
        return [
          { label: 'Reprendre', action: () => onStatusChange(questionnaire.id, 'active'), icon: Play },
          { label: 'Fermer', action: () => onStatusChange(questionnaire.id, 'closed'), icon: AlertCircle }
        ]
      case 'closed':
        return [
          { label: 'Réactiver', action: () => onStatusChange(questionnaire.id, 'active'), icon: Play },
          { label: 'Archiver', action: () => onStatusChange(questionnaire.id, 'archived'), icon: AlertCircle }
        ]
      default:
        return []
    }
  }

  if (viewingResults) {
    return (
      <QuestionnaireResults 
        questionnaire={viewingResults}
        onClose={() => setViewingResults(null)}
      />
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600">Chargement des enquêtes...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (questionnaires.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune enquête trouvée</h3>
          <p className="text-gray-500 mb-4">
            {questionnaires.length === 0 
              ? "Commencez par créer votre première enquête"
              : "Aucune enquête ne correspond à vos critères de recherche"
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Enquêtes ({questionnaires.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enquête
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Réponses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créée le
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questionnaires.map((questionnaire) => (
                <React.Fragment key={questionnaire.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {questionnaire.title}
                            </h4>
                            {questionnaire.is_anonymous && (
                              <Badge variant="outline" className="text-xs">
                                Anonyme
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {questionnaire.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {questionnaire.target_audience_type_display}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {questionnaire.questions.length} questions
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="text-xs">
                        {questionnaire.type_display}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`text-xs ${getStatusColor(questionnaire.status)}`}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(questionnaire.status)}
                          {questionnaire.status_display}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {questionnaire.total_responses}
                      </div>
                      <div className="text-xs text-gray-500">
                        {questionnaire.response_rate.toFixed(1)}% de participation
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(questionnaire.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        par {questionnaire.created_by_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEdit(questionnaire)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails(questionnaire)}
                          className="h-8 w-8 p-0"
                          title="Voir les détails"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(questionnaire.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedRow(expandedRow === questionnaire.id ? null : questionnaire.id)}
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                          {expandedRow === questionnaire.id && (
                            <div className="absolute right-0 top-10 z-10 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                              {getStatusActions(questionnaire).map((action, index) => (
                                <button
                                  key={index}
                                  onClick={() => {
                                    action.action()
                                    setExpandedRow(null)
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <action.icon className="h-4 w-4" />
                                  {action.label}
                                </button>
                              ))}
                              <button
                                onClick={() => {
                                  setViewingResults(questionnaire)
                                  setExpandedRow(null)
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="h-4 w-4" />
                                Voir les résultats
                              </button>
                              <button
                                onClick={() => {
                                  // TODO: Implémenter l'export
                                  setExpandedRow(null)
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Download className="h-4 w-4" />
                                Exporter
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === questionnaire.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Détails</h5>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p><strong>ID:</strong> {questionnaire.id}</p>
                              <p><strong>Type:</strong> {questionnaire.type_display}</p>
                              <p><strong>Anonyme:</strong> {questionnaire.is_anonymous ? 'Oui' : 'Non'}</p>
                              <p><strong>Réponses multiples:</strong> {questionnaire.allow_multiple_responses ? 'Oui' : 'Non'}</p>
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Audience</h5>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p><strong>Type:</strong> {questionnaire.target_audience_type_display}</p>
                              {questionnaire.target_departments.length > 0 && (
                                <p><strong>Départements:</strong> {questionnaire.target_departments.join(', ')}</p>
                              )}
                              {questionnaire.target_roles.length > 0 && (
                                <p><strong>Rôles:</strong> {questionnaire.target_roles.join(', ')}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Dates</h5>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p><strong>Début:</strong> {questionnaire.start_date ? formatDate(questionnaire.start_date) : 'Non défini'}</p>
                              <p><strong>Fin:</strong> {questionnaire.end_date ? formatDate(questionnaire.end_date) : 'Non défini'}</p>
                              <p><strong>Modifiée:</strong> {formatDate(questionnaire.updated_at)}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
