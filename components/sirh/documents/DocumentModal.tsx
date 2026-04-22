"use client"

import { useState } from 'react'
import type { RefItem, DocumentFormData } from '@/lib/types/sirh'
import { X, Loader2 } from 'lucide-react'

interface DocumentModalProps {
  documentTypes: RefItem[]
  onClose: () => void
  onSubmit: (data: DocumentFormData) => Promise<number>
}

export function DocumentModal({ documentTypes, onClose, onSubmit }: DocumentModalProps) {
  const [form, setForm] = useState<Partial<DocumentFormData>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.document_type_id || !form.reason) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(form as DocumentFormData)
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Demande de document RH</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de document *</label>
            <select
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
              value={form.document_type_id ?? ''}
              onChange={e => setForm(f => ({ ...f, document_type_id: Number(e.target.value) }))}
            >
              <option value="">Sélectionner...</option>
              {documentTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motif *</label>
            <textarea
              required
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256] resize-none"
              value={form.reason ?? ''}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
                value={form.date_from ?? ''}
                onChange={e => setForm(f => ({ ...f, date_from: e.target.value || undefined }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
                value={form.date_to ?? ''}
                onChange={e => setForm(f => ({ ...f, date_to: e.target.value || undefined }))}
              />
            </div>
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
