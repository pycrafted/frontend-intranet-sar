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
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react"

interface QuizModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Question {
  source: string
  question: string
  options: string[]
  answer: string
  explanation: string
}

const allQuestions: Question[] = [
  {
    "source": "Affiche des interdictions",
    "question": "Quel est l'objectif principal de l'ensemble des interdictions affichées sur le site de la SAR ?",
    "options": [
      "Améliorer le confort des employés.",
      "Prévenir les accidents en maîtrisant les risques dans un environnement dangereux.",
      "Réduire les coûts de maintenance.",
      "Se conformer à une obligation légale sans impact direct."
    ],
    "answer": "Prévenir les accidents en maîtrisant les risques dans un environnement dangereux.",
    "explanation": "Toutes ces règles visent à garantir la sécurité, la santé et la protection de l'environnement dans une raffinerie, un site à haut risque."
  },
  {
    "source": "Affiche des interdictions",
    "question": "Pour quelle raison de sécurité l'alcool et le cannabis sont-ils formellement interdits sur le site ?",
    "options": [
      "Pour des raisons de productivité uniquement.",
      "Parce qu'ils altèrent le jugement et les réflexes, ce qui est incompatible avec la sécurité.",
      "Pour des raisons d'image de l'entreprise.",
      "Parce que leur odeur peut masquer celle d'une fuite de gaz."
    ],
    "answer": "Parce qu'ils altèrent le jugement et les réflexes, ce qui est incompatible avec la sécurité.",
    "explanation": "Une politique de tolérance zéro est appliquée car ces substances compromettent gravement la vigilance et la capacité à réagir en cas de danger."
  },
  {
    "source": "Affiche des interdictions",
    "question": "Parmi les interdictions générales, laquelle fait l'objet d'une exception dans une zone spécifiquement désignée ?",
    "options": [
      "L'usage du téléphone portable",
      "Le port d'objets tranchants",
      "L'usage du tabac",
      "La présence d'animaux"
    ],
    "answer": "L'usage du tabac",
    "explanation": "Il est interdit de fumer partout sur le site, à l'exception de l'espace fumeurs balisé et sécurisé pour éviter tout risque d'ignition en zone ATEX."
  },
  {
    "source": "Affiche des interdictions",
    "question": "Pourquoi les téléphones portables et les montres connectées sont-ils interdits hors des zones autorisées ?",
    "options": [
      "Pour éviter les distractions.",
      "En raison du risque d'explosion qu'ils peuvent causer par étincelle.",
      "Pour prévenir les vols.",
      "Pour ne pas perturber les communications radio."
    ],
    "answer": "En raison du risque d'explosion qu'ils peuvent causer par étincelle.",
    "explanation": "Ces appareils électroniques non certifiés ATEX peuvent générer des étincelles capables d'enflammer les vapeurs de gaz ou d'hydrocarbures présentes sur le site."
  },
  {
    "source": "Affiche des interdictions",
    "question": "Pour quelle raison l'utilisation d'écouteurs ou de casques audio est-elle strictement interdite ?",
    "options": [
      "Car ils peuvent tomber dans les machines.",
      "Car ils isolent l'utilisateur des bruits ambiants, des alarmes et des signaux d'alerte.",
      "Car ils consomment de l'électricité.",
      "Car ils sont considérés comme une source d'ignition."
    ],
    "answer": "Car ils isolent l'utilisateur des bruits ambiants, des alarmes et des signaux d'alerte.",
    "explanation": "La perception auditive de l'environnement est cruciale pour détecter un danger (fuite, alarme, véhicule) et garantir sa propre sécurité et celle des autres."
  },
  {
    "source": "Affiche des interdictions",
    "question": "Outre les briquets et allumettes, quel autre type d'objet est interdit car il représente une source d'ignition ?",
    "options": [
      "Les bouteilles d'eau en plastique",
      "Les produits inflammables personnels comme les aérosols ou solvants",
      "Les outils métalliques",
      "Les médicaments personnels"
    ],
    "answer": "Les produits inflammables personnels comme les aérosols ou solvants",
    "explanation": "Toute source potentielle de flamme ou d'inflammation est bannie pour éviter d'enflammer les vapeurs d'hydrocarbures."
  },
  {
    "source": "Vidéo institutionnelle",
    "question": "En quelle année la Société Africaine de Raffinage (SAR) a-t-elle été créée et par qui a-t-elle été inaugurée en 1964 ?",
    "options": [
      "Créée en 1960, inaugurée par Mamadou Dia",
      "Créée en 1961, inaugurée par Léopold Sédar Senghor",
      "Créée en 1964, inaugurée par Abdou Diouf",
      "Créée en 1958, inaugurée par Charles de Gaulle"
    ],
    "answer": "Créée en 1961, inaugurée par Léopold Sédar Senghor",
    "explanation": "La SAR a été fondée en 1961 et officiellement inaugurée le 27 janvier 1964 par le Président Léopold Sédar Senghor."
  },
  {
    "source": "Vidéo institutionnelle",
    "question": "Quelle est l'activité principale de la SAR ?",
    "options": [
      "La distribution de carburant en station-service",
      "Le stockage de gaz naturel pour l'export",
      "La transformation du pétrole brut en produits pétroliers finis",
      "L'exploration de nouveaux gisements de pétrole"
    ],
    "answer": "La transformation du pétrole brut en produits pétroliers finis",
    "explanation": "Le cœur de métier de la SAR est le raffinage, qui consiste à transformer le pétrole brut en produits comme le gaz butane, l'essence ou le fuel."
  },
  {
    "source": "Vidéo institutionnelle",
    "question": "Comment le pétrole brut est-il acheminé des navires pétroliers jusqu'au parc de stockage de la SAR ?",
    "options": [
      "Par de plus petits bateaux-citernes",
      "Par une flotte de camions-citernes",
      "Par une conduite sous-marine de six kilomètres",
      "Par un oléoduc terrestre depuis le port de Dakar"
    ],
    "answer": "Par une conduite sous-marine de six kilomètres",
    "explanation": "Les tankers déchargent au large de Gorée et le brut est transporté jusqu'à la raffinerie via un sea-line de 6 km."
  },
  {
    "source": "Vidéo institutionnelle",
    "question": "En 2005, quel investissement majeur a permis de moderniser le pilotage des unités de la raffinerie ?",
    "options": [
      "La construction de nouveaux réservoirs de stockage.",
      "L'achat d'une nouvelle flotte de camions.",
      "La mise en service d'une salle de contrôle centrale anti-explosion.",
      "Le remplacement complet de l'oléoduc sous-marin."
    ],
    "answer": "La mise en service d'une salle de contrôle centrale anti-explosion.",
    "explanation": "Un investissement de 5 milliards FCFA a permis de numériser le contrôle des opérations dans une salle sécurisée, marquant l'entrée dans l'ère numérique."
  },
  {
    "source": "Vidéo institutionnelle",
    "question": "Parmi les normes suivantes, laquelle atteste de la compétence technique du laboratoire de la SAR ?",
    "options": [
      "ISO 9001 (Qualité)",
      "ISO 14001 (Environnement)",
      "ISO 45001 (Santé et Sécurité au Travail)",
      "ISO 17025 (Accréditation des laboratoires)"
    ],
    "answer": "ISO 17025 (Accréditation des laboratoires)",
    "explanation": "En plus des certifications Qualité, Environnement et Sécurité, la SAR détient l'accréditation ISO 17025, qui reconnaît la fiabilité des analyses de son laboratoire."
  },
  {
    "source": "Vidéo de sécurité",
    "question": "Quelle est la priorité absolue qui guide toutes les opérations et décisions à la SAR ?",
    "options": [
      "La productivité et la rentabilité",
      "La rapidité des opérations",
      "La Sécurité, la Santé, la Sûreté et l'Environnement (SSSE)",
      "L'innovation technologique"
    ],
    "answer": "La Sécurité, la Santé, la Sûreté et l'Environnement (SSSE)",
    "explanation": "Les quatre piliers SSSE sont le fondement non négociable de la culture d'entreprise et priment sur toute autre considération."
  },
  {
    "source": "Vidéo de sécurité",
    "question": "À quelle fréquence des exercices pratiques sont-ils organisés à l'école de feu pour le personnel ?",
    "options": [
      "Une fois par an",
      "Chaque mois",
      "Chaque mardi",
      "Seulement avant un arrêt technique"
    ],
    "answer": "Chaque mardi",
    "explanation": "Des exercices hebdomadaires permettent de maintenir un haut niveau de préparation et de réactivité du personnel face au risque d'incendie."
  },
  {
    "source": "Vidéo de sécurité",
    "question": "Quelle est la procédure impérative à suivre immédiatement en cas d'accident du travail ?",
    "options": [
      "Finir sa tâche puis appeler son supérieur.",
      "Alerter immédiatement le service médical pour une prise en charge rapide.",
      "Demander l'avis de ses collègues avant d'agir.",
      "Attendre la fin de sa journée de travail pour se déclarer."
    ],
    "answer": "Alerter immédiatement le service médical pour une prise en charge rapide.",
    "explanation": "Toute blessure doit être signalée sans délai au service médical pour garantir une intervention et des soins appropriés, assurés par une ambulance et un médecin du travail."
  },
  {
    "source": "Transversal",
    "question": "Quelle devise résume le mieux la philosophie de la SAR en matière de gestion des risques ?",
    "options": [
      "« La productivité avant tout »",
      "« La sécurité, c'est d'abord la prévention »",
      "« Travailler plus pour gagner plus »",
      "« Le risque zéro n'existe pas, il faut l'accepter »"
    ],
    "answer": "« La sécurité, c'est d'abord la prévention »",
    "explanation": "Cette devise met l'accent sur l'anticipation et l'identification des dangers avant qu'ils ne se transforment en accidents."
  },
  {
    "source": "Transversal",
    "question": "Quelle certification est spécifiquement dédiée au management de la santé et de la sécurité au travail ?",
    "options": [
      "ISO 9001",
      "ISO 14001",
      "ISO 45001",
      "ISO 17025"
    ],
    "answer": "ISO 45001",
    "explanation": "La norme ISO 45001 établit les exigences pour un système de management visant à améliorer la sécurité et à réduire les risques pour la santé des travailleurs."
  },
  {
    "source": "Transversal",
    "question": "Quelle est l'étape de sécurité obligatoire pour tout stagiaire avant de commencer à travailler sur le site ?",
    "options": [
      "Signer son contrat de stage.",
      "Visionner des vidéos de sécurité et réussir le quiz de validation.",
      "Rencontrer le directeur du site.",
      "Faire une visite libre des installations."
    ],
    "answer": "Visionner des vidéos de sécurité et réussir le quiz de validation.",
    "explanation": "Cette procédure garantit que chaque personne accédant au site a bien compris et intégré les règles de sécurité fondamentales et les risques associés."
  }
]

// Fonction pour mélanger un tableau
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Fonction pour obtenir l'emoji d'émotion basé sur le score
function getEmotionEmoji(score: number): string {
  if (score >= 9) return "🎉" // Excellent
  if (score >= 7) return "😊" // Bien
  if (score >= 5) return "😐" // Moyen
  if (score >= 3) return "😕" // Pas bien
  return "😢" // Très mal
}

// Fonction pour obtenir le message d'encouragement
function getEncouragementMessage(score: number): string {
  if (score >= 9) return "Excellent ! Vous maîtrisez parfaitement les règles de sécurité de la SAR."
  if (score >= 7) return "Très bien ! Vous avez une bonne connaissance des procédures de sécurité."
  if (score >= 5) return "Correct. Nous vous recommandons de revoir certains points de sécurité."
  if (score >= 3) return "Attention. Il est important de mieux connaître les règles de sécurité."
  return "Nécessite une formation complète. Veuillez revoir toutes les vidéos de sécurité."
}

export function QuizModal({ open, onOpenChange }: QuizModalProps) {
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [isCorrect, setIsCorrect] = useState<boolean[]>([])

  // Sélectionner 10 questions aléatoires au début
  useEffect(() => {
    if (open) {
      const shuffled = shuffleArray(allQuestions)
      setSelectedQuestions(shuffled.slice(0, 10))
      setCurrentQuestion(0)
      setSelectedAnswer(null)
      setShowResult(false)
      setScore(0)
      setAnswers([])
      setIsCorrect([])
    }
  }, [open])

  const handleNext = () => {
    if (selectedAnswer !== null && selectedQuestions[currentQuestion]) {
      const question = selectedQuestions[currentQuestion]
      const correct = selectedAnswer === question.answer
      
      const newAnswers = [...answers, selectedAnswer]
      const newIsCorrect = [...isCorrect, correct]
      
      setAnswers(newAnswers)
      setIsCorrect(newIsCorrect)
      
      if (correct) {
        setScore(score + 1)
      }

      if (currentQuestion < selectedQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        setShowResult(true)
      }
    }
  }

  const handleReset = () => {
    const shuffled = shuffleArray(allQuestions)
    setSelectedQuestions(shuffled.slice(0, 10))
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnswers([])
    setIsCorrect([])
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const currentQ = selectedQuestions[currentQuestion]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-slate-800">
            {showResult ? "Résultats du Questionnaire" : "Questionnaire de Sécurité SAR"}
          </DialogTitle>
          <DialogDescription className="text-base text-slate-600">
            {showResult ? "Voici vos résultats" : `Question ${currentQuestion + 1} sur ${selectedQuestions.length}`}
          </DialogDescription>
        </DialogHeader>

        {!showResult && currentQ ? (
          <div className="space-y-8 py-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 font-medium">
                Source : {currentQ.source}
              </p>
            </div>

            <h3 className="text-xl font-semibold text-foreground text-balance leading-relaxed">
              {currentQ.question}
            </h3>

            <RadioGroup
              value={selectedAnswer || ""}
              onValueChange={setSelectedAnswer}
            >
              {currentQ.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent hover:border-slate-200"
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer text-base leading-relaxed text-slate-700"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ) : showResult ? (
          <div className="space-y-8 py-6">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {getEmotionEmoji(score)}
              </div>
              <h3 className="text-4xl font-bold text-slate-800 mb-3">
                {score} / 10
              </h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {getEncouragementMessage(score)}
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-slate-800 mb-3">Détail des réponses :</h4>
                <div className="space-y-4">
                  {selectedQuestions.map((question, qIndex) => {
                    const userAnswer = answers[qIndex]
                    const correct = isCorrect[qIndex]
                    return (
                      <div
                        key={qIndex}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          correct ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {correct ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-slate-800 mb-1">Question {qIndex + 1}</p>
                            <p className="text-sm text-slate-600 mb-2">{question.question}</p>
                            <p className="text-xs text-slate-500 mb-1">
                              <strong>Votre réponse :</strong> {userAnswer}
                            </p>
                            {!correct && (
                              <p className="text-xs text-green-600 mb-1">
                                <strong>Bonne réponse :</strong> {question.answer}
                              </p>
                            )}
                            <p className="text-xs text-slate-500 italic">
                              <strong>Explication :</strong> {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-3">
          {!showResult ? (
            <>
              <Button variant="outline" onClick={handleClose} className="font-medium bg-transparent">
                Annuler
              </Button>
              <Button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="bg-primary hover:bg-primary/90 font-medium shadow-md hover:shadow-lg transition-all"
              >
                {currentQuestion < selectedQuestions.length - 1 ? "Suivant" : "Terminer"}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="font-medium bg-transparent flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Nouveau Quiz
              </Button>
              <Button
                onClick={handleClose}
                className="bg-primary hover:bg-primary/90 font-medium shadow-md hover:shadow-lg transition-all"
              >
                Fermer
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}