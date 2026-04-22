"use client"

import { useState } from 'react'
import type { Loan, RefItem } from '@/lib/types/sirh'
import { SirhStatusBadge } from '../SirhStatusBadge'
import { SirhEmptyState } from '../SirhEmptyState'
import { LoanDetailModal } from './LoanDetailModal'
import { Plus, Banknote, Clock, Calendar } from 'lucide-react'

interface LoanListProps {
  loans: Loan[]
  loanTypes: RefItem[]
  onNew: () => void
}

const STATUS_ACCENT: Record<string, string> = {
  draft: '#9CA3AF',
  hrbp: '#F59E0B', resp: '#F59E0B', drh: '#F59E0B', dg: '#F59E0B',
  valid: '#10B981',
  refuse: '#EF4444',
}

export function LoanList({ loans, onNew }: LoanListProps) {
  const [selected, setSelected] = useState<Loan | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Demandes de prêt</h2>
          <p className="text-gray-400 text-sm">{loans.length} demande{loans.length !== 1 ? 's' : ''} au total</p>
        </div>
        {loans.length > 0 && (
          <button onClick={onNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#344256] text-white rounded-xl text-sm font-semibold hover:bg-[#2a3548] transition-all shadow-sm hover:shadow-md active:scale-95">
            <Plus className="w-4 h-4" />
            Nouvelle demande
          </button>
        )}
      </div>

      {loans.length === 0 ? (
        <SirhEmptyState label="demande de prêt" onNew={onNew} icon={Banknote} />
      ) : (
        <div className="flex flex-wrap gap-4">
          {loans.map(loan => (
            <div key={loan.id}
              onClick={() => setSelected(loan)}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-[#344256]/30 transition-all duration-200 overflow-hidden w-72 flex-shrink-0 cursor-pointer">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_ACCENT[loan.state] ?? '#9CA3AF' }} />
                  <p className="font-semibold text-sm text-gray-800 truncate">{loan.name}</p>
                </div>
                <SirhStatusBadge state={loan.state} />
              </div>
              <div className="px-4 py-3 space-y-2">
                {loan.type && <p className="text-xs text-gray-400">{loan.type.name}</p>}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-bold text-gray-700">
                    {loan.loan_amount?.toLocaleString('fr-FR')}
                    <span className="text-xs font-normal text-gray-400 ml-1">FCFA</span>
                  </span>
                  {loan.month_except > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                      <Clock className="w-3 h-3" />{loan.month_except} mois
                    </span>
                  )}
                  {loan.payment_start_date && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5">
                      <Calendar className="w-3 h-3" />Début {new Date(loan.payment_start_date).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>
                {loan.comment && <p className="text-xs text-gray-400 italic truncate">{loan.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <LoanDetailModal loan={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
