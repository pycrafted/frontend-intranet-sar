import type { Loan } from '@/lib/types/sirh'
import { SirhStatusBadge } from '../SirhStatusBadge'
import { X, Banknote, Clock, Calendar, MessageSquare, Tag } from 'lucide-react'

interface Props { loan: Loan; onClose: () => void }

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 w-40 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value ?? '—'}</span>
    </div>
  )
}

export function LoanDetailModal({ loan, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#34425618' }}>
              <Banknote className="w-4 h-4" style={{ color: '#344256' }} />
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">{loan.name}</p>
              <p className="text-xs text-gray-400">Détail du prêt</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SirhStatusBadge state={loan.state} />
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-2">
          <Row label="Type de prêt" value={
            <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-gray-400" />{loan.type?.name}</span>
          } />
          <Row label="Montant" value={
            <span className="flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-gray-400" />
              {loan.loan_amount?.toLocaleString('fr-FR')} FCFA
            </span>
          } />
          <Row label="Durée" value={
            loan.month_except > 0
              ? <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" />{loan.month_except} mois</span>
              : null
          } />
          <Row label="Début remboursement" value={
            loan.payment_start_date
              ? <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{new Date(loan.payment_start_date).toLocaleDateString('fr-FR')}</span>
              : null
          } />
          <Row label="Date de demande" value={
            loan.date
              ? <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{new Date(loan.date).toLocaleDateString('fr-FR')}</span>
              : null
          } />
          <Row label="Commentaire" value={
            loan.comment
              ? <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-gray-400" />{loan.comment}</span>
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
