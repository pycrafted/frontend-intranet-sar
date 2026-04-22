"use client"

import { useState } from 'react'
import type { RefItem, TrainingFormData } from '@/lib/types/sirh'
import { X, Loader2 } from 'lucide-react'

interface TrainingModalProps {
  trainingNames: RefItem[]
  trainingSources: RefItem[]
  trainingActionTypes: RefItem[]
  onClose: () => void
  onSubmit: (data: TrainingFormData) => Promise<number>
}

export function TrainingModal({ trainingNames, trainingSources, trainingActionTypes, onClose, onSubmit }: TrainingModalProps) {
  const [form, setForm] = useState<Partial<TrainingFormData>>({ training_type: 'external' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const set = (patch: Partial<TrainingFormData>) => setForm(f => ({ ...f, ...patch }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const required: (keyof TrainingFormData)[] = ['training_id', 'objectif', 'training_type', 'source_id', 'action_type_id', 'start_date', 'end_date']
    if (required.some(k => !form[k])) return
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit(form as TrainingFormData)
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-800">Demande de formation</h3>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Formation *</label>
            <select
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
              value={form.training_id ?? ''}
              onChange={e => set({ training_id: Number(e.target.value) })}
            >
              <option value="">Sélectionner...</option>
              {trainingNames.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objectif *</label>
            <input
              type="text"
              required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
              value={form.objectif ?? ''}
              onChange={e => set({ objectif: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
            <div className="flex gap-4">
              {(['internal', 'external'] as const).map(t => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="training_type"
                    value={t}
                    checked={form.training_type === t}
                    onChange={() => set({ training_type: t })}
                    className="accent-[#344256]"
                  />
                  <span className="text-sm text-gray-700">{t === 'internal' ? 'Interne' : 'Externe'}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source *</label>
              <select
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
                value={form.source_id ?? ''}
                onChange={e => set({ source_id: Number(e.target.value) })}
              >
                <option value="">Sélectionner...</option>
                {trainingSources.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'action *</label>
              <select
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
                value={form.action_type_id ?? ''}
                onChange={e => set({ action_type_id: Number(e.target.value) })}
              >
                <option value="">Sélectionner...</option>
                {trainingActionTypes.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date début *</label>
              <input
                type="date"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
                value={form.start_date ?? ''}
                onChange={e => set({ start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date fin *</label>
              <input
                type="date"
                required
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
                value={form.end_date ?? ''}
                onChange={e => set({ end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
                value={form.location ?? ''}
                onChange={e => set({ location: e.target.value || undefined })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coût estimé (FCFA)</label>
              <input
                type="number"
                min={0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#344256]"
                value={form.estimated_cost ?? ''}
                onChange={e => set({ estimated_cost: Number(e.target.value) || undefined })}
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
