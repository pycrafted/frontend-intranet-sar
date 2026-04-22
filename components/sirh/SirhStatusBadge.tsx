import { STATE_LABELS } from '@/lib/types/sirh'

export function SirhStatusBadge({ state }: { state: string }) {
  const meta = STATE_LABELS[state] ?? { label: state, color: 'bg-gray-100 text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
      {meta.label}
    </span>
  )
}
