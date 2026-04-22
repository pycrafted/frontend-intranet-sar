import { Plus, FileText } from 'lucide-react'

interface SirhEmptyStateProps {
  label: string
  description?: string
  onNew: () => void
  icon?: React.ElementType
}

export function SirhEmptyState({ label, description, onNew, icon: Icon }: SirhEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-sm">
        {Icon
          ? <Icon className="w-7 h-7 text-slate-300" />
          : <FileText className="w-7 h-7 text-slate-300" />
        }
      </div>
      <p className="text-slate-700 font-semibold mb-1">Aucune {label}</p>
      <p className="text-slate-400 text-sm mb-6 max-w-xs">
        {description ?? `Vous n'avez pas encore de ${label}. Créez votre première demande.`}
      </p>
      <button
        onClick={onNew}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#344256] text-white rounded-xl text-sm font-medium hover:bg-[#2a3548] transition-colors shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Nouvelle demande
      </button>
    </div>
  )
}
