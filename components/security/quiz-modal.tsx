"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle2, XCircle, RotateCcw, ClipboardCheck,
  ChevronRight, ChevronLeft, Plus, Pencil, Trash2,
  Settings, X, GripVertical,
} from "lucide-react"
import { useQuiz, QuizQuestion, QuizOption, QuizQuestionInput } from "@/hooks/useQuiz"
import { useConfirm } from "@/components/ui/confirm-dialog"
import { useAuth } from "@/hooks/useAuth"

interface QuizModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getEmotionEmoji(score: number): string {
  if (score >= 9) return "🎉"
  if (score >= 7) return "😊"
  if (score >= 5) return "😐"
  if (score >= 3) return "😕"
  return "😢"
}

function getEncouragementMessage(score: number): string {
  if (score >= 9) return "Excellent ! Vous maîtrisez parfaitement les règles de sécurité de la SAR."
  if (score >= 7) return "Très bien ! Vous avez une bonne connaissance des procédures de sécurité."
  if (score >= 5) return "Correct. Nous vous recommandons de revoir certains points de sécurité."
  if (score >= 3) return "Attention. Il est important de mieux connaître les règles de sécurité."
  return "Nécessite une formation complète. Veuillez revoir toutes les vidéos de sécurité."
}

// ── Formulaire d'édition d'une question ─────────────────────────────────────

interface QuestionFormData {
  question: string
  source: string
  explanation: string
  order: number
  is_active: boolean
  options: { text: string; is_correct: boolean; order: number }[]
}

const emptyForm = (): QuestionFormData => ({
  question: '',
  source: '',
  explanation: '',
  order: 0,
  is_active: true,
  options: [
    { text: '', is_correct: false, order: 0 },
    { text: '', is_correct: false, order: 1 },
    { text: '', is_correct: false, order: 2 },
    { text: '', is_correct: false, order: 3 },
  ],
})

function QuestionEditor({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: QuestionFormData
  onSave: (data: QuestionFormData) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<QuestionFormData>(initial)
  const [formError, setFormError] = useState('')

  const setOption = (i: number, field: 'text' | 'is_correct', value: string | boolean) => {
    setForm(f => {
      const opts = [...f.options]
      if (field === 'is_correct') {
        // une seule bonne réponse
        opts.forEach((o, idx) => { opts[idx] = { ...o, is_correct: idx === i } })
      } else {
        opts[i] = { ...opts[i], [field]: value }
      }
      return { ...f, options: opts }
    })
  }

  const addOption = () => {
    setForm(f => ({
      ...f,
      options: [...f.options, { text: '', is_correct: false, order: f.options.length }],
    }))
  }

  const removeOption = (i: number) => {
    setForm(f => ({ ...f, options: f.options.filter((_, idx) => idx !== i) }))
  }

  const handleSave = () => {
    if (!form.question.trim()) { setFormError('La question est requise.'); return }
    if (form.options.length < 2) { setFormError('Au moins 2 options sont requises.'); return }
    if (!form.options.some(o => o.is_correct)) { setFormError('Cochez la bonne réponse.'); return }
    if (form.options.some(o => !o.text.trim())) { setFormError('Toutes les options doivent avoir un texte.'); return }
    setFormError('')
    onSave({ ...form, options: form.options.map((o, i) => ({ ...o, order: i })) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Question *</Label>
        <Textarea
          value={form.question}
          onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
          rows={3}
          placeholder="Saisissez la question..."
          className="resize-none text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Source</Label>
          <Input
            value={form.source}
            onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
            placeholder="Ex: Vidéo de sécurité"
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ordre</Label>
          <Input
            type="number"
            value={form.order}
            onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))}
            className="text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Explication (après réponse)</Label>
        <Textarea
          value={form.explanation}
          onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
          rows={2}
          placeholder="Explication de la bonne réponse..."
          className="resize-none text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Options de réponse *</Label>
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="h-3 w-3" /> Ajouter
          </button>
        </div>
        {form.options.map((opt, i) => (
          <div key={i} className="flex items-start gap-2">
            <button
              type="button"
              title="Bonne réponse"
              onClick={() => setOption(i, 'is_correct', true)}
              className={`mt-2.5 flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors ${
                opt.is_correct
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            />
            <Input
              value={opt.text}
              onChange={e => setOption(i, 'text', e.target.value)}
              placeholder={`Option ${i + 1}`}
              className={`text-sm flex-1 ${opt.is_correct ? 'border-green-400 bg-green-50' : ''}`}
            />
            {form.options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="mt-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <p className="text-xs text-gray-400">Cliquez sur le cercle pour marquer la bonne réponse.</p>
      </div>

      {formError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
      )}

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving} className="flex-1">
          Annuler
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  )
}

// ── Vue administration des questions ────────────────────────────────────────

function AdminPanel({
  questions,
  onCreateQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: {
  questions: QuizQuestion[]
  onCreateQuestion: (data: QuestionFormData) => Promise<void>
  onUpdateQuestion: (id: number, data: QuestionFormData) => Promise<void>
  onDeleteQuestion: (id: number) => Promise<void>
}) {
  const confirm = useConfirm()
  const [mode, setMode] = useState<'list' | 'create' | 'edit'>('list')
  const [editTarget, setEditTarget] = useState<QuizQuestion | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleSave = async (data: QuestionFormData) => {
    setSaving(true)
    try {
      if (mode === 'edit' && editTarget) {
        await onUpdateQuestion(editTarget.id, data)
      } else {
        await onCreateQuestion(data)
      }
      setMode('list')
      setEditTarget(null)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (q: QuizQuestion) => {
    setEditTarget(q)
    setMode('edit')
  }

  const handleDelete = async (id: number) => {
    if (!await confirm({ message: 'Supprimer cette question ?', title: 'Supprimer la question' })) return
    setDeletingId(id)
    try { await onDeleteQuestion(id) } finally { setDeletingId(null) }
  }

  const initialForEdit = (): QuestionFormData => {
    if (!editTarget) return emptyForm()
    return {
      question: editTarget.question,
      source: editTarget.source,
      explanation: editTarget.explanation,
      order: editTarget.order,
      is_active: editTarget.is_active,
      options: editTarget.options.map(o => ({ text: o.text, is_correct: o.is_correct, order: o.order })),
    }
  }

  if (mode === 'create' || mode === 'edit') {
    return (
      <div>
        <button
          onClick={() => { setMode('list'); setEditTarget(null) }}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="h-3 w-3" />
          Retour à la liste
        </button>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">
          {mode === 'create' ? 'Nouvelle question' : 'Modifier la question'}
        </h3>
        <QuestionEditor
          initial={mode === 'edit' ? initialForEdit() : emptyForm()}
          onSave={handleSave}
          onCancel={() => { setMode('list'); setEditTarget(null) }}
          saving={saving}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{questions.length} question(s) au total</p>
        <Button size="sm" onClick={() => setMode('create')}>
          <Plus className="h-4 w-4 mr-1" /> Nouvelle question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          Aucune question. Cliquez sur "Nouvelle question" pour commencer.
        </div>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                q.is_active ? 'bg-white border-gray-200' : 'bg-gray-50 border-dashed border-gray-300 opacity-60'
              }`}
            >
              <span className="flex-shrink-0 text-xs font-bold text-gray-400 mt-0.5 w-5 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{q.question}</p>
                {q.source && <p className="text-xs text-gray-400 mt-0.5">{q.source}</p>}
                <p className="text-xs text-gray-400 mt-0.5">{q.options.length} option(s) · {q.options.filter(o => o.is_correct).length} bonne(s)</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => handleEdit(q)}
                  className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Modifier"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  disabled={deletingId === q.id}
                  className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                  title="Supprimer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Modal principale ─────────────────────────────────────────────────────────

export function QuizModal({ open, onOpenChange }: QuizModalProps) {
  const { questions, loading, error, fetchQuestions, createQuestion, updateQuestion, deleteQuestion } = useQuiz()
  const { user } = useAuth()
  const isAdmin = !!(user?.is_superuser)

  const [tab, setTab] = useState<'quiz' | 'admin'>('quiz')

  // Quiz state
  const [selectedQuestions, setSelectedQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean[]>([])

  useEffect(() => {
    if (open && tab === 'quiz') {
      const active = questions.filter(q => q.is_active && q.options.length >= 2 && q.options.some(o => o.is_correct))
      const shuffled = shuffleArray(active)
      setSelectedQuestions(shuffled.slice(0, 10))
      setCurrentQuestion(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setScore(0)
      setAnswers([])
      setIsCorrect([])
    }
  }, [open, tab, questions])

  const handleNext = () => {
    if (selectedAnswer === null) return
    const q = selectedQuestions[currentQuestion]
    const correct = q.options[selectedAnswer]?.is_correct ?? false
    const newAnswers = [...answers, selectedAnswer]
    const newIsCorrect = [...isCorrect, correct]
    setAnswers(newAnswers)
    setIsCorrect(newIsCorrect)
    if (correct) setScore(s => s + 1)
    if (currentQuestion < selectedQuestions.length - 1) {
      setCurrentQuestion(c => c + 1)
      setSelectedAnswer(null)
    } else {
      setShowResult(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(c => c - 1)
      setSelectedAnswer(answers[currentQuestion - 1] ?? null)
    }
  }

  const handleReset = () => {
    const active = questions.filter(q => q.is_active && q.options.length >= 2 && q.options.some(o => o.is_correct))
    setSelectedQuestions(shuffleArray(active).slice(0, 10))
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswers([])
    setIsCorrect([])
  }

  const currentQ = selectedQuestions[currentQuestion]

  const handleAdminCreate = async (data: any) => {
    await createQuestion(data as QuizQuestionInput)
    await fetchQuestions()
  }

  const handleAdminUpdate = async (id: number, data: any) => {
    await updateQuestion(id, data as Partial<QuizQuestionInput>)
    await fetchQuestions()
  }

  const handleAdminDelete = async (id: number) => {
    await deleteQuestion(id)
    await fetchQuestions()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] xs:w-[95vw] sm:w-[95vw] max-w-[calc(100vw-1rem)] xs:max-w-[95vw] sm:max-w-[95vw] md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-white border-0 shadow-2xl p-2 xs:p-3 sm:p-6 md:p-6">

        {/* Header */}
        <DialogHeader className="text-center pb-3 xs:pb-4">
          <div className="relative text-white p-3 xs:p-4 sm:p-5 rounded-xl xs:rounded-2xl shadow-xl" style={{ backgroundColor: "#344256" }}>
            <div className="flex items-center justify-center gap-2 mb-1 flex-wrap">
              <div className="p-1 xs:p-1.5 bg-white/20 rounded-full">
                <ClipboardCheck className="h-4 w-4 xs:h-5 xs:w-5" />
              </div>
              <DialogTitle className="text-sm xs:text-base sm:text-lg md:text-2xl font-bold leading-tight">
                {tab === 'admin' ? 'Gestion des questions' : showResult ? 'Résultats du Questionnaire' : 'Questionnaire de Sécurité SAR'}
              </DialogTitle>
              {isAdmin && (
                <button
                  onClick={() => setTab(t => t === 'admin' ? 'quiz' : 'admin')}
                  className="ml-auto p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                  title={tab === 'admin' ? 'Voir le quiz' : 'Gérer les questions'}
                >
                  {tab === 'admin' ? <ClipboardCheck className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
                </button>
              )}
            </div>
            <DialogDescription className="text-white/80 text-xs xs:text-sm mt-1">
              {tab === 'admin'
                ? 'Ajouter, modifier ou supprimer des questions'
                : showResult
                  ? 'Voici vos résultats détaillés'
                  : loading
                    ? 'Chargement des questions...'
                    : `Question ${currentQuestion + 1} sur ${selectedQuestions.length}`
              }
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Contenu admin */}
        {tab === 'admin' && (
          <div className="py-2">
            <AdminPanel
              questions={questions}
              onCreateQuestion={handleAdminCreate}
              onUpdateQuestion={handleAdminUpdate}
              onDeleteQuestion={handleAdminDelete}
            />
          </div>
        )}

        {/* Contenu quiz */}
        {tab === 'quiz' && (
          <>
            {loading && (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            )}

            {!loading && error && (
              <div className="text-center py-10 text-red-500 text-sm">{error}</div>
            )}

            {!loading && !error && selectedQuestions.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">
                Aucune question disponible.
                {isAdmin && ' Ajoutez des questions via l\'onglet de gestion.'}
              </div>
            )}

            {!loading && !error && !showResult && currentQ && (
              <div className="space-y-4 py-3 xs:py-4">
                {/* Barre de progression */}
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestion + 1) / selectedQuestions.length) * 100}%`, backgroundColor: "#344256" }}
                  />
                </div>

                {currentQ.source && (
                  <div className="rounded-lg p-2.5 text-xs font-semibold text-white flex items-center gap-2" style={{ backgroundColor: "#344256" }}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full flex-shrink-0" />
                    Source : {currentQ.source}
                  </div>
                )}

                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200">
                  <h3 className="text-sm xs:text-base sm:text-lg font-bold text-slate-800 leading-relaxed mb-4">
                    {currentQ.question}
                  </h3>
                  <RadioGroup
                    value={selectedAnswer !== null ? String(selectedAnswer) : ""}
                    onValueChange={v => setSelectedAnswer(parseInt(v))}
                    className="space-y-2"
                  >
                    {currentQ.options.map((option, index) => (
                      <div
                        key={option.id}
                        className="group flex items-start xs:items-center space-x-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer"
                      >
                        <RadioGroupItem
                          value={String(index)}
                          id={`option-${index}`}
                          className="w-4 h-4 border-2 border-slate-300 flex-shrink-0 mt-0.5 xs:mt-0"
                          style={{ color: "#344256" }}
                        />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm text-slate-700 font-medium">
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            )}

            {!loading && !error && showResult && (
              <div className="space-y-4 py-3 xs:py-4">
                <div className="text-center bg-white rounded-xl p-6 shadow-lg border border-slate-200">
                  <div className="text-5xl mb-4">{getEmotionEmoji(score)}</div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">{score} / {selectedQuestions.length}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{getEncouragementMessage(score)}</p>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${score >= 8 ? 'bg-green-500' : score >= 6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${(score / selectedQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-lg border border-slate-200">
                  <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" /> Détail des réponses
                  </h4>
                  <div className="space-y-3">
                    {selectedQuestions.map((q, qi) => {
                      const correct = isCorrect[qi]
                      const chosenIndex = answers[qi]
                      const correctOption = q.options.find(o => o.is_correct)
                      return (
                        <div key={q.id} className={`p-3 rounded-xl border-2 ${correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                          <div className="flex items-start gap-3">
                            <div className={`p-1.5 rounded-full flex-shrink-0 ${correct ? 'bg-green-100' : 'bg-red-100'}`}>
                              {correct
                                ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                                : <XCircle className="h-4 w-4 text-red-600" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-slate-800 mb-1">Question {qi + 1}</p>
                              <p className="text-slate-700 text-xs mb-2 font-medium">{q.question}</p>
                              <p className="text-xs text-slate-600">
                                <span className="font-semibold">Votre réponse :</span>{' '}
                                {chosenIndex !== undefined ? q.options[chosenIndex]?.text : '—'}
                              </p>
                              {!correct && correctOption && (
                                <p className="text-xs text-green-700 font-medium mt-0.5">
                                  <span className="font-semibold">Bonne réponse :</span> {correctOption.text}
                                </p>
                              )}
                              {q.explanation && (
                                <p className="text-xs text-slate-500 italic bg-slate-100 p-2 rounded-lg mt-1">
                                  <span className="font-semibold">Explication :</span> {q.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Footer quiz */}
            {!loading && !error && selectedQuestions.length > 0 && (
              <DialogFooter className="gap-2 pt-3 flex-col xs:flex-row flex-wrap">
                {!showResult ? (
                  <>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full xs:w-auto text-xs xs:text-sm">
                      Annuler
                    </Button>
                    {currentQuestion > 0 && (
                      <Button variant="outline" onClick={handlePrevious} className="w-full xs:w-auto text-xs xs:text-sm">
                        <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Précédent
                      </Button>
                    )}
                    <Button
                      onClick={handleNext}
                      disabled={selectedAnswer === null}
                      style={{ backgroundColor: "#344256" }}
                      className="text-white w-full xs:w-auto text-xs xs:text-sm"
                    >
                      {currentQuestion < selectedQuestions.length - 1 ? (
                        <>Suivant <ChevronRight className="h-3.5 w-3.5 ml-1" /></>
                      ) : (
                        <>Terminer <CheckCircle2 className="h-3.5 w-3.5 ml-1" /></>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handleReset} className="w-full xs:w-auto text-xs xs:text-sm text-blue-600 border-blue-300 hover:bg-blue-50">
                      <RotateCcw className="h-3.5 w-3.5 mr-1" /> Nouveau Quiz
                    </Button>
                    <Button onClick={() => onOpenChange(false)} className="bg-green-600 hover:bg-green-700 text-white w-full xs:w-auto text-xs xs:text-sm">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Fermer
                    </Button>
                  </>
                )}
              </DialogFooter>
            )}
          </>
        )}

      </DialogContent>
    </Dialog>
  )
}
