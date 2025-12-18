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
import { CheckCircle2, XCircle, RotateCcw, ClipboardCheck, ChevronRight, ChevronLeft } from "lucide-react"

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
  // --- Questions existantes (Interdictions Générales & Vidéos) ---
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
  },
  // --- NOUVELLES QUESTIONS ENRICHIES ---
  // --- Source: Note d'information Cigarettes/Stupéfiants 2025 ---
  {
    "source": "Note d'Info (Addictions)",
    "question": "Quelle est la règle concernant l'utilisation des cigarettes électroniques sur le site de la SAR ?",
    "options": [
      "Autorisée partout car il n'y a pas de combustion.",
      "Autorisée uniquement dans les bureaux individuels.",
      "Autorisée uniquement dans les zones dédiées (coins fumeurs).",
      "Strictement interdite sur l'ensemble du site."
    ],
    "answer": "Autorisée uniquement dans les zones dédiées (coins fumeurs).",
    "explanation": "L'utilisation de cigarettes électroniques est soumise aux mêmes restrictions que le tabac classique et n'est permise que dans les coins fumeurs."
  },
  {
    "source": "Note d'Info (Addictions)",
    "question": "Quelles sont les conséquences prévues en cas de consommation de stupéfiants (ex: chanvre indien) ou d'alcool à la SAR ?",
    "options": [
      "Un simple rappel à l'ordre.",
      "Une amende forfaitaire.",
      "Des sanctions disciplinaires pouvant aller jusqu'à l'exclusion définitive et des poursuites.",
      "Une mise à pied de 24 heures."
    ],
    "answer": "Des sanctions disciplinaires pouvant aller jusqu'à l'exclusion définitive et des poursuites.",
    "explanation": "La note d'information stipule que tout contrevenant s'expose à l'exclusion définitive et à d'éventuelles poursuites judiciaires."
  },
  // --- Source: Flash Info Risques Électriques ---
  {
    "source": "Flash Info (Électricité)",
    "question": "Selon le flash info sécurité, quelle est la différence entre électrisation et électrocution ?",
    "options": [
      "L'électrocution désigne uniquement les accidents à haute tension.",
      "L'électrisation est plus grave que l'électrocution.",
      "L'électrocution entraîne la mort, tandis que l'électrisation est une blessure.",
      "Ces deux termes sont synonymes."
    ],
    "answer": "L'électrocution entraîne la mort, tandis que l'électrisation est une blessure.",
    "explanation": "Une électrisation peut être plus ou moins grave (brûlure, troubles cardiaques), alors que le terme électrocution signifie la mort par courant électrique."
  },
  {
    "source": "Flash Info (Électricité)",
    "question": "À partir de quelle intensité le courant électrique présente-t-il un danger pour l'homme selon le Flash Info ?",
    "options": [
      "1 Ampère",
      "5 mA (milliampères)",
      "50 mA (milliampères)",
      "220 Volts"
    ],
    "answer": "5 mA (milliampères)",
    "explanation": "Le danger commence dès 5 mA, et la gravité dépend ensuite de la durée, du trajet du courant et de l'état de la peau."
  },
  {
    "source": "Flash Info (Électricité)",
    "question": "Est-il obligatoire pour un travailleur d'avoir une habilitation pour opérer à proximité d'une installation électrique ?",
    "options": [
      "Non, seule la présence d'un électricien est requise.",
      "Oui, l'habilitation est obligatoire pour réaliser des opérations sur ou à proximité d'installations.",
      "Non, si le travailleur porte des gants isolants.",
      "Seulement pour les travaux sous tension."
    ],
    "answer": "Oui, l'habilitation est obligatoire pour réaliser des opérations sur ou à proximité d'installations.",
    "explanation": "Former le personnel est une mesure de prévention clé : l'habilitation est obligatoire pour toute opération proche de l'électricité."
  },
  // --- Source: Fiche Sensibilisation FVR (Fièvre Vallée du Rift) ---
  {
    "source": "Sensibilisation FVR",
    "question": "Comment la Fièvre de la Vallée du Rift (FVR) se transmet-elle principalement de l'animal à l'homme ?",
    "options": [
      "Par l'inhalation de poussières.",
      "Par contact direct avec des animaux infectés, leurs liquides ou par piqûres de moustiques.",
      "Par la consommation d'eau potable.",
      "Par simple proximité sans contact."
    ],
    "answer": "Par contact direct avec des animaux infectés, leurs liquides ou par piqûres de moustiques.",
    "explanation": "La transmission se fait lors de la manipulation de viande, de sang, de liquides biologiques d'animaux malades, ou par vecteurs (moustiques)."
  },
  {
    "source": "Sensibilisation FVR",
    "question": "Quelle mesure de prévention alimentaire est cruciale pour se protéger de la FVR ?",
    "options": [
      "Congeler la viande avant consommation.",
      "Laver la viande à l'eau de Javel.",
      "Bien cuire la viande et faire bouillir le lait cru.",
      "Ne manger que des légumes."
    ],
    "answer": "Bien cuire la viande et faire bouillir le lait cru.",
    "explanation": "Il faut éviter tout contact avec le lait ou la viande crue provenant d'animaux malades, et impérativement les cuire/bouillir pour tuer le virus."
  },
  {
    "source": "Sensibilisation FVR",
    "question": "Quel symptôme chez l'animal doit alerter sur un cas potentiel de FVR ?",
    "options": [
      "Une prise de poids rapide.",
      "Une perte de poils localisée.",
      "Des avortements spontanés, faiblesse et écoulement nasal sanglant.",
      "Une agressivité anormale."
    ],
    "answer": "Des avortements spontanés, faiblesse et écoulement nasal sanglant.",
    "explanation": "Les avortements, les décès inattendus, le refus de s'alimenter et les écoulements nasaux sont des signes cliniques majeurs chez le bétail."
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

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelectedAnswer(answers[currentQuestion - 1] || null)
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
      <DialogContent className="w-[95vw] xs:w-[90vw] sm:w-[85vw] max-w-[calc(100vw-1rem)] xs:max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-white border-0 shadow-2xl p-2 xs:p-3 sm:p-4 md:p-6">
        <DialogHeader className="text-center pb-3 xs:pb-4 sm:pb-5 md:pb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="relative text-white p-3 xs:p-4 sm:p-5 md:p-6 rounded-xl xs:rounded-2xl shadow-xl" style={{ backgroundColor: "#344256" }}>
              <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 mb-1.5 xs:mb-2 flex-wrap">
                <div className="p-1 xs:p-1.5 sm:p-2 bg-white/20 rounded-full">
                  <ClipboardCheck className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </div>
                <DialogTitle className="text-sm xs:text-base sm:text-lg md:text-2xl lg:text-3xl font-bold leading-tight px-1">
                  {showResult ? "Résultats du Questionnaire" : "Questionnaire de Sécurité SAR"}
                </DialogTitle>
              </div>
              <DialogDescription className="text-white/80 text-xs xs:text-sm sm:text-base md:text-lg mt-1 xs:mt-1.5">
                {showResult ? "Voici vos résultats détaillés" : `Question ${currentQuestion + 1} sur ${selectedQuestions.length}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!showResult && currentQ ? (
          <div className="space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 py-3 xs:py-4 sm:py-5 md:py-6">
            {/* Barre de progression - Responsive */}
            <div className="w-full bg-slate-200 rounded-full h-1 xs:h-1.5 sm:h-2 mb-3 xs:mb-4 sm:mb-5 md:mb-6">
              <div 
                className="h-1 xs:h-1.5 sm:h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${((currentQuestion + 1) / selectedQuestions.length) * 100}%`,
                  backgroundColor: "#344256"
                }}
              />
            </div>

            {/* Source de la question - Responsive */}
            <div className="rounded-lg xs:rounded-xl p-2.5 xs:p-3 sm:p-4 shadow-sm" style={{ backgroundColor: "#344256", color: "white" }}>
              <div className="flex items-center gap-1.5 xs:gap-2">
                <div className="w-1 h-1 xs:w-1.5 xs:h-1.5 sm:w-2 sm:h-2 bg-white rounded-full flex-shrink-0"></div>
                <p className="text-[10px] xs:text-xs sm:text-sm font-semibold break-words">
                  Source : {currentQ.source}
                </p>
              </div>
            </div>

            {/* Question - Responsive */}
            <div className="bg-white rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-slate-200">
              <h3 className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-slate-800 text-balance leading-relaxed mb-3 xs:mb-4 sm:mb-5 md:mb-6">
                {currentQ.question}
              </h3>

              <RadioGroup
                value={selectedAnswer || ""}
                onValueChange={setSelectedAnswer}
                className="space-y-1.5 xs:space-y-2 sm:space-y-2.5 md:space-y-3"
              >
                {currentQ.options.map((option, index) => (
                  <div
                    key={index}
                    className="group flex items-start xs:items-center space-x-2 xs:space-x-3 sm:space-x-4 p-2.5 xs:p-3 sm:p-4 md:p-5 rounded-lg xs:rounded-xl sm:hover:bg-gradient-to-r sm:hover:from-blue-50 sm:hover:to-indigo-50 transition-all duration-300 border border-slate-200 sm:hover:border-blue-300 sm:hover:shadow-md cursor-pointer active:bg-blue-50 touch-manipulation"
                  >
                    <RadioGroupItem 
                      value={option} 
                      id={`option-${index}`}
                      className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 border-2 border-slate-300 sm:group-hover:border-slate-500 flex-shrink-0 mt-0.5 xs:mt-0"
                      style={{ color: "#344256" }}
                    />
                    <Label
                      htmlFor={`option-${index}`}
                      className="flex-1 cursor-pointer text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed text-slate-700 sm:group-hover:text-slate-800 font-medium break-words"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        ) : showResult ? (
          <div className="space-y-3 xs:space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 py-3 xs:py-4 sm:py-5 md:py-6">
            {/* Résultats principaux - Responsive */}
            <div className="text-center bg-gradient-to-br from-white to-slate-50 rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-slate-200">
              <div className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-8xl mb-3 xs:mb-4 sm:mb-5 md:mb-6">
                {getEmotionEmoji(score)}
              </div>
              <h3 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-2 xs:mb-3 sm:mb-4">
                {score} / 10
              </h3>
              <p className="text-slate-600 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed mb-4 xs:mb-5 sm:mb-6 md:mb-8 px-2">
                {getEncouragementMessage(score)}
              </p>
              
              {/* Barre de score visuelle - Responsive */}
              <div className="w-full bg-slate-200 rounded-full h-2 xs:h-2.5 sm:h-3 md:h-4 mb-3 xs:mb-4 sm:mb-5 md:mb-6">
                <div 
                  className={`h-2 xs:h-2.5 sm:h-3 md:h-4 rounded-full transition-all duration-1000 ease-out ${
                    score >= 8 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                    score >= 6 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-red-500 to-red-600'
                  }`}
                  style={{ width: `${(score / 10) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Détail des réponses - Responsive */}
            <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-5 md:p-6 shadow-lg">
              <h4 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-slate-800 mb-3 xs:mb-4 sm:mb-5 md:mb-6 flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
                <ClipboardCheck className="h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0" />
                <span>Détail des réponses</span>
              </h4>
              <div className="space-y-2.5 xs:space-y-3 sm:space-y-3.5 md:space-y-4">
                {selectedQuestions.map((question, qIndex) => {
                  const userAnswer = answers[qIndex]
                  const correct = isCorrect[qIndex]
                  return (
                    <div
                      key={qIndex}
                      className={`p-2.5 xs:p-3 sm:p-4 md:p-5 lg:p-6 rounded-lg xs:rounded-xl border-2 transition-all duration-300 sm:hover:shadow-md ${
                        correct 
                          ? "border-green-200 bg-gradient-to-r from-green-50 to-green-100/50" 
                          : "border-red-200 bg-gradient-to-r from-red-50 to-red-100/50"
                      }`}
                    >
                      <div className="flex items-start gap-2 xs:gap-2.5 sm:gap-3 md:gap-4">
                        <div className={`p-1 xs:p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
                          correct ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {correct ? (
                            <CheckCircle2 className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" strokeWidth={2.5} />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-600" strokeWidth={2.5} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs xs:text-sm sm:text-base md:text-lg text-slate-800 mb-1.5 xs:mb-2">Question {qIndex + 1}</p>
                          <p className="text-slate-700 mb-2 xs:mb-2.5 sm:mb-3 md:mb-4 font-medium text-xs xs:text-sm sm:text-base break-words">{question.question}</p>
                          <div className="space-y-1.5 xs:space-y-2">
                            <p className="text-[10px] xs:text-xs sm:text-sm text-slate-600 break-words">
                              <span className="font-semibold">Votre réponse :</span> {userAnswer}
                            </p>
                            {!correct && (
                              <p className="text-[10px] xs:text-xs sm:text-sm text-green-700 font-medium break-words">
                                <span className="font-semibold">Bonne réponse :</span> {question.answer}
                              </p>
                            )}
                            <p className="text-[10px] xs:text-xs sm:text-sm text-slate-500 italic bg-slate-100 p-1.5 xs:p-2 sm:p-2.5 md:p-3 rounded-lg break-words">
                              <span className="font-semibold">Explication :</span> {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 pt-3 xs:pt-4 sm:pt-5 md:pt-6 flex-col xs:flex-row flex-wrap">
          {!showResult ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleClose} 
                className="font-semibold px-3 py-1.5 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 border-2 border-slate-300 sm:hover:border-slate-400 sm:hover:bg-slate-50 active:bg-slate-100 transition-all duration-300 text-xs xs:text-sm sm:text-base w-full xs:w-auto touch-manipulation"
              >
                Annuler
              </Button>
              
              {currentQuestion > 0 && (
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  className="font-semibold px-3 py-1.5 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 border-2 text-slate-600 sm:hover:bg-slate-50 active:bg-slate-100 transition-all duration-300 flex items-center justify-center gap-1.5 xs:gap-2 text-xs xs:text-sm sm:text-base w-full xs:w-auto touch-manipulation"
                >
                  <ChevronLeft className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                  Précédent
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className="text-white font-semibold px-3 py-1.5 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 shadow-lg sm:hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-1.5 xs:gap-2 text-xs xs:text-sm sm:text-base w-full xs:w-auto touch-manipulation"
                style={{ backgroundColor: "#344256" }}
                onMouseEnter={(e) => {
                  if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                    e.currentTarget.style.backgroundColor = "#2a3441"
                  }
                }}
                onMouseLeave={(e) => {
                  if (typeof window !== 'undefined' && window.innerWidth >= 640) {
                    e.currentTarget.style.backgroundColor = "#344256"
                  }
                }}
              >
                {currentQuestion < selectedQuestions.length - 1 ? (
                  <>
                    Suivant
                    <ChevronRight className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                  </>
                ) : (
                  <>
                    Terminer
                    <CheckCircle2 className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="font-semibold px-3 py-1.5 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 border-2 border-blue-300 text-blue-600 sm:hover:bg-blue-50 sm:hover:border-blue-400 active:bg-blue-100 transition-all duration-300 flex items-center justify-center gap-1.5 xs:gap-2 text-xs xs:text-sm sm:text-base w-full xs:w-auto touch-manipulation"
              >
                <RotateCcw className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                Nouveau Quiz
              </Button>
              <Button
                onClick={handleClose}
                className="bg-gradient-to-r from-green-600 to-green-700 sm:hover:from-green-700 sm:hover:to-green-800 text-white font-semibold px-3 py-1.5 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 shadow-lg sm:hover:shadow-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-1.5 xs:gap-2 text-xs xs:text-sm sm:text-base w-full xs:w-auto touch-manipulation"
              >
                <CheckCircle2 className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4" />
                Fermer
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
