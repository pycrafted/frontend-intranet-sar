"use client"

import { createContext, useContext, useState, useCallback } from "react"
import { AlertTriangle, Trash2, X } from "lucide-react"

interface ConfirmOptions {
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "danger" | "warning" | "default"
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void
}

type ConfirmArg = ConfirmOptions | string

const ConfirmContext = createContext<(opts: ConfirmArg) => Promise<boolean>>(async () => false)

export function useConfirm() {
  return useContext(ConfirmContext)
}

function normalize(opts: ConfirmArg): ConfirmOptions {
  return typeof opts === 'string' ? { message: opts } : opts
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null)

  const confirm = useCallback((opts: ConfirmArg): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...normalize(opts), resolve })
    })
  }, [])

  const handleConfirm = () => {
    state?.resolve(true)
    setState(null)
  }

  const handleCancel = () => {
    state?.resolve(false)
    setState(null)
  }

  const variant = state?.variant ?? "danger"
  const iconColor = variant === "danger" ? "#ef4444" : variant === "warning" ? "#f59e0b" : "#344256"
  const btnColor = variant === "danger" ? "bg-red-500 hover:bg-red-600" : variant === "warning" ? "bg-amber-500 hover:bg-amber-600" : "hover:opacity-90"

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: iconColor + "18" }}>
                  {variant === "danger" ? (
                    <Trash2 className="w-5 h-5" style={{ color: iconColor }} />
                  ) : (
                    <AlertTriangle className="w-5 h-5" style={{ color: iconColor }} />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {state.title ?? (variant === "danger" ? "Confirmer la suppression" : "Confirmer l'action")}
                </h3>
              </div>
              <button onClick={handleCancel} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message */}
            <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{state.message}</p>

            {/* Actions */}
            <div className="flex items-center gap-2 px-5 pb-5">
              <button
                onClick={handleCancel}
                className="flex-1 h-9 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                {state.cancelLabel ?? "Annuler"}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 h-9 rounded-xl text-sm font-medium text-white transition-all ${btnColor}`}
                style={variant === "default" ? { backgroundColor: "#344256" } : {}}
              >
                {state.confirmLabel ?? (variant === "danger" ? "Supprimer" : "Confirmer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
