"use client"

interface Video {
  id: number
  title: string
  url: string
  description: string
}

interface SecurityMarqueeProps {
  videos: Video[]
  hasQuiz: boolean
  hasPdfs?: boolean
  speed?: number // pixels per second
  direction?: "left" | "right"
}

export function SecurityMarquee({
  videos,
  hasQuiz,
  hasPdfs = false,
  speed = 30,
  direction = "left"
}: SecurityMarqueeProps) {
  // Construire le message avec instructions par étapes
  const buildMessage = () => {
    const steps: string[] = []
    let stepNumber = 1
    
    // Étape 1: Vidéo Institutionnelle SAR
    const institutionVideo = videos.find(v => v.title.toLowerCase().includes("institutionnelle"))
    if (institutionVideo) {
      steps.push(`${stepNumber}) Visionnez la vidéo institutionnelle SAR`)
      stepNumber++
    }
    
    // Étape 2: Vidéo Sécurité
    const securityVideo = videos.find(v => 
      v.title.toLowerCase().includes("sécurité") || 
      v.title.toLowerCase().includes("securité") ||
      v.title.toLowerCase().includes("formation sécurité")
    )
    if (securityVideo) {
      steps.push(`${stepNumber}) Veuillez visionner la vidéo de sécurité de la SAR`)
      stepNumber++
    }
    
    // Étape 3: PDF
    steps.push(`${stepNumber}) Lisez les PDF sur la sécurité et le règlement intérieur de la SAR`)
    stepNumber++
    
    // Étape 4: Quiz
    if (hasQuiz) {
      steps.push(`${stepNumber}) Répondez aux quiz`)
      stepNumber++
    }
    
    // Étape 5: Recommandation
    if (hasQuiz) {
      steps.push(`${stepNumber}) Si vous n'avez pas un score parfait, veuillez recommencer pour vous améliorer`)
    }
    
    return steps.join(" • ")
  }

  const message = buildMessage()
  
  // Dupliquer le message plusieurs fois pour un défilement fluide sans saccade
  const duplicatedMessage = Array(5).fill(message).join(" • ")

  return (
    <div className="w-full text-white overflow-hidden relative shadow-md rounded-lg" style={{backgroundColor: "rgb(52, 66, 87)"}}>
      {/* Bande défilante */}
      <div className="relative h-12 xs:h-14 sm:h-16 md:h-20 overflow-hidden">
        <div
          className={`absolute whitespace-nowrap flex items-center h-full security-marquee-${direction}`}
          style={{
            animationDuration: `${Math.max(40, 120 - speed)}s`,
            willChange: 'transform'
          }}
        >
          <span className="text-base xs:text-lg sm:text-xl md:text-2xl font-semibold px-1 xs:px-2 sm:px-3">
            {duplicatedMessage}
          </span>
        </div>
      </div>
    </div>
  )
}

