"use client"

import { useState, useRef } from 'react'
import type { RefItem, LoanFormData } from '@/lib/types/sirh'
import { X, Loader2, Paperclip } from 'lucide-react'

interface LoanModalProps {
  loanTypes: RefItem[]
  onClose: () => void
  onSubmit: (data: LoanFormData) => Promise<number>
}

export function LoanModal({ loanTypes, onClose, onSubmit }: LoanModalProps) {
  const [form, setForm] = useState<Partial<LoanFormData>>({})
  const [attachments, setAttachments] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.loan_type_id || !form.amount || !form.nb_months) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({ ...form as LoanFormData, attachments })
      setSuccess(true)
      setTimeout(onClose, 1200)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la soumission')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-800">Nouvelle demande de prêt</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
              Demande soumise avec succès !
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de prêt *</label>
            <select
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
              value={form.loan_type_id ?? ''}
              onChange={e => setForm(f => ({ ...f, loan_type_id: Number(e.target.value) }))}
            >
              <option value="">Sélectionner...</option>
              {loanTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (FCFA) *</label>
              <input
                type="number"
                required
                min={1}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
                value={form.amount ?? ''}
                onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de mois *</label>
              <input
                type="number"
                required
                min={1}
                max={120}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
                value={form.nb_months ?? ''}
                onChange={e => setForm(f => ({ ...f, nb_months: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date début remboursement</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
              value={form.payment_start_date ?? ''}
              onChange={e => setForm(f => ({ ...f, payment_start_date: e.target.value || undefined }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pièces jointes *</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-lg text-sm text-gray-500 hover:border-[#344256] hover:text-[#344256] transition-colors w-full justify-center"
            >
              <Paperclip className="w-4 h-4" />
              Ajouter des fichiers
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFiles}
            />
            {attachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachments.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
                    <span className="truncate text-gray-600">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="ml-2 text-gray-400 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || success}
              className="flex-1 px-4 py-2 bg-[#344256] text-white rounded-lg text-sm hover:bg-[#2a3548] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Envoi...' : 'Soumettre'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
