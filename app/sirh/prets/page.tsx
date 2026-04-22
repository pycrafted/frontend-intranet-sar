"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { StandardLoader } from '@/components/ui/standard-loader'
import { AuthGuard } from '@/components/auth-guard'
import { useSirhContext } from '@/contexts/SirhContext'
import { LoanList } from '@/components/sirh/loans/LoanList'
import { LoanModal } from '@/components/sirh/loans/LoanModal'

export default function PretsPage() {
  const sirh = useSirhContext()
  const [modal, setModal] = useState(false)

  return (
    <AuthGuard>
      <LayoutWrapper>
        <div className="w-full max-w-4xl mx-auto space-y-6 overflow-hidden">

          <Link href="/sirh" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour aux services RH
          </Link>

          {sirh.error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{sirh.error}</p>
            </div>
          )}

          {sirh.loading ? (
            <div className="flex items-center justify-center py-10">
              <StandardLoader title="" message="" />
            </div>
          ) : (
            <LoanList loans={sirh.loans} loanTypes={sirh.loanTypes} onNew={() => setModal(true)} />
          )}

          {modal && (
            <LoanModal loanTypes={sirh.loanTypes} onClose={() => setModal(false)} onSubmit={sirh.createLoan} />
          )}
        </div>
      </LayoutWrapper>
    </AuthGuard>
  )
}
