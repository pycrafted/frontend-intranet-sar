import type { TrainingRequest } from '@/lib/types/sirh'
import { SirhStatusBadge } from '../SirhStatusBadge'
import { X, GraduationCap, Calendar, MapPin, DollarSign, Tag, AlertCircle } from 'lucide-react'

interface Props { request: TrainingRequest; onClose: () => void }

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 w-40 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value ?? '—'}</span>
    </div>
  )
}

export function TrainingDetailModal({ request, onClose }: Props) {
  const typeLabel = (t: string) => t === 'internal' ? 'Interne' : t === 'external' ? 'Externe' : t

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#34425618' }}>
              <GraduationCap className="w-4 h-4" style={{ color: '#344256' }} />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">{request.name}</p>
              <p className="text-xs text-gray-400">Détail de la formation</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SirhStatusBadge state={request.state} />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-2">
          <Row label="Formation" value={
            <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-gray-400" />{request.training?.name}</span>
          } />
          <Row label="Type" value={typeLabel(request.training_type)} />
          <Row label="Objectif" value={request.objectif} />
          <Row label="Source" value={request.training_source?.name} />
          <Row label="Type d'action" value={request.action_type_id?.name} />
          <Row label="Date début" value={
            request.start_date
              ? <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{new Date(request.start_date).toLocaleDateString('fr-FR')}</span>
              : null
          } />
          <Row label="Date fin" value={
            request.end_date
              ? <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{new Date(request.end_date).toLocaleDateString('fr-FR')}</span>
              : null
          } />
          <Row label="Lieu" value={
            request.location
              ? <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" />{request.location}</span>
              : null
          } />
          <Row label="Coût estimé" value={
            request.estimated_cost
              ? <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-gray-400" />{request.estimated_cost.toLocaleString('fr-FR')} FCFA</span>
              : null
          } />
          {request.refusal_reason && (
            <div className="flex items-start gap-1.5 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              {request.refusal_reason}
            </div>
          )}
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
