import type { SirhTab } from '@/lib/types/sirh'
import { cn } from '@/lib/utils'

const TABS: { id: SirhTab; label: string }[] = [
  { id: 'loans',     label: 'Prêts' },
  { id: 'advances',  label: 'Avances' },
  { id: 'training',  label: 'Formation' },
  { id: 'editing',   label: 'Modification' },
  { id: 'documents', label: 'Documents' },
]

interface SirhTabBarProps {
  active: SirhTab
  onChange: (tab: SirhTab) => void
}

export function SirhTabBar({ active, onChange }: SirhTabBarProps) {
  return (
    <div className="flex overflow-x-auto gap-1 bg-slate-100 rounded-xl p-1 mb-6">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex-1 min-w-fit px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
            active === tab.id
              ? 'bg-white text-[#344256] shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
