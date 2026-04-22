"use client"

import { useState, useCallback } from 'react'
import { API_CONFIG } from '@/lib/config'
import type {
  SirhEmployee, RefItem,
  Loan, LoanFormData,
  Advance, AdvanceFormData,
  TrainingRequest, TrainingFormData,
  EditingRequest, EditingFormData,
  DocumentRequest, DocumentFormData,
} from '@/lib/types/sirh'

const BASE = () => API_CONFIG.SIRH

function getCsrfToken(): string {
  return document.cookie.split('; ').find(c => c.startsWith('csrftoken='))?.split('=')[1] ?? ''
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const isWrite = options?.method && options.method !== 'GET' && options.method !== 'HEAD'
  const extraHeaders: Record<string, string> = isWrite ? { 'X-CSRFToken': getCsrfToken() } : {}
  const res = await fetch(`${BASE()}/${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...extraHeaders, ...(options?.headers as Record<string, string> ?? {}) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    if (body?.error === 'employee_not_found') {
      const err = new Error(body.detail || 'Employé non trouvé')
      ;(err as any).code = 'employee_not_found'
      throw err
    }
    throw new Error(body?.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export interface SirhState {
  employee: SirhEmployee | null
  loans: Loan[]
  advances: Advance[]
  trainingRequests: TrainingRequest[]
  editingRequests: EditingRequest[]
  documentRequests: DocumentRequest[]
  // Référentiels
  loanTypes: RefItem[]
  advanceTypes: RefItem[]
  trainingNames: RefItem[]
  trainingSources: RefItem[]
  trainingActionTypes: RefItem[]
  editingTypes: RefItem[]
  documentTypes: RefItem[]
  // États
  loading: boolean
  refLoading: boolean
  error: string | null
  employeeNotFound: boolean
}

export function useSirh() {
  const [state, setState] = useState<SirhState>({
    employee: null,
    loans: [], advances: [], trainingRequests: [], editingRequests: [], documentRequests: [],
    loanTypes: [], advanceTypes: [], trainingNames: [], trainingSources: [],
    trainingActionTypes: [], editingTypes: [], documentTypes: [],
    loading: false, refLoading: false, error: null, employeeNotFound: false,
  })

  const setPartial = (patch: Partial<SirhState>) =>
    setState(prev => ({ ...prev, ...patch }))

  // ── Charger toutes les demandes de l'employé ────────────────────────────

  const fetchAll = useCallback(async () => {
    setPartial({ loading: true, error: null, employeeNotFound: false })
    try {
      const [employee, loans, advances, training, editing, documents] = await Promise.all([
        apiFetch<SirhEmployee>('me/'),
        apiFetch<Loan[]>('loans/'),
        apiFetch<Advance[]>('advances/'),
        apiFetch<TrainingRequest[]>('training-requests/'),
        apiFetch<EditingRequest[]>('editing-requests/'),
        apiFetch<DocumentRequest[]>('document-requests/'),
      ])
      setPartial({
        employee, loans, advances,
        trainingRequests: training,
        editingRequests: editing,
        documentRequests: documents,
        loading: false,
      })
    } catch (err: any) {
      if (err?.code === 'employee_not_found') {
        setPartial({ loading: false, employeeNotFound: true })
      } else {
        setPartial({ loading: false, error: err.message || 'Erreur de chargement' })
      }
    }
  }, [])

  // ── Charger les référentiels (listes déroulantes) ───────────────────────

  const fetchReferentials = useCallback(async () => {
    setPartial({ refLoading: true })
    const keys = ['loanTypes', 'advanceTypes', 'trainingNames', 'trainingSources', 'trainingActionTypes', 'editingTypes', 'documentTypes'] as const
    const endpoints = ['loan-types/', 'advance-types/', 'training-names/', 'training-sources/', 'training-action-types/', 'editing-types/', 'document-types/']
    const results = await Promise.allSettled(endpoints.map(ep => apiFetch<RefItem[]>(ep)))
    const patch: Partial<SirhState> = { refLoading: false }
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        patch[keys[i]] = r.value
      } else {
        console.error(`SIRH referential ${endpoints[i]} failed:`, r.reason)
        patch[keys[i]] = []
      }
    })
    setPartial(patch)
  }, [])

  // ── Créer un prêt ────────────────────────────────────────────────────────

  const createLoan = useCallback(async (data: LoanFormData): Promise<number> => {
    const fd = new FormData()
    fd.append('loan_type_id', String(data.loan_type_id))
    fd.append('amount', String(data.amount))
    fd.append('nb_months', String(data.nb_months))
    if (data.payment_start_date) fd.append('payment_start_date', data.payment_start_date)
    if (data.attachments) {
      data.attachments.forEach(f => fd.append('attachments', f))
    }
    const res = await apiFetch<{ id: number }>('loans/', { method: 'POST', body: fd })
    const newLoan = await apiFetch<Loan[]>('loans/')
    setPartial({ loans: newLoan })
    return res.id
  }, [])

  // ── Créer une avance ─────────────────────────────────────────────────────

  const createAdvance = useCallback(async (data: AdvanceFormData): Promise<number> => {
    const res = await apiFetch<{ id: number }>('advances/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const newList = await apiFetch<Advance[]>('advances/')
    setPartial({ advances: newList })
    return res.id
  }, [])

  // ── Créer une demande de formation ───────────────────────────────────────

  const createTrainingRequest = useCallback(async (data: TrainingFormData): Promise<number> => {
    const res = await apiFetch<{ id: number }>('training-requests/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const newList = await apiFetch<TrainingRequest[]>('training-requests/')
    setPartial({ trainingRequests: newList })
    return res.id
  }, [])

  // ── Créer une demande de modification ────────────────────────────────────

  const createEditingRequest = useCallback(async (data: EditingFormData): Promise<number> => {
    const res = await apiFetch<{ id: number }>('editing-requests/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const newList = await apiFetch<EditingRequest[]>('editing-requests/')
    setPartial({ editingRequests: newList })
    return res.id
  }, [])

  // ── Créer une demande de document ────────────────────────────────────────

  const createDocumentRequest = useCallback(async (data: DocumentFormData): Promise<number> => {
    const res = await apiFetch<{ id: number }>('document-requests/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const newList = await apiFetch<DocumentRequest[]>('document-requests/')
    setPartial({ documentRequests: newList })
    return res.id
  }, [])

  return {
    ...state,
    fetchAll,
    fetchReferentials,
    createLoan,
    createAdvance,
    createTrainingRequest,
    createEditingRequest,
    createDocumentRequest,
  }
}
