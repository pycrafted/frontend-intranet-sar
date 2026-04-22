import type { Advance } from '@/lib/types/sirh'
import { SirhStatusBadge } from '../SirhStatusBadge'
import { X, Wallet, Calendar, MessageSquare, Tag } from 'lucide-react'

interface Props { advance: Advance; onClose: () => void }

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 w-40 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value ?? '—'}</span>
    </div>
  )
}

export function AdvanceDetailModal({ advance, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#34425618' }}>
              <Wallet className="w-4 h-4" style={{ color: '#344256' }} />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">{advance.name}</p>
              <p className="text-xs text-gray-400">Détail de l'avance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SirhStatusBadge state={advance.state} />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-2">
          <Row label="Type d'avance" value={
            <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-gray-400" />{advance.type?.name}</span>
          } />
          <Row label="Montant" value={
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-gray-400" />
              {advance.advance_amount?.toLocaleString('fr-FR')} FCFA
            </span>
          } />
          <Row label="Date" value={
            advance.date
              ? <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{new Date(advance.date).toLocaleDateString('fr-FR')}</span>
              : null
          } />
          <Row label="Description / Motif" value={
            advance.description
              ? <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-gray-400" />{advance.description}</span>
              : null
          } />
          <Row label="Commentaire" value={
            advance.comment
              ? <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-gray-400" />{advance.comment}</span>
              : null
          } />
        </div>

        <div className="px-6 py-4">
          <button onClick={onClose} className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
