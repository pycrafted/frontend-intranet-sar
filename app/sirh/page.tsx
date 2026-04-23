"use client"

import Link from 'next/link'
import { LayoutWrapper } from '@/components/layout-wrapper'
import { AuthGuard } from '@/components/auth-guard'
import { Banknote, Wallet, GraduationCap, FilePen, FileText } from 'lucide-react'

const SERVICES = [
  { href: '/sirh/prets',        label: 'Prêts',        description: 'Demandes de prêts salariaux',   icon: Banknote,      countKey: 'loans' as const },
  { href: '/sirh/avances',      label: 'Avances',      description: 'Avances sur salaire',           icon: Wallet,        countKey: 'advances' as const },
  { href: '/sirh/formation',    label: 'Formation',    description: 'Demandes de formation',         icon: GraduationCap, countKey: 'trainingRequests' as const },
  { href: '/sirh/modification', label: 'Modification', description: 'Modification de fiche RH',      icon: FilePen,       countKey: 'editingRequests' as const },
  { href: '/sirh/documents',    label: 'Documents',    description: 'Attestations & documents',      icon: FileText,      countKey: 'documentRequests' as const },
]

export default function SirhPage() {
  return (
    <AuthGuard>
      <LayoutWrapper>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 px-4">

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Interface SIRH</h1>
            <p className="text-gray-400 text-sm mt-1">Sélectionnez un service pour gérer vos demandes</p>
          </div>

          <div className="flex flex-wrap justify-center gap-5 max-w-3xl w-full">
            {SERVICES.map(({ href, label, description, icon: Icon }) => (
              <Link key={href} href={href} className="group">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 w-44 h-44 hover:shadow-lg hover:border-[#344256]/30 transition-all duration-200 cursor-pointer">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#34425618' }}
                  >
                    <Icon className="w-8 h-8" style={{ color: '#344256' }} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-800 text-sm group-hover:text-[#344256] transition-colors">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">{description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </LayoutWrapper>
    </AuthGuard>
  )
}
