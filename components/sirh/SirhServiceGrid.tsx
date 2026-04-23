import { cn } from '@/lib/utils'
import type { SirhTab } from '@/lib/types/sirh'
import { Banknote, Wallet, GraduationCap, FilePen, FileText } from 'lucide-react'

const SERVICES: {
  id: SirhTab
  label: string
  description: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
}[] = [
  { id: 'loans',     label: 'Prêts',        description: 'Prêts salariaux',          icon: Banknote,      iconBg: '#EFF6FF', iconColor: '#2563EB' },
  { id: 'advances',  label: 'Avances',      description: 'Avances sur salaire',      icon: Wallet,        iconBg: '#F5F3FF', iconColor: '#7C3AED' },
  { id: 'training',  label: 'Formation',    description: 'Demandes de formation',    icon: GraduationCap, iconBg: '#ECFDF5', iconColor: '#059669' },
  { id: 'editing',   label: 'Modification', description: 'Modification de fiche RH', icon: FilePen,       iconBg: '#FFFBEB', iconColor: '#D97706' },
  { id: 'documents', label: 'Documents',    description: 'Attestations & documents', icon: FileText,      iconBg: '#F0F9FF', iconColor: '#0284C7' },
]

interface SirhServiceGridProps {
  active: SirhTab
  onChange: (tab: SirhTab) => void
  counts?: Partial<Record<SirhTab, number>>
}

export function SirhServiceGrid({ active, onChange, counts }: SirhServiceGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {SERVICES.map(({ id, label, description, icon: Icon, iconBg, iconColor }) => {
        const isActive = active === id
        const count = counts?.[id] ?? 0
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              'flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 group h-[160px]',
              isActive
                ? 'border-[#344256] bg-[#344256]/5 shadow-sm'
                : 'border-gray-200 bg-white hover:shadow-md hover:border-[#344256]/30'
            )}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: isActive ? '#344256' + '18' : iconBg }}
            >
              <Icon className="w-5 h-5" style={{ color: isActive ? '#344256' : iconColor }} />
            </div>

            <div className="w-full">
              <p className={cn('font-bold text-sm', isActive ? 'text-[#344256]' : 'text-gray-900 group-hover:text-[#344256] transition-colors')}>
                {label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{description}</p>
            </div>

            <div className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full',
              isActive
                ? 'bg-[#344256]/10 text-[#344256]'
                : 'bg-gray-100 text-gray-500'
            )}>
              {count} demande{count !== 1 ? 's' : ''}
            </div>
          </button>
        )
      })}
    </div>
  )
}
