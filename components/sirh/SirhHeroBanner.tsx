import { Building2, Briefcase, ShieldCheck } from 'lucide-react'
import type { SirhEmployee } from '@/lib/types/sirh'

interface SirhHeroBannerProps {
  employee: SirhEmployee | null
  loading: boolean
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function SirhHeroBanner({ employee, loading }: SirhHeroBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl flex items-center justify-between gap-6 px-6 py-5"
      style={{ backgroundColor: '#344256' }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute -bottom-6 left-1/3 w-48 h-20 rounded-full bg-white/3 pointer-events-none" />

      {/* Left: title */}
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Espace RH</p>
          <h1 className="text-white text-base font-bold leading-tight">Système d'Information RH</h1>
          <p className="text-white/50 text-xs mt-0.5">Gérez toutes vos demandes directement depuis l'intranet</p>
        </div>
      </div>

      {/* Right: employee info */}
      <div className="relative z-10 flex-shrink-0">
        {loading ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-44 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ) : employee ? (
          <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-xl px-4 py-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {getInitials(employee.name)}
            </div>
            <div>
              <p className="font-semibold text-sm text-white leading-tight">{employee.name}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                {employee.department && (
                  <span className="flex items-center gap-1 text-white/60 text-xs">
                    <Building2 className="w-3 h-3" />{employee.department}
                  </span>
                )}
                {employee.job_title && (
                  <span className="flex items-center gap-1 text-white/60 text-xs">
                    <Briefcase className="w-3 h-3" />{employee.job_title}
                  </span>
                )}
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 ml-1" title="Compte actif" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
