"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Shield,
  Users,
  BarChart3,
  Settings,
  Zap,
  Globe,
  ChevronLeft,
  ChevronRight,
  Factory,
  TrendingUp,
  Award,
  Target,
  Building2,
  Phone,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  Utensils,
  ChefHat,
  Star,
  Calendar,
  Sparkles,
  Newspaper,
  MessageSquare,
  FileText,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useSafetyData } from "@/hooks/useSafetyData"
import { useMenu } from "@/hooks/useMenu"
import { RestaurantMenuForm } from "@/components/restaurant-menu-form"

export default function LandingPage() {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { safetyData, loading, error } = useSafetyData()
  const { weekMenu, loading: menuLoading, error: menuError, fetchWeekMenu } = useMenu()
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showMenuForm, setShowMenuForm] = useState(false)
  const [showMenuAuth, setShowMenuAuth] = useState(false)
  const [menuAuthCode, setMenuAuthCode] = useState('')
  const [menuAuthError, setMenuAuthError] = useState('')

  // Fonctions d'authentification pour le menu
  const handleMenuAuth = () => {
    if (menuAuthCode === '1234@') {
      setShowMenuAuth(false)
      setShowMenuForm(true)
      setMenuAuthError('')
      setMenuAuthCode('')
    } else {
      setMenuAuthError('Code incorrect. Veuillez réessayer.')
    }
  }

  const openMenuAuth = () => {
    setShowMenuAuth(true)
    setMenuAuthCode('')
    setMenuAuthError('')
  }

  const closeMenuAuth = () => {
    setShowMenuAuth(false)
    setMenuAuthCode('')
    setMenuAuthError('')
  }

  const sarSlides = [
    {
      title: "Notre Histoire",
      subtitle: "Un Héritage au Service du Développement",
      content:
        "Inaugurée officiellement le 27 janvier 1964 par le Président Léopold Sédar Senghor, la SAR a démarré ses opérations avec une capacité initiale de 600 000 tonnes par an. Au fil des décennies, nous avons constamment modernisé nos installations pour répondre aux besoins croissants du pays.",
      icon: Factory,
      stats: "1964 - Année d'inauguration",
      color: "from-red-500/10 to-orange-500/10",
      backgroundImage: "/modern-oil-refinery-facility.jpg",
    },
    {
      title: "Notre Mission",
      subtitle: "Transformer l'Or Noir en Progrès",
      content:
        "Notre cœur de métier est le raffinage : un processus complexe et essentiel qui consiste à séparer et transformer le pétrole brut en produits indispensables. En approvisionnant les distributeurs d'hydrocarbures, la SAR garantit la disponibilité d'une énergie fiable et de qualité.",
      icon: Target,
      stats: "1,5 million de tonnes - Capacité actuelle",
      color: "from-red-500/10 to-red-600/10",
      backgroundImage: "/labo.jpg",
    },
    {
      title: "Cap sur l'Avenir",
      subtitle: "L'Ère Sangomar et l'Autonomie Énergétique",
      content:
        "Le Sénégal est à l'aube d'une nouvelle ère énergétique, et la SAR est au premier plan de cette transformation. Notre vision d'avenir est claire : valoriser pleinement le pétrole national de Sangomar et renforcer l'autonomie énergétique de notre nation.",
      icon: TrendingUp,
      stats: "3,5 millions de tonnes - Objectif futur",
      color: "from-orange-500/10 to-red-500/10",
      backgroundImage: "/modern-oil-refinery-facility.jpg",
    },
    {
      title: "Engagements QHSE",
      subtitle: "Excellence et Responsabilité",
      content:
        "La SAR s'engage pour la Qualité, l'Hygiène, la Sécurité et l'Environnement. Nos investissements dans des équipements de pointe et notre collaboration avec des partenaires techniques de renommée mondiale comme Technip Energies témoignent de notre engagement vers l'excellence.",
      icon: Award,
      stats: "75% - Part future du brut sénégalais",
      color: "from-red-600/10 to-red-700/10",
      backgroundImage: "/industrial-safety-equipment.png",
    },
    {
      title: "Certifications",
      subtitle: "Reconnaissance Internationale de l'Excellence",
      content:
        "La SAR est fière de détenir plusieurs certifications internationales : ISO 9001 (Qualité), ISO 45001 (Sécurité), ISO 14001 (Environnement) et ISO 17001 (Accréditation). Ces certifications reconnues mondialement attestent de notre conformité aux standards les plus élevés de l'industrie pétrolière.",
      icon: Shield,
      stats: "4 Certifications ISO",
      color: "from-blue-500/10 to-indigo-500/10",
      backgroundImage: "/sar-raffinage.jpeg",
    },
  ]


  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
            
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    // Observe all elements with scroll-animate class
    const elements = document.querySelectorAll(".scroll-animate")
    elements.forEach((el) => observerRef.current?.observe(el))

    // Observer spécifique pour la section about
    const aboutSection = document.getElementById("about")
    if (aboutSection) {
      observerRef.current?.observe(aboutSection)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [])

  useEffect(() => {
    // Ne pas démarrer le timer si on survole le carousel
    if (isHovered) return

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 4) // 4 variations de couleurs
    }, 4000) // Changement toutes les 4 secondes

    return () => clearInterval(timer)
  }, [isHovered])

  // Effets pour SafetyCounter
  useEffect(() => {
    // Marquer comme côté client
    setIsClient(true)
    setCurrentTime(new Date())
    
    // Animation du compteur au chargement
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Mise à jour de l'heure chaque seconde
  useEffect(() => {
    if (!isClient) return
    
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [isClient])

  // Charger le menu de la semaine au montage du composant
  useEffect(() => {
    fetchWeekMenu()
  }, [fetchWeekMenu])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  // Fonctions pour le menu
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    })
  }

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
      day: 'numeric',
      month: 'long'
    })
  }

  // Fonction pour générer tous les jours de la semaine
  const getWeekDays = () => {
    if (!weekMenu) return []
    
    const weekStart = new Date(weekMenu.week_start)
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
    
    return days.map((day, index) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + index)
      
      return {
        day,
        dayName: dayNames[index],
        date: date.toISOString().split('T')[0]
      }
    })
  }

  // Obtenir le type de cuisine avec emoji et couleur
  const getCuisineInfo = (type: string) => {
    switch (type) {
      case 'senegalese':
        return {
          emoji: '🇸🇳',
          name: 'Sénégalais',
          color: 'from-orange-500 to-red-500',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          icon: '🍽️'
        }
      case 'european':
        return {
          emoji: '🇪🇺',
          name: 'Européen',
          color: 'from-blue-500 to-indigo-500',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          icon: '🥘'
        }
      default:
        return {
          emoji: '🍽️',
          name: 'Cuisine',
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: '🍽️'
        }
    }
  }


  // Fonctions pour naviguer manuellement dans les variations de couleurs
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 5)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 5) % 5)
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/30 font-sans">
      <style jsx global>{`
        .scroll-animate {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .scroll-animate.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
        
        .scroll-animate-delay-1 {
          transition-delay: 0.1s;
        }
        
        .scroll-animate-delay-2 {
          transition-delay: 0.2s;
        }
        
        .scroll-animate-delay-3 {
          transition-delay: 0.3s;
        }
        
        .scroll-animate-delay-4 {
          transition-delay: 0.4s;
        }
        
        .scroll-animate-delay-5 {
          transition-delay: 0.5s;
        }
        
        .scroll-animate-delay-6 {
          transition-delay: 0.6s;
        }
        
        .parallax-bg {
          transform: translateY(var(--scroll-y, 0));
        }
        
        .hero-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .card-hover {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(220, 38, 38, 0.25);
        }
        
        .stagger-animation {
          animation: slideInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        
        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
         .color-overlay {
           transition: all 2s cubic-bezier(0.4, 0, 0.2, 1);
         }
         
         .color-overlay-0 {
           background: linear-gradient(135deg, rgba(220, 38, 38, 0.4) 0%, rgba(185, 28, 28, 0.3) 50%, rgba(0, 0, 0, 0.1) 100%);
         }
         
         .color-overlay-1 {
           background: linear-gradient(135deg, rgba(234, 88, 12, 0.4) 0%, rgba(194, 65, 12, 0.3) 50%, rgba(0, 0, 0, 0.1) 100%);
         }
         
         .color-overlay-2 {
           background: linear-gradient(135deg, rgba(185, 28, 28, 0.4) 0%, rgba(153, 27, 27, 0.3) 50%, rgba(0, 0, 0, 0.1) 100%);
         }
         
         .color-overlay-3 {
           background: linear-gradient(135deg, rgba(194, 65, 12, 0.4) 0%, rgba(154, 52, 18, 0.3) 50%, rgba(0, 0, 0, 0.1) 100%);
         }
        
        .qhse-text {
          animation: fadeInScale 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: scale(0.8);
        }
        
        @keyframes fadeInScale {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        /* Design décoratif pour les côtés - Cohérent avec la page */
        .side-decoration {
          position: fixed;
          z-index: 1;
          pointer-events: none;
          opacity: 0.4;
        }
        
        /* Lignes verticales élégantes */
        .side-line-left {
          left: 3%;
          top: 0;
          width: 2px;
          height: 100vh;
          background: linear-gradient(to bottom, 
            transparent 0%, 
            rgba(220, 38, 38, 0.4) 20%, 
            rgba(220, 38, 38, 0.7) 50%, 
            rgba(220, 38, 38, 0.4) 80%, 
            transparent 100%);
          box-shadow: 0 0 8px rgba(220, 38, 38, 0.3);
        }
        
        .side-line-right {
          right: 3%;
          top: 0;
          width: 2px;
          height: 100vh;
          background: linear-gradient(to bottom, 
            transparent 0%, 
            rgba(234, 88, 12, 0.4) 20%, 
            rgba(234, 88, 12, 0.7) 50%, 
            rgba(234, 88, 12, 0.4) 80%, 
            transparent 100%);
          box-shadow: 0 0 8px rgba(234, 88, 12, 0.3);
        }
        
        /* Motifs géométriques subtils */
        .side-pattern {
          position: fixed;
          z-index: 1;
          pointer-events: none;
          opacity: 0.25;
          animation: sideFloat 25s ease-in-out infinite;
        }
        
        /* Côté gauche - Motifs rouges */
        .pattern-left-1 {
          left: 5%;
          top: 15%;
          width: 50px;
          height: 50px;
          border: 2px solid rgba(220, 38, 38, 0.6);
          border-radius: 50%;
          background: transparent;
          box-shadow: 0 0 6px rgba(220, 38, 38, 0.4);
        }
        
        .pattern-left-2 {
          left: 7%;
          top: 25%;
          width: 35px;
          height: 35px;
          background: linear-gradient(45deg, transparent 40%, rgba(220, 38, 38, 0.5) 40%, rgba(220, 38, 38, 0.5) 60%, transparent 60%);
          transform: rotate(45deg);
          box-shadow: 0 0 4px rgba(220, 38, 38, 0.3);
        }
        
        .pattern-left-3 {
          left: 4%;
          top: 35%;
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.7), transparent);
          box-shadow: 0 0 4px rgba(220, 38, 38, 0.4);
        }
        
        .pattern-left-4 {
          left: 6%;
          top: 45%;
          width: 30px;
          height: 30px;
          border: 1px solid rgba(220, 38, 38, 0.25);
          border-radius: 6px;
          background: transparent;
        }
        
        .pattern-left-5 {
          left: 5%;
          top: 55%;
          width: 20px;
          height: 20px;
          background: rgba(220, 38, 38, 0.15);
          border-radius: 50%;
        }
        
        .pattern-left-6 {
          left: 7%;
          top: 65%;
          width: 45px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(220, 38, 38, 0.3), transparent);
        }
        
        .pattern-left-7 {
          left: 4%;
          top: 75%;
          width: 28px;
          height: 28px;
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: 50%;
          background: transparent;
        }
        
        .pattern-left-8 {
          left: 6%;
          top: 85%;
          width: 22px;
          height: 22px;
          background: linear-gradient(45deg, transparent 30%, rgba(220, 38, 38, 0.15) 30%, rgba(220, 38, 38, 0.15) 70%, transparent 70%);
          transform: rotate(-45deg);
        }
        
        /* Côté droit - Motifs orange */
        .pattern-right-1 {
          right: 5%;
          top: 20%;
          width: 35px;
          height: 35px;
          border: 1px solid rgba(234, 88, 12, 0.3);
          border-radius: 50%;
          background: transparent;
        }
        
        .pattern-right-2 {
          right: 7%;
          top: 30%;
          width: 22px;
          height: 22px;
          background: linear-gradient(45deg, transparent 40%, rgba(234, 88, 12, 0.2) 40%, rgba(234, 88, 12, 0.2) 60%, transparent 60%);
          transform: rotate(-45deg);
        }
        
        .pattern-right-3 {
          right: 4%;
          top: 40%;
          width: 45px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(234, 88, 12, 0.4), transparent);
        }
        
        .pattern-right-4 {
          right: 6%;
          top: 50%;
          width: 28px;
          height: 28px;
          border: 1px solid rgba(234, 88, 12, 0.25);
          border-radius: 6px;
          background: transparent;
        }
        
        .pattern-right-5 {
          right: 5%;
          top: 60%;
          width: 18px;
          height: 18px;
          background: rgba(234, 88, 12, 0.15);
          border-radius: 50%;
        }
        
        .pattern-right-6 {
          right: 7%;
          top: 70%;
          width: 40px;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(234, 88, 12, 0.3), transparent);
        }
        
        .pattern-right-7 {
          right: 4%;
          top: 80%;
          width: 25px;
          height: 25px;
          border: 1px solid rgba(234, 88, 12, 0.2);
          border-radius: 50%;
          background: transparent;
        }
        
        .pattern-right-8 {
          right: 6%;
          top: 90%;
          width: 20px;
          height: 20px;
          background: linear-gradient(45deg, transparent 30%, rgba(234, 88, 12, 0.15) 30%, rgba(234, 88, 12, 0.15) 70%, transparent 70%);
          transform: rotate(45deg);
        }
        
        /* Points de connexion subtils */
        .connection-dots {
          position: fixed;
          z-index: 1;
          pointer-events: none;
          opacity: 0.2;
        }
        
        .dots-left {
          left: 3.5%;
          top: 10%;
          width: 3px;
          height: 3px;
          background: rgba(220, 38, 38, 0.7);
          border-radius: 50%;
          box-shadow: 
            0 0 6px rgba(220, 38, 38, 0.4),
            0 100px 0 rgba(220, 38, 38, 0.6),
            0 200px 0 rgba(220, 38, 38, 0.5),
            0 300px 0 rgba(220, 38, 38, 0.4),
            0 400px 0 rgba(220, 38, 38, 0.3);
        }
        
        .dots-right {
          right: 3.5%;
          top: 12%;
          width: 3px;
          height: 3px;
          background: rgba(234, 88, 12, 0.7);
          border-radius: 50%;
          box-shadow: 
            0 0 6px rgba(234, 88, 12, 0.4),
            0 90px 0 rgba(234, 88, 12, 0.6),
            0 180px 0 rgba(234, 88, 12, 0.5),
            0 270px 0 rgba(234, 88, 12, 0.4),
            0 360px 0 rgba(234, 88, 12, 0.3);
        }
        
        /* Animation subtile */
        @keyframes sideFloat {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.25;
          }
          50% { 
            transform: translateY(-3px) rotate(0.5deg); 
            opacity: 0.35;
          }
        }
        
        /* Responsive - Masquer sur petits écrans */
        @media (max-width: 1024px) {
          .side-decoration,
          .side-pattern,
          .connection-dots {
            display: none;
          }
        }
        
        /* Plus visible sur très grands écrans */
        @media (min-width: 1400px) {
          .side-decoration {
            opacity: 0.5;
          }
          
          .side-pattern {
            opacity: 0.35;
          }
          
          .connection-dots {
            opacity: 0.3;
          }
        }

        /* Responsive grid pour le menu - Gestion spécifique de 621px */
        .menu-grid-responsive {
          display: grid;
          gap: 0.5rem;
        }

        @media (min-width: 480px) and (max-width: 640px) {
          .menu-grid-responsive {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
        }

        /* Gestion spécifique pour 621px */
        @media (min-width: 600px) and (max-width: 650px) {
          .menu-grid-responsive {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
        }

        @media (min-width: 640px) and (max-width: 768px) {
          .menu-grid-responsive {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
        }

        @media (min-width: 768px) and (max-width: 1024px) {
          .menu-grid-responsive {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
          }
        }

        @media (min-width: 1024px) and (max-width: 1280px) {
          .menu-grid-responsive {
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
          }
        }

        @media (min-width: 1280px) {
          .menu-grid-responsive {
            grid-template-columns: repeat(5, 1fr);
            gap: 0.75rem;
          }
        }
      `}</style>

      {/* Design décoratif pour les côtés */}
      {/* Lignes verticales élégantes */}
      <div className="side-decoration side-line-left"></div>
      <div className="side-decoration side-line-right"></div>
      
      {/* Motifs géométriques côté gauche */}
      <div className="side-pattern pattern-left-1"></div>
      <div className="side-pattern pattern-left-2"></div>
      <div className="side-pattern pattern-left-3"></div>
      <div className="side-pattern pattern-left-4"></div>
      <div className="side-pattern pattern-left-5"></div>
      <div className="side-pattern pattern-left-6"></div>
      <div className="side-pattern pattern-left-7"></div>
      <div className="side-pattern pattern-left-8"></div>
      
      {/* Motifs géométriques côté droit */}
      <div className="side-pattern pattern-right-1"></div>
      <div className="side-pattern pattern-right-2"></div>
      <div className="side-pattern pattern-right-3"></div>
      <div className="side-pattern pattern-right-4"></div>
      <div className="side-pattern pattern-right-5"></div>
      <div className="side-pattern pattern-right-6"></div>
      <div className="side-pattern pattern-right-7"></div>
      <div className="side-pattern pattern-right-8"></div>
      
      {/* Points de connexion subtils */}
      <div className="connection-dots dots-left"></div>
      <div className="connection-dots dots-right"></div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-600" style={{ backgroundColor: '#1f2937' }}>
        <div className="flex h-16 items-center justify-between px-2 sm:px-4 lg:px-6">
          {/* Left section */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-8 w-12 sm:h-10 sm:w-16 items-center justify-center flex-shrink-0">
                <img 
                  src="/sarlogo.png" 
                  alt="SAR Logo" 
                  className="h-full w-full object-contain"
                />
          </div>
              <div className="hidden sm:block min-w-0">
                <h1 className="text-xs sm:text-sm font-semibold text-white truncate">
                  Société Africaine de Raffinage
                </h1>
        </div>
            </div>
          </div>

          {/* Center section - Navigation links */}
          <div className="hidden md:flex space-x-6">
            <Link
            href="#sar"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
            >
            SAR
            </Link>
            <Link
            href="#director"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
            >
            Direction
            </Link>
            <Link
              href="#about"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
            >
            Sécurité
            </Link>
            <Link
            href="#restaurant"
            className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
          >
            Menu
          </Link>
          <Link
            href="#features"
            className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
          >
            Fonctionnalités
          </Link>
          <Link
            href="#footer"
              className="text-gray-300 hover:text-white transition-all duration-300 hover:scale-105 font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button className="bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg" asChild>
              <Link href="/login">
                Accéder à l'intranet
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

       {/* Hero Section */}
       <section className="relative py-20 lg:py-32 overflow-hidden">
         {/* Image unique avec variations de couleurs */}
         <div className="absolute inset-0 z-0">
           <div 
             className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90" 
             style={{
               backgroundImage: "url('/photo_profil.png')",
               filter: "contrast(1.2) brightness(0.9) saturate(1.2) sharpness(1.1)"
             }}
           >
             {/* Overlay de couleur qui change dynamiquement */}
             <div className={`absolute inset-0 color-overlay color-overlay-${currentSlide}`}></div>
           </div>
         </div>

        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40 z-10"></div>
        
        {/* Contenu principal */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto group hover:scale-105 transition-transform duration-500 ease-out">
            <Badge variant="secondary" className="mb-6 scroll-animate hero-float bg-red-100 text-red-700 border-red-200">
              <Zap className="w-3 h-3 mr-1" />
              Plateforme Intranet SAR
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-balance mb-6 scroll-animate scroll-animate-delay-1 text-white drop-shadow-lg">
              Votre espace de travail
              <span className="text-red-300 block">collaboratif</span>
              et connecté
              </h1>
            <p className="text-xl text-gray-100 text-pretty mb-8 max-w-2xl mx-auto leading-relaxed scroll-animate scroll-animate-delay-2 drop-shadow-md">
              La plateforme intranet SAR centralise tous vos outils de travail collaboratif dans une interface moderne et sécurisée.
              Optimisez la productivité de vos équipes avec une solution dédiée à la Société Africaine de Raffinage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center scroll-animate scroll-animate-delay-3">
              <Button
                size="lg"
                className="text-lg px-8 py-6 bg-red-600 hover:bg-red-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-xl"
                asChild
              >
                <Link href="/login">
                  Accéder à l'intranet
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                asChild
              >
                <Link href="#features">Découvrir l'intranet</Link>
              </Button>
                </div>
          </div>
        </div>

         {/* Indicateurs de variation de couleur - Masqués */}
         <div className="hidden absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
           <button
             onClick={() => setCurrentSlide(0)}
             className={`w-3 h-3 rounded-full transition-all duration-300 ${
               currentSlide === 0
                 ? "bg-white scale-125"
                 : "bg-white/50 hover:bg-white/75"
             }`}
             title="Variation rouge"
           />
           <button
             onClick={() => setCurrentSlide(1)}
             className={`w-3 h-3 rounded-full transition-all duration-300 ${
               currentSlide === 1
                 ? "bg-white scale-125"
                 : "bg-white/50 hover:bg-white/75"
             }`}
             title="Variation orange"
           />
           <button
             onClick={() => setCurrentSlide(2)}
             className={`w-3 h-3 rounded-full transition-all duration-300 ${
               currentSlide === 2
                 ? "bg-white scale-125"
                 : "bg-white/50 hover:bg-white/75"
             }`}
             title="Variation rouge foncé"
           />
           <button
             onClick={() => setCurrentSlide(3)}
             className={`w-3 h-3 rounded-full transition-all duration-300 ${
               currentSlide === 3
                 ? "bg-white scale-125"
                 : "bg-white/50 hover:bg-white/75"
             }`}
             title="Variation orange foncé"
           />
         </div>
      </section>

      <section
        id="sar"
        className="py-24 bg-gradient-to-br from-slate-100 via-red-50 to-orange-50 relative overflow-hidden transition-all duration-500 ease-out group hover:from-slate-200 hover:via-red-100 hover:to-orange-100"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header avec animation */}
          <div className="text-center mb-20 scroll-animate group-hover:scale-105 transition-transform duration-500 ease-out">
            <Badge variant="secondary" className="mb-4 bg-red-100 text-red-700 border-red-200">
              <Factory className="w-3 h-3 mr-1" />
              Notre Entreprise
            </Badge>
            
            <h2 className="text-4xl md:text-6xl font-bold text-balance mb-6 bg-gradient-to-r from-gray-900 via-red-700 to-orange-700 bg-clip-text text-transparent leading-tight">
              Société Africaine de Raffinage
            </h2>
            
            <div className="max-w-4xl mx-auto">
              <p className="text-xl md:text-2xl text-gray-700 text-pretty leading-relaxed mb-8">
                Au Cœur de l'Énergie du Sénégal
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Depuis plus de 60 ans, la SAR est le poumon énergétique du Sénégal, acteur stratégique de notre souveraineté et de notre sécurité énergétique.
              </p>
            </div>
          </div>

          {/* Carousel redesigné */}
          <div 
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl shadow-2xl w-full max-w-none ring-1 ring-red-200/50 hover:shadow-3xl hover:scale-105 transition-all duration-500">
              <CardContent className="p-0">
                <div className="relative h-[700px] md:h-[600px] w-full">
                  {/* Image de fond unique et fixe */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-out group-hover:scale-105"
                    style={{
                      backgroundImage: "url('/sar-raffinage.jpeg')",
                      filter: "contrast(1.2) brightness(0.85) saturate(1.1)"
                    }}
                  />
                  
                  {/* Gradient overlay fixe */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 opacity-60"></div>
                  
                  {/* Overlay pattern fixe */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  
                  {/* Contenu principal avec carte fixe */}
                  <div className="relative z-10 h-full p-4 md:p-6 lg:p-8">
                    <div className="flex items-center justify-center h-full max-w-7xl mx-auto">
                      {/* Carte transparente fixe */}
                      <div className="space-y-6 text-center max-w-4xl relative">
                        {/* Carte de transparence fixe pour la lisibilité */}
                        <div className="bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 shadow-xl p-4 md:p-6">
                          {/* Contenu dynamique avec transitions fluides */}
                          <div className="space-y-3 md:space-y-4">
                            {/* Icône et titre avec transition */}
                            <div className="flex items-center justify-center space-x-4">
                              <div className="w-20 h-20 bg-red-100/80 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-red-200/50 shadow-lg transition-all duration-500 ease-out">
                                {(() => {
                                  const IconComponent = sarSlides[currentSlide].icon
                                  return <IconComponent className="w-10 h-10 text-red-700 transition-all duration-500 ease-out" />
                                })()}
                                </div>
                                <div>
                                <h3 className="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl leading-tight transition-all duration-500 ease-out">
                                  {sarSlides[currentSlide].title}
                                </h3>
                                {sarSlides[currentSlide].title === "Engagements QHSE" && (
                                  <div className="mt-2 text-red-200 font-semibold text-xl transition-all duration-500 ease-out">
                                    Excellence & Responsabilité
                                    </div>
                                  )}
                                </div>
                              </div>
                            
                            {/* Sous-titre avec transition */}
                            <h4 className="text-2xl md:text-3xl font-semibold text-white/90 drop-shadow-2xl transition-all duration-500 ease-out">
                              {sarSlides[currentSlide].subtitle}
                            </h4>
                            
                            {/* Contenu avec transition */}
                            <p className="text-white/80 leading-relaxed text-xl drop-shadow-lg transition-all duration-500 ease-out">
                              {sarSlides[currentSlide].content}
                            </p>
                            
                            {/* Stats badge avec transition */}
                            <div className="flex items-center justify-center space-x-4">
                              <Badge className="bg-white/20 border-white/30 text-white backdrop-blur-sm px-8 py-4 text-xl font-semibold shadow-lg transition-all duration-500 ease-out">
                                {sarSlides[currentSlide].stats}
                                </Badge>
                              <div className="w-3 h-3 bg-white/60 rounded-full animate-pulse transition-all duration-500 ease-out"></div>
                              </div>
                            </div>
                              </div>
                            </div>
                          </div>
                        </div>
                </div>
              </CardContent>
            </Card>

            {/* Contrôles du carousel redesignés */}
            <div className="flex items-center justify-center mt-12 space-x-6">
              <Button
                variant="outline"
                size="lg"
                onClick={prevSlide}
                className="w-14 h-14 rounded-full p-0 transition-all duration-300 hover:scale-110 bg-white/80 border-red-200 text-red-700 hover:bg-red-50 backdrop-blur-sm shadow-lg"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>

              <div className="flex space-x-3">
                {sarSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-4 h-4 rounded-full transition-all duration-500 ${
                      index === currentSlide
                        ? "bg-red-600 scale-125 shadow-lg"
                        : "bg-red-300 hover:bg-red-400 hover:scale-110"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={nextSlide}
                className="w-14 h-14 rounded-full p-0 transition-all duration-300 hover:scale-110 bg-white/80 border-red-200 text-red-700 hover:bg-red-50 backdrop-blur-sm shadow-lg"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
            </div>

          {/* Stats redesignées avec animation */}
          <div className="grid md:grid-cols-4 gap-8 mt-20 scroll-animate">
            <Card className="text-center p-8 border-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl card-hover shadow-2xl ring-1 ring-red-200/50 group hover:shadow-3xl hover:scale-105 transition-all duration-500">
              <div className="text-4xl font-bold text-red-600 mb-3 group-hover:scale-110 transition-transform duration-300">1964</div>
              <div className="text-sm text-gray-600 font-medium">Année d'inauguration</div>
              <div className="w-12 h-1 bg-gradient-to-r from-red-400 to-orange-400 mx-auto mt-4 rounded-full"></div>
              </Card>
            
            <Card className="text-center p-8 border-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl card-hover shadow-2xl ring-1 ring-orange-200/50 group hover:shadow-3xl hover:scale-105 transition-all duration-500">
              <div className="text-4xl font-bold text-orange-600 mb-3 group-hover:scale-110 transition-transform duration-300">1,5M</div>
              <div className="text-sm text-gray-600 font-medium">Tonnes - Capacité actuelle</div>
              <div className="w-12 h-1 bg-gradient-to-r from-red-400 to-orange-400 mx-auto mt-4 rounded-full"></div>
              </Card>
            
            <Card className="text-center p-8 border-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl card-hover shadow-2xl ring-1 ring-red-200/50 group hover:shadow-3xl hover:scale-105 transition-all duration-500">
              <div className="text-4xl font-bold text-red-600 mb-3 group-hover:scale-110 transition-transform duration-300">3,5M</div>
              <div className="text-sm text-gray-600 font-medium">Tonnes - Objectif futur</div>
              <div className="w-12 h-1 bg-gradient-to-r from-red-400 to-orange-400 mx-auto mt-4 rounded-full"></div>
              </Card>
            
            <Card className="text-center p-8 border-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl card-hover shadow-2xl ring-1 ring-orange-200/50 group hover:shadow-3xl hover:scale-105 transition-all duration-500">
              <div className="text-4xl font-bold text-orange-600 mb-3 group-hover:scale-110 transition-transform duration-300">75%</div>
              <div className="text-sm text-gray-600 font-medium">Brut sénégalais futur</div>
              <div className="w-12 h-1 bg-gradient-to-r from-red-400 to-orange-400 mx-auto mt-4 rounded-full"></div>
              </Card>
          </div>
        </div>
      </section>

      {/* Mot du Directeur Section */}
      <section id="director" className="py-20 bg-gradient-to-br from-slate-100 via-red-50/40 to-orange-50/40 transition-all duration-500 ease-out group hover:from-slate-200 hover:via-red-100/60 hover:to-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête de section */}
          <div className="text-center mb-16 scroll-animate group-hover:scale-105 transition-transform duration-500 ease-out">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              <Users className="w-3 h-3 mr-1" />
              Direction
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-balance mb-4 group-hover:scale-105 group-hover:drop-shadow-2xl transition-all duration-1000">
              <span className="inline-block animate-bounce delay-100 text-gray-900 group-hover:text-red-600 transition-colors duration-500 mr-2">Mot</span>
              <span className="inline-block mx-2 text-gray-900 group-hover:text-orange-500 animate-pulse transition-colors duration-500">du</span>
              <span className="inline-block animate-bounce delay-200 text-gray-900 group-hover:text-orange-600 transition-colors duration-500 mr-2">Directeur</span>
              <span className="inline-block animate-bounce delay-300 text-gray-900 group-hover:text-red-700 transition-colors duration-500">Général</span>
            </h2>
          </div>

          {/* Contenu principal */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Photo du directeur à gauche */}
            <div className="order-1 lg:order-1">
              <div className="relative group">
                <div className="aspect-square max-w-md mx-auto lg:mx-0">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                    {/* Photo du directeur */}
                    <Image
                      src="/directeur.jpg"
                      alt="Directeur Général de la SAR"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />
                    
                    {/* Overlay décoratif */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 via-transparent to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Motifs décoratifs */}
                    <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 bg-blue-500/20 rounded-full opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                </div>
                </div>
                
                {/* Barre décorative */}
                <div className="w-16 h-1 bg-gradient-to-r from-red-400 to-orange-400 mx-auto lg:mx-0 mt-6 rounded-full group-hover:w-24 transition-all duration-500"></div>
              </div>
            </div>

            {/* Texte à droite */}
            <div className="order-2 lg:order-2">
              <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 group/card">
                <CardContent className="p-8 lg:p-10">
                  {/* En-tête du message */}
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="group-hover/card:scale-110 transition-transform duration-300">
                        <img 
                          src="/sarlogo.png" 
                          alt="SAR Logo" 
                          className="h-12 w-16 object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 group-hover/card:text-blue-700 transition-colors duration-300">
                          Message de la Direction
                        </h3>
                        <p className="text-sm text-gray-600 font-medium">
                          Directeur Général de la SAR
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contenu du message */}
                  <div className="space-y-6 text-gray-700 leading-relaxed">
                    <p className="text-lg">
                      <span className="font-semibold text-gray-900">Chers clients et partenaires,</span>
                    </p>
                    
                    <p>
                      La mission de la Société Africaine de Raffinage (SAR) est de servir l'économie sénégalaise en approvisionnant régulièrement le marché en produits pétroliers aux coûts les plus bas, garantissant ainsi la sécurité d'approvisionnement énergétique du Sénégal.
                    </p>
                    
                    <p>
                      Cette fonction s'amplifie avec la valorisation du pétrole brut de Sangomar. La SAR prendra toutes les mesures nécessaires pour relever ces nouveaux défis avec l'appui des pouvoirs publics.
                    </p>
                    
                    <p>
                      La transparence, la responsabilité sociale, les standards de qualité élevés et la sécurité sont au cœur de notre gouvernance. Cette plateforme constitue une porte ouverte sur nos activités, nos services et les opportunités d'emplois et de stages. Nous vous encourageons à faire des suggestions et à tirer le meilleur parti de cet outil.
                    </p>
                    
                    <p>
                      Nous nous engageons à améliorer continuellement ce site pour un meilleur service.
                    </p>
                    
                    <p>
                      Nous vous invitons à nous rendre visite régulièrement, à communiquer et à partager les informations sur l'actualité des hydrocarbures au Sénégal via les réseaux sociaux, contribuant ainsi à faire de la SAR une entreprise ouverte et un instrument précieux pour les transformations économiques et sociales en cours.
                    </p>
                </div>

                  {/* Signature */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        Le Directeur Général
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Société Africaine de Raffinage
                      </p>
                    </div>
                  </div>
              </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - SafetyCounter */}
      <section id="about" className="py-20 bg-gradient-to-br from-red-50 via-red-100/30 to-red-200/20 transition-all duration-500 ease-out group hover:from-red-100 hover:via-red-150/40 hover:to-red-200/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête de section */}
          <div className="text-center mb-16 scroll-animate group-hover:scale-105 transition-transform duration-500 ease-out">
            <Badge variant="secondary" className="mb-4 bg-red-100 text-red-700 border-red-200">
              <Shield className="w-3 h-3 mr-1" />
              Sécurité & Prévention
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4 text-gray-900">
              La sécurité, notre priorité absolue
            </h2>
            <p className="text-xl text-gray-600 text-pretty max-w-3xl mx-auto">
              À la SAR, la sécurité de nos employés et la protection de l'environnement sont au cœur de nos préoccupations.
            </p>
          </div>

          {/* SafetyCounter exact */}
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Carte sécurité à gauche */}
            <div className="order-1 lg:order-1">
              <div className="max-w-4xl w-full">
              {/* Gestion des états de chargement et d'erreur */}
              {loading ? (
                <Card className="h-[24rem] sm:h-[28rem] lg:h-[32rem] flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-0 hover:shadow-2xl hover:scale-105 transition-all duration-500">
                  <CardHeader className="relative pb-4 flex-shrink-0 z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-white">
                          🛡️ Sécurité du Travail
                        </CardTitle>
                        <p className="text-sm text-blue-200/80 font-medium">
                          Chargement...
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative flex-1 flex flex-col justify-center p-6 z-10">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                      <p className="text-white/80">Chargement des données de sécurité...</p>
                    </div>
              </CardContent>
            </Card>
              ) : error ? (
                <Card className="h-[24rem] sm:h-[28rem] lg:h-[32rem] flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-0 hover:shadow-2xl hover:scale-105 transition-all duration-500">
                  <CardHeader className="relative pb-4 flex-shrink-0 z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                        <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-white">
                          🛡️ Sécurité du Travail
                        </CardTitle>
                        <p className="text-sm text-red-200/80 font-medium">
                          Erreur de chargement
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative flex-1 flex flex-col justify-center p-6 z-10">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                      <p className="text-white/80 mb-2">Erreur lors du chargement des données</p>
                      <p className="text-red-300 text-sm">{error}</p>
                    </div>
              </CardContent>
            </Card>
              ) : !safetyData ? (
                <Card className="h-[24rem] sm:h-[28rem] lg:h-[32rem] flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-0 hover:shadow-2xl hover:scale-105 transition-all duration-500">
                  <CardHeader className="relative pb-4 flex-shrink-0 z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                        <Shield className="h-6 w-6 text-white" />
                </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-white">
                          🛡️ Sécurité du Travail
                        </CardTitle>
                        <p className="text-sm text-blue-200/80 font-medium">
                          Aucune donnée disponible
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative flex-1 flex flex-col justify-center p-6 z-10">
                    <div className="text-center">
                      <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                      <p className="text-white/80">Aucune donnée de sécurité disponible</p>
                    </div>
              </CardContent>
            </Card>
              ) : (
                <Card className="h-[24rem] sm:h-[28rem] lg:h-[32rem] flex flex-col overflow-hidden relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 border-0 hover:shadow-2xl hover:scale-105 transition-all duration-500 group">
                  {/* Image de fond avec overlay */}
                  <div className="absolute inset-0">
                    <Image
                      src="/industrial-safety-equipment.png"
                      alt="Équipements de sécurité industrielle"
                      fill
                      className="object-cover opacity-90 group-hover:opacity-95 transition-opacity duration-500"
                      priority
                    />
                    {/* Overlay minimal pour laisser voir l'image au maximum */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/15 via-blue-900/10 to-indigo-900/15" />
                    {/* Motifs décoratifs */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full translate-y-12 -translate-x-12" />
                  </div>

                  <CardHeader className="relative pb-2 sm:pb-4 flex-shrink-0 z-10 p-3 sm:p-4 lg:p-6">
                    <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-blue-200/50 group-hover:scale-105 transition-all duration-300">
                          <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg lg:text-xl font-bold text-white group-hover:text-blue-200 transition-colors duration-300 truncate">
                            🛡️ Sécurité du Travail
                          </CardTitle>
                          <p className="text-xs sm:text-sm text-blue-200/80 font-medium truncate">
                            Compteurs de jours sans accident
                          </p>
                        </div>
                      </div>
                      
                      {/* Numéro vert SAR */}
                      <div className="text-center sm:text-right flex-shrink-0">
                        <div className="text-xs sm:text-sm lg:text-base font-bold text-green-800 drop-shadow-lg bg-green-100/90 px-2 sm:px-3 py-1 rounded-lg whitespace-nowrap">
                          📞 800 00 34 34
                        </div>
                        <div className="text-xs text-green-700 font-semibold mt-1">
                          Numéro vert SAR
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative flex-1 flex flex-col justify-center p-3 sm:p-4 lg:p-6 z-10">
                    {/* Les deux compteurs côte à côte */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 h-full">
                      {/* Compteur SAR */}
                      <div className="flex flex-col justify-center items-center space-y-1 sm:space-y-2 lg:space-y-3 bg-gradient-to-br from-blue-500/20 to-blue-600/30 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 border border-blue-400/30 backdrop-blur-sm group-hover:from-blue-500/30 group-hover:to-blue-600/40 transition-all duration-500 min-h-[100px] sm:min-h-[120px] lg:min-h-[140px]">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <Building2 className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-blue-300" />
                          <span className="text-xs sm:text-sm font-semibold text-blue-200 uppercase tracking-wide">
                            SAR
                  </span>
                </div>
                        
                        <div className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-1 sm:mb-2 transition-all duration-1000 drop-shadow-2xl ${
                          isAnimating ? 'scale-110' : 'scale-100'
                        }`}>
                          {safetyData.daysWithoutIncidentSAR}
                </div>
                        
                        <div className="text-center space-y-0.5 sm:space-y-1">
                          <div className="text-xs sm:text-sm lg:text-base font-bold text-blue-100">
                            {safetyData.daysWithoutIncidentSAR === 1 ? 'Jour' : 'Jours'}
                          </div>
                          <div className="text-xs text-blue-200/80">
                            sans accident
                          </div>
                          <div className="text-xs text-blue-300/70">
                            interne
              </div>
            </div>
            
                        {/* Indicateur de performance */}
                        <div className="flex items-center gap-1 mt-1 sm:mt-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                          <span className="text-xs text-green-300 font-medium">
                            {safetyData.appreciation_sar}
                          </span>
          </div>
        </div>

                      {/* Compteur EE */}
                      <div className="flex flex-col justify-center items-center space-y-1 sm:space-y-2 lg:space-y-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 border border-emerald-400/30 backdrop-blur-sm group-hover:from-emerald-500/30 group-hover:to-emerald-600/40 transition-all duration-500 min-h-[100px] sm:min-h-[120px] lg:min-h-[140px]">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-emerald-300" />
                          <span className="text-xs sm:text-sm font-semibold text-emerald-200 uppercase tracking-wide">
                            EE
                          </span>
                        </div>
                        
                        <div className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-white mb-1 sm:mb-2 transition-all duration-1000 drop-shadow-2xl ${
                          isAnimating ? 'scale-110' : 'scale-100'
                        }`}>
                          {safetyData.daysWithoutIncidentEE}
      </div>
                        
                        <div className="text-center space-y-0.5 sm:space-y-1">
                          <div className="text-xs sm:text-sm lg:text-base font-bold text-emerald-100">
                            {safetyData.daysWithoutIncidentEE === 1 ? 'Jour' : 'Jours'}
                          </div>
                          <div className="text-xs text-emerald-200/80">
                            sans accident
                          </div>
                          <div className="text-xs text-emerald-300/70">
                            externe
                          </div>
                        </div>
                        
                        {/* Indicateur de performance */}
                        <div className="flex items-center gap-1 mt-1 sm:mt-2">
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
                          <span className="text-xs text-green-300 font-medium">
                            {safetyData.appreciation_ee}
                          </span>
                        </div>
                      </div>
                    </div>

              </CardContent>
            </Card>
              )}
              </div>
            </div>

            {/* Services de Sécurité à droite */}
            <div className="order-2 lg:order-2">
              <div className="max-w-4xl w-full">
                {/* En-tête des services */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Nos Services de Sécurité
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Le Département Sécurité et contrôle veille à l'intégrité physique des collaborateurs, 
                    des équipements et de l'environnement.
                  </p>
                </div>

                {/* Grille des 4 services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Service Sécurité */}
                  <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-500 border-0 bg-gradient-to-br from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/70">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Shield className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-red-700 transition-colors duration-300">
                            Service Sécurité
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Évaluer les risques, surveiller les activités, prévenir les incidents et accidents. 
                            Communication et exercices de simulation d'urgence.
                          </p>
                        </div>
                      </div>
              </CardContent>
            </Card>

                  {/* Service Inspection */}
                  <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-500 border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/70">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <CheckCircle className="h-4 w-4 text-white" />
                </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-orange-700 transition-colors duration-300">
                            Service Inspection
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Contrôle des équipements sous pression, plans d'inspection, conformité réglementaire 
                            et expertise technique.
                          </p>
                        </div>
                      </div>
              </CardContent>
            </Card>

                  {/* Service Environnement */}
                  <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-500 border-0 bg-gradient-to-br from-slate-50 to-slate-100/50 hover:from-slate-100 hover:to-slate-200/70">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <Globe className="h-4 w-4 text-white" />
                </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-slate-700 transition-colors duration-300">
                            Service Environnement
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Évaluation des impacts environnementaux, conformité réglementaire, gestion des déchets 
                            et exercices anti-pollution.
                          </p>
                        </div>
                      </div>
              </CardContent>
            </Card>

                  {/* Service Sûreté */}
                  <Card className="group hover:shadow-2xl hover:scale-105 transition-all duration-500 border-0 bg-gradient-to-br from-red-50/70 to-orange-50/70 hover:from-red-100/80 hover:to-orange-100/80">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <AlertTriangle className="h-4 w-4 text-white" />
                </div>
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-gray-900 mb-1 group-hover:text-red-700 transition-colors duration-300">
                            Service Sûreté
                          </h4>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Surveillance permanente, gestion des accès, contrôle des entrées/sorties 
                            et coordination avec les forces de sécurité.
                          </p>
                        </div>
                      </div>
              </CardContent>
            </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Restaurant Section - Menu de la Semaine */}
      <section id="restaurant" className="py-20 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 transition-all duration-500 ease-out group hover:from-slate-200 hover:via-gray-200 hover:to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête de section */}
          <div className="text-center mb-16 scroll-animate group-hover:scale-105 transition-transform duration-500 ease-out">
            <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-700 border-orange-200">
              <Utensils className="w-3 h-3 mr-1" />
              Restauration
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4 text-gray-900">
              Menu de la Semaine
              </h2>
            <p className="text-xl text-gray-600 text-pretty max-w-3xl mx-auto mb-6">
              Découvrez les délicieux plats préparés par nos chefs pour cette semaine. 
              Cuisine sénégalaise et européenne au choix.
            </p>
            
            {/* Bouton d'accès au formulaire de gestion pour le personnel du restaurant */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={showMenuForm ? () => setShowMenuForm(false) : openMenuAuth}
                variant="outline"
                className="bg-white/80 hover:bg-orange-50 border-orange-200 text-orange-700 hover:text-orange-800 hover:border-orange-300 transition-all duration-300 hover:scale-105"
              >
                <Settings className="w-4 h-4 mr-2" />
                {showMenuForm ? 'Masquer la gestion' : 'Gérer le menu'}
              </Button>
            </div>
          </div>

          {/* Formulaire de gestion du menu pour le personnel du restaurant */}
          {showMenuForm && (
            <div className="mb-12">
              <RestaurantMenuForm />
            </div>
          )}

          {/* Menu de la Semaine exact */}
          <div className="flex justify-center">
            <div className="max-w-6xl w-full">
              {/* Gestion des états de chargement et d'erreur */}
              {menuLoading ? (
                <Card className="min-h-[24rem] max-h-[32rem] sm:h-[28rem] bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
                  {/* Effet de brillance subtil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Icônes décoratives */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  
                  <CardHeader className="pb-4 flex-shrink-0 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-slate-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-slate-200 group-hover:scale-110 transition-all duration-300">
                          <ChefHat className="h-6 w-6 text-white" />
                  </div>
                  <div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                            🍽️ Menu de la Semaine
                          </CardTitle>
                          <p className="text-sm text-gray-600 font-medium">
                            Préparation en cours...
                          </p>
                  </div>
                </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex items-center justify-center p-8 relative z-10">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">🍳 Cuisine en action</h3>
                        <p className="text-sm text-gray-600">Nos chefs préparent le menu de la semaine...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : menuError ? (
                <Card className="min-h-[24rem] max-h-[32rem] sm:h-[28rem] bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
                  {/* Effet de brillance subtil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Icônes décoratives */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  
                  <CardHeader className="pb-4 flex-shrink-0 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-slate-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-slate-200 group-hover:scale-110 transition-all duration-300">
                          <ChefHat className="h-6 w-6 text-white" />
                  </div>
                  <div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                            🍽️ Menu de la Semaine
                          </CardTitle>
                          <p className="text-sm text-gray-600 font-medium">
                            Problème de connexion
                          </p>
                  </div>
                </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex items-center justify-center p-8 relative z-10">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-4xl">⚠️</span>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">❌ Erreur de chargement</h3>
                        <p className="text-sm text-gray-600 mb-4">{menuError}</p>
                        <Button 
                          onClick={() => fetchWeekMenu()}
                          className="bg-gradient-to-r from-slate-500 to-blue-600 hover:from-slate-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          size="sm"
                        >
                          <span className="flex items-center gap-2">
                            🔄 Réessayer
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : !weekMenu || !weekMenu.days || weekMenu.days.length === 0 ? (
                <Card className="min-h-[24rem] max-h-[32rem] sm:h-[28rem] bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
                  {/* Effet de brillance subtil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Icônes décoratives */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  
                  <CardHeader className="pb-4 flex-shrink-0 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-slate-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-slate-200 group-hover:scale-110 transition-all duration-300">
                          <ChefHat className="h-6 w-6 text-white" />
                  </div>
                  <div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                            🍽️ Menu de la Semaine
                          </CardTitle>
                          <p className="text-sm text-gray-600 font-medium">
                            Aucun menu disponible
                          </p>
                  </div>
                </div>
              </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex items-center justify-center p-8 relative z-10">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-4xl">🍽️</span>
            </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">📅 Menu en préparation</h3>
                        <p className="text-sm text-gray-600">Aucun menu disponible pour cette semaine. Revenez bientôt !</p>
                  </div>
                  </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="min-h-[20rem] max-h-[28rem] sm:min-h-[24rem] sm:max-h-[32rem] sm:h-[28rem] bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 border-0 hover:shadow-2xl hover:scale-105 transition-all duration-500 cursor-pointer group flex flex-col overflow-hidden relative">
                  {/* Effet de brillance subtil */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-200/40 via-transparent to-blue-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Icônes décoratives */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-400 to-blue-500 rounded-full flex items-center justify-center opacity-60 group-hover:opacity-80 transition-opacity duration-300">
                    <ChefHat className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-300">
                    <Utensils className="h-6 w-6 text-white" />
                  </div>
                  
                  <CardHeader className="pb-4 flex-shrink-0 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 bg-gradient-to-br from-slate-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-slate-200 group-hover:scale-110 transition-all duration-300">
                          <ChefHat className="h-6 w-6 text-white" />
                </div>
                        <div>
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                            🍽️ Menu de la Semaine
                          </CardTitle>
                          <p className="text-sm text-gray-600 font-medium">
                            Restaurant SAR • 12h-14h
                          </p>
              </div>
            </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 overflow-hidden relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-2 sm:gap-3 h-full overflow-y-auto custom-scrollbar pr-2 menu-grid-responsive">
                      {getWeekDays().map((dayInfo, index) => {
                        const dayMenu = weekMenu.days.find(menu => menu.day === dayInfo.day)
                        const senegaleseInfo = getCuisineInfo('senegalese')
                        const europeanInfo = getCuisineInfo('european')
                        
                        return (
                          <div 
                            key={dayInfo.day} 
                            className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-slate-400 hover:bg-white/90 hover:shadow-lg transition-all duration-300 group/day overflow-hidden min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px]"
                          >
                            {/* En-tête du jour avec gradient */}
                            <div className="bg-gradient-to-br from-slate-100 via-gray-100 to-blue-100 p-2 sm:p-3 text-gray-900 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
                              <div className="absolute bottom-0 left-0 w-8 h-8 bg-white/10 rounded-full translate-y-4 -translate-x-4"></div>
                              <div className="relative z-10">
                                <h3 className="font-bold text-base sm:text-lg text-center group-hover/day:scale-105 transition-transform duration-300">
                                  {dayInfo.dayName}
                                </h3>
                                <p className="text-gray-600 text-xs sm:text-sm text-center font-medium">
                                  {formatFullDate(dayInfo.date)}
                                </p>
                              </div>
                            </div>

                            {/* Trait de séparation */}
                            <div className="border-t-2 border-slate-400"></div>

                            {/* Contenu du jour */}
                            <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                              {dayMenu ? (
                                // Restaurant ouvert - Afficher les plats
                                <>
                                  {/* Plat sénégalais */}
                                  <div className="space-y-1 sm:space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${senegaleseInfo.color} shadow-sm`}></div>
                                      <span className={`text-xs font-bold ${senegaleseInfo.textColor} flex items-center gap-1`}>
                                        <span className="text-xs">{senegaleseInfo.emoji}</span>
                                        {senegaleseInfo.name}
                                      </span>
                                    </div>
                                    <div className={`${senegaleseInfo.bgColor} ${senegaleseInfo.borderColor} border rounded-lg p-2 group-hover/day:scale-105 transition-transform duration-300`}>
                                      <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
                                        {dayMenu.senegalese.name}
                                      </p>
                                      {dayMenu.senegalese.description && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {dayMenu.senegalese.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Plat européen */}
                                  <div className="space-y-1 sm:space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${europeanInfo.color} shadow-sm`}></div>
                                      <span className={`text-xs font-bold ${europeanInfo.textColor} flex items-center gap-1`}>
                                        <span className="text-xs">{europeanInfo.emoji}</span>
                                        {europeanInfo.name}
                                      </span>
                                    </div>
                                    <div className={`${europeanInfo.bgColor} ${europeanInfo.borderColor} border rounded-lg p-2 group-hover/day:scale-105 transition-transform duration-300`}>
                                      <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
                                        {dayMenu.european.name}
                                      </p>
                                      {dayMenu.european.description && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {dayMenu.european.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </>
                              ) : (
                                // Menu non renseigné - Afficher l'indicateur
                                <div className="space-y-2 sm:space-y-3">
                                  {/* Indicateur de menu non renseigné */}
                                  <div className="space-y-1 sm:space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 shadow-sm"></div>
                                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                                        <span className="text-xs">📝</span>
                                        Menu non renseigné
                                      </span>
                                    </div>
                                    <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200 rounded-lg p-2 sm:p-3 group-hover/day:scale-105 transition-transform duration-300">
                                      <div className="flex flex-col items-center justify-center space-y-1 sm:space-y-1.5">
                                        <div className="w-8 h-8 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center">
                                          <span className="text-sm">📝</span>
                                        </div>
                                        <div className="text-center">
                                          <h4 className="text-xs font-semibold text-slate-700 mb-1">
                                            Menu en attente
                                          </h4>
                                          <p className="text-xs text-slate-500 leading-relaxed">
                                            Menu non renseigné
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal d'authentification pour la gestion du menu */}
      {showMenuAuth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Accès à la gestion du menu
              </h3>
              <p className="text-gray-600">
                Veuillez saisir le code d'accès pour gérer le menu du restaurant.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="auth-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Code d'accès
                </label>
                <input
                  id="auth-code"
                  type="password"
                  value={menuAuthCode}
                  onChange={(e) => setMenuAuthCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleMenuAuth()}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="Saisissez le code d'accès"
                  autoFocus
                />
                {menuAuthError && (
                  <p className="text-red-600 text-sm mt-2">{menuAuthError}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  onClick={handleMenuAuth}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={!menuAuthCode.trim()}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accéder
                </Button>
                <Button
                  onClick={closeMenuAuth}
                  variant="outline"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 text-center">
                <Shield className="w-3 h-3 inline mr-1" />
                Accès réservé au personnel du restaurant
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-slate-50/50 to-red-50/30 transition-all duration-500 ease-out group hover:from-slate-200 hover:to-red-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-animate group-hover:scale-105 transition-transform duration-500 ease-out">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              <Settings className="w-3 h-3 mr-1" />
              Services
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4 text-gray-900">Nos fonctionnalités principales</h2>
            <p className="text-xl text-gray-600 text-pretty max-w-2xl mx-auto">
              Une suite complète d'outils conçus pour améliorer la collaboration et l'efficacité de votre organisation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group card-hover scroll-animate scroll-animate-delay-1 border-0 bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-red-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-500">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-200 transition-all duration-500 group-hover:scale-110">
                  <Newspaper className="w-6 h-6 text-red-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Actualités & Publications</h3>
                <p className="text-gray-600 leading-relaxed">
                  Restez informé des dernières actualités de la SAR, publications internes et annonces importantes avec filtres par catégorie et département.
                </p>
              </CardContent>
            </Card>

            <Card className="group card-hover scroll-animate scroll-animate-delay-2 border-0 bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-orange-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-500">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-all duration-500 group-hover:scale-110">
                  <Users className="w-6 h-6 text-orange-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Organigramme & Annuaire</h3>
                <p className="text-gray-600 leading-relaxed">
                  Explorez la structure organisationnelle de la SAR et accédez à l'annuaire complet des employés avec informations de contact.
                </p>
              </CardContent>
            </Card>

            <Card className="group card-hover scroll-animate scroll-animate-delay-3 border-0 bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-red-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-500">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-200 transition-all duration-500 group-hover:scale-110">
                  <MessageSquare className="w-6 h-6 text-red-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Réseau Social & Chat</h3>
                <p className="text-gray-600 leading-relaxed">
                  Communiquez en temps réel avec vos collègues via le chat intégré et participez aux discussions du forum interne.
                </p>
              </CardContent>
            </Card>

            <Card className="group card-hover scroll-animate scroll-animate-delay-4 border-0 bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-orange-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-500">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-all duration-500 group-hover:scale-110">
                  <FileText className="w-6 h-6 text-orange-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Gestion Documentaire</h3>
                <p className="text-gray-600 leading-relaxed">
                  Centralisez et organisez tous vos documents professionnels avec un système de recherche avancé et de classification.
                </p>
              </CardContent>
            </Card>

            <Card className="group card-hover scroll-animate scroll-animate-delay-5 border-0 bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-red-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-500">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-200 transition-all duration-500 group-hover:scale-110">
                  <Shield className="w-6 h-6 text-red-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Centre de Contrôle</h3>
                <p className="text-gray-600 leading-relaxed">
                  Gérez le contenu, les utilisateurs, les événements et surveillez l'activité de la plateforme avec des outils d'administration complets.
                </p>
              </CardContent>
            </Card>

            <Card className="group card-hover scroll-animate scroll-animate-delay-6 border-0 bg-white/90 backdrop-blur-sm shadow-lg ring-1 ring-orange-100/50 hover:shadow-2xl hover:scale-105 transition-all duration-500">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-200 transition-all duration-500 group-hover:scale-110">
                  <BarChart3 className="w-6 h-6 text-orange-600 transition-all duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Métriques & Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Suivez les performances de la plateforme, analysez l'engagement des utilisateurs et générez des rapports détaillés.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-700 text-white scroll-animate">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-6">
              Prêt à transformer votre façon de collaborer ?
          </h2>
          <p className="text-xl text-red-100 text-pretty mb-8 max-w-2xl mx-auto">
              L'intranet SAR vous rapproche de vos collègues, simplifie vos échanges et vous aide à gagner en efficacité chaque jour.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6 bg-white text-red-600 hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            asChild
          >
            <Link href="/login">
                Accéder à l'intranet
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="border-t border-red-200/50 bg-gradient-to-br from-slate-50 to-red-50/20 scroll-animate">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-10 flex items-center justify-center">
                  <img 
                    src="/sarlogo.png" 
                    alt="SAR Logo" 
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">SAR Intranet</span>
                  <p className="text-sm text-red-600 font-medium">Société Africaine de Raffinage</p>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed max-w-md">
                La plateforme intranet SAR qui transforme la collaboration en entreprise avec des outils intuitifs et
                sécurisés, dédiés à la Société Africaine de Raffinage.
              </p>
                </div>
            
            {/* Informations de contact à droite */}
            <div className="space-y-6">
              {/* Adresses et Téléphones côte à côte */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Adresses */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-lg">Adresses</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-start space-x-3">
                      <Building2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900">Siège :</span> 15 Bd de la République
                </div>
              </div>
                    <div className="flex items-start space-x-3">
                      <Building2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
                        <span className="font-medium text-gray-900">Usine :</span> Km 18, Route de Rufisque
            </div>
                    </div>
                  </div>
                </div>

                {/* Téléphones */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-lg">Téléphone</h4>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span><span className="font-medium text-gray-900">Tel :</span> (221) 33 839 84 39</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <span><span className="font-medium text-gray-900">Fax :</span> (221) 33 821 10 10</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span><span className="font-medium text-gray-900">Num-vert :</span> 800 00 34 34</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-red-200 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; 2025 SAR Intranet - Société Africaine de Raffinage. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
