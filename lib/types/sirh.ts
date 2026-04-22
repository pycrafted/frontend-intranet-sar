export interface SirhEmployee {
  id: number
  name: string
  work_email: string
  department: string
  job_title: string
}

export interface RefItem { id: number; name: string }

// ── Prêts ───────────────────────────────────────────────────────────────────

export interface Loan {
  id: number
  name: string
  type: RefItem | null        // hr.loan.type
  loan_amount: number
  month_except: number        // nombre de mois (champ Odoo réel)
  payment_start_date: string | null
  state: string
  date: string | null
  comment: string | null
}

export interface LoanFormData {
  loan_type_id: number
  amount: number
  nb_months: number
  payment_start_date?: string
  attachments?: File[]
}

// ── Avances ─────────────────────────────────────────────────────────────────

export interface Advance {
  id: number
  name: string
  type: RefItem | null        // hr.advance.type
  advance_amount: number
  description: string
  state: string
  date: string | null
  comment: string | null
}

export interface AdvanceFormData {
  advance_type_id: number
  amount: number
  description: string
}

// ── Formation ────────────────────────────────────────────────────────────────

export interface TrainingRequest {
  id: number
  name: string
  training: RefItem | null          // hr.training.course (champ Odoo: 'training')
  training_type: string
  objectif: string
  training_source: RefItem | null   // hr.training.source (champ Odoo: 'training_source')
  action_type_id: RefItem | null    // hr.training.action_type
  start_date: string
  end_date: string
  location: string | null
  estimated_cost: number
  state: string
  etat: string | null
  refusal_reason: string | null
}

export interface TrainingFormData {
  training_id: number
  objectif: string
  training_type: 'internal' | 'external'
  source_id: number
  action_type_id: number
  start_date: string
  end_date: string
  location?: string
  estimated_cost?: number
}

// ── Modification de fiche ────────────────────────────────────────────────────

export interface EditingRequest {
  id: number
  name: string
  editing_type_id: RefItem | null
  reason: string
  state: string
  request_date: string | null
  refuse_reason: string | null
}

export interface EditingFormData {
  editing_type_id: number
  reason: string
}

// ── Documents RH ─────────────────────────────────────────────────────────────

export interface DocumentRequest {
  id: number
  name: string
  document_type_id: RefItem | null
  reason: string
  state: string
  request_date: string | null
  date_from: string | null
  date_to: string | null
  refuse_reason: string | null
}

export interface DocumentFormData {
  document_type_id: number
  reason: string
  date_from?: string
  date_to?: string
}

// ── État → label + couleur ───────────────────────────────────────────────────

export const STATE_LABELS: Record<string, { label: string; color: string }> = {
  // Communs
  draft:       { label: 'Brouillon',        color: 'bg-gray-100 text-gray-600' },
  refuse:      { label: 'Refusée',          color: 'bg-red-100 text-red-700' },
  // hr.loan / hr.advance
  hrbp:        { label: 'Validation HRBP',  color: 'bg-orange-100 text-orange-700' },
  resp:        { label: 'Validation Resp.', color: 'bg-orange-100 text-orange-700' },
  drh:         { label: 'Validation DRH',   color: 'bg-orange-100 text-orange-700' },
  dg:          { label: 'Validation DG',    color: 'bg-orange-100 text-orange-700' },
  valid:       { label: 'Validée',          color: 'bg-green-100 text-green-700' },
  // training.request
  waiting:     { label: 'En attente',       color: 'bg-blue-100 text-blue-700' },
  approved:    { label: 'Approuvée',        color: 'bg-green-100 text-green-700' },
  rejected:    { label: 'Rejetée',          color: 'bg-red-100 text-red-700' },
  // editing.request
  'to approve': { label: 'À approuver',     color: 'bg-blue-100 text-blue-700' },
  approve:     { label: 'Approuvée',        color: 'bg-green-100 text-green-700' },
  done:        { label: 'Effectuée',        color: 'bg-green-100 text-green-700' },
  // document.request
  download:    { label: 'Disponible',       color: 'bg-green-100 text-green-700' },
}

export type SirhTab = 'loans' | 'advances' | 'training' | 'editing' | 'documents'
