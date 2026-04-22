"use client"

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { StandardLoader } from '@/components/ui/standard-loader'
import { AuthGuard } from '@/components/auth-guard'
import { useSirhContext } from '@/contexts/SirhContext'
import { EditingList } from '@/components/sirh/editing/EditingList'
import { EditingModal } from '@/components/sirh/editing/EditingModal'

export default function ModificationPage() {
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
            <EditingList editingRequests={sirh.editingRequests} editingTypes={sirh.editingTypes} onNew={() => setModal(true)} />
          )}

          {modal && (
            <EditingModal editingTypes={sirh.editingTypes} onClose={() => setModal(false)} onSubmit={sirh.createEditingRequest} />
          )}
        </div>
      </LayoutWrapper>
    </AuthGuard>
  )
}
