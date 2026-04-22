"use client"

import { useState } from 'react'
import type { TrainingRequest, RefItem } from '@/lib/types/sirh'
import { SirhStatusBadge } from '../SirhStatusBadge'
import { SirhEmptyState } from '../SirhEmptyState'
import { TrainingDetailModal } from './TrainingDetailModal'
import { Plus, GraduationCap, Calendar, MapPin } from 'lucide-react'

interface TrainingListProps {
  trainingRequests: TrainingRequest[]
  trainingNames: RefItem[]
  onNew: () => void
}

const STATUS_ACCENT: Record<string, string> = {
  draft: '#9CA3AF',
  waiting: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
}

export function TrainingList({ trainingRequests, onNew }: TrainingListProps) {
  const [selected, setSelected] = useState<TrainingRequest | null>(null)
  const typeLabel = (t: string) => t === 'internal' ? 'Interne' : t === 'external' ? 'Externe' : t

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Demandes de formation</h2>
          <p className="text-gray-400 text-sm">{trainingRequests.length} demande{trainingRequests.length !== 1 ? 's' : ''} au total</p>
        </div>
        {trainingRequests.length > 0 && (
          <button onClick={onNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#344256] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3548] transition-all shadow-sm hover:shadow-md active:scale-95">
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </button>
        )}
      </div>

      {trainingRequests.length === 0 ? (
        <SirhEmptyState label="demande de formation" onNew={onNew} icon={GraduationCap} />
      ) : (
        <div className="flex flex-wrap gap-4">
          {trainingRequests.map(req => (
            <div key={req.id}
              onClick={() => setSelected(req)}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-[#344256]/30 transition-all duration-200 overflow-hidden w-72 flex-shrink-0 cursor-pointer">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_ACCENT[req.state] ?? '#9CA3AF' }} />
                  <p className="font-semibold text-sm text-gray-800 truncate">{req.name}</p>
                </div>
                <SirhStatusBadge state={req.state} />
              </div>
              <div className="px-4 py-3 space-y-2">
                {req.training && <p className="text-xs text-gray-400">{req.training.name}</p>}
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 rounded-full px-2 py-0.5">
                    {typeLabel(req.training_type)}
                  </span>
                  {req.start_date && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(req.start_date).toLocaleDateString('fr-FR')}
                      {req.end_date && ` → ${new Date(req.end_date).toLocaleDateString('fr-FR')}`}
                    </span>
                  )}
                  {req.location && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                      <MapPin className="w-3 h-3" />{req.location}
                    </span>
                  )}
                </div>
                {req.objectif && <p className="text-xs text-gray-400 italic truncate">{req.objectif}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <TrainingDetailModal request={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
