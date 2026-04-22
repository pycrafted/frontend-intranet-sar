"use client"

import { useState } from 'react'
import type { DocumentRequest, RefItem } from '@/lib/types/sirh'
import { SirhStatusBadge } from '../SirhStatusBadge'
import { SirhEmptyState } from '../SirhEmptyState'
import { DocumentDetailModal } from './DocumentDetailModal'
import { Plus, FileText, Calendar, AlertCircle } from 'lucide-react'

interface DocumentListProps {
  documentRequests: DocumentRequest[]
  documentTypes: RefItem[]
  onNew: () => void
}

const STATUS_ACCENT: Record<string, string> = {
  draft: '#9CA3AF',
  'to approve': '#F59E0B',
  approve: '#10B981',
  download: '#059669',
  refuse: '#EF4444',
}

export function DocumentList({ documentRequests, onNew }: DocumentListProps) {
  const [selected, setSelected] = useState<DocumentRequest | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Documents RH</h2>
          <p className="text-gray-400 text-sm">{documentRequests.length} demande{documentRequests.length !== 1 ? 's' : ''} au total</p>
        </div>
        {documentRequests.length > 0 && (
          <button onClick={onNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#344256] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3548] transition-all shadow-sm hover:shadow-md active:scale-95">
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </button>
        )}
      </div>

      {documentRequests.length === 0 ? (
        <SirhEmptyState label="demande de document" onNew={onNew} icon={FileText} />
      ) : (
        <div className="flex flex-wrap gap-4">
          {documentRequests.map(doc => (
            <div key={doc.id}
              onClick={() => setSelected(doc)}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-[#344256]/30 transition-all duration-200 overflow-hidden w-72 flex-shrink-0 cursor-pointer">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_ACCENT[doc.state] ?? '#9CA3AF' }} />
                  <p className="font-semibold text-sm text-gray-800 truncate">{doc.name}</p>
                </div>
                <SirhStatusBadge state={doc.state} />
              </div>
              <div className="px-4 py-3 space-y-2">
                {doc.document_type_id && <p className="text-xs text-gray-400">{doc.document_type_id.name}</p>}
                {doc.reason && <p className="text-sm text-gray-600 line-clamp-1">{doc.reason}</p>}
                {(doc.date_from || doc.date_to) && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5 w-fit">
                    <Calendar className="w-3 h-3" />
                    {doc.date_from && new Date(doc.date_from).toLocaleDateString('fr-FR')}
                    {doc.date_from && doc.date_to && ' → '}
                    {doc.date_to && new Date(doc.date_to).toLocaleDateString('fr-FR')}
                  </span>
                )}
                {doc.refuse_reason && (
                  <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-2.5 py-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{doc.refuse_reason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <DocumentDetailModal request={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
