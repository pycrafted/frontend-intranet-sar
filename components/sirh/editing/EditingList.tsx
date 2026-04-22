"use client"

import { useState } from 'react'
import type { EditingRequest, RefItem } from '@/lib/types/sirh'
import { SirhStatusBadge } from '../SirhStatusBadge'
import { SirhEmptyState } from '../SirhEmptyState'
import { EditingDetailModal } from './EditingDetailModal'
import { Plus, FilePen, Calendar, AlertCircle } from 'lucide-react'

interface EditingListProps {
  editingRequests: EditingRequest[]
  editingTypes: RefItem[]
  onNew: () => void
}

const STATUS_ACCENT: Record<string, string> = {
  draft: '#9CA3AF',
  'to approve': '#F59E0B',
  approve: '#10B981',
  done: '#059669',
  refuse: '#EF4444',
}

export function EditingList({ editingRequests, onNew }: EditingListProps) {
  const [selected, setSelected] = useState<EditingRequest | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Modification de fiche</h2>
          <p className="text-gray-400 text-sm">{editingRequests.length} demande{editingRequests.length !== 1 ? 's' : ''} au total</p>
        </div>
        {editingRequests.length > 0 && (
          <button onClick={onNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#344256] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3548] transition-all shadow-sm hover:shadow-md active:scale-95">
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </button>
        )}
      </div>

      {editingRequests.length === 0 ? (
        <SirhEmptyState label="demande de modification" onNew={onNew} icon={FilePen} />
      ) : (
        <div className="flex flex-wrap gap-4">
          {editingRequests.map(req => (
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
                {req.editing_type_id && <p className="text-xs text-gray-400">{req.editing_type_id.name}</p>}
                {req.reason && <p className="text-sm text-gray-600 line-clamp-1">{req.reason}</p>}
                {req.request_date && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(req.request_date).toLocaleDateString('fr-FR')}
                  </span>
                )}
                {req.refuse_reason && (
                  <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {req.refuse_reason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <EditingDetailModal request={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
