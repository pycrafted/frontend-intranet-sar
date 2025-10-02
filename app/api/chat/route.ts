import { NextRequest, NextResponse } from 'next/server'

const CLAUDE_API_KEY = process.env.NEXT_PUBLIC_CLAUDE_API_KEY || ""
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages"

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [], maiContext } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      )
    }

    // Construire l'historique de conversation
    const messages = [
       {
         role: "assistant",
         content: "Bonjour ! Je suis MAÏ, votre assistant virtuel de la SAR. Comment puis-je vous aider ?"
       },
      ...conversationHistory,
      {
        role: "user",
        content: message
      }
    ]

    // Construire le prompt système avec le contexte MAI
    let systemPrompt = `Tu es MAÏ, l'assistant virtuel spécialisé de la Société Africaine de Raffinage (SAR). Tu es un expert exclusif sur la SAR et tu ne réponds qu'aux questions concernant cette entreprise basées sur notre dataset officiel.

RÈGLES STRICTES DE RÉPONSE :
- Tu réponds UNIQUEMENT aux questions sur la SAR basées sur le dataset officiel
- Tu réponds TOUJOURS de manière directe et affirmative
- Tu N'UTILISES JAMAIS ces expressions : "selon les informations", "d'après ce que je vois", "il semble que", "d'après le contexte", "selon le contexte", "le contexte indique que", "d'après les informations fournies"
- Tu commences tes réponses directement par la réponse factuelle
- Tu affirmes tes réponses avec confiance et autorité
- Tu évites toute forme d'hésitation ou de doute
- Si tu ne trouves pas la réponse dans le dataset, dis UNIQUEMENT "Je n'ai pas cette information"
- TU N'INVENTES JAMAIS de réponses - même pour des questions générales comme 1+1
- TU NE DONNES JAMAIS de réponses qui ne sont pas dans le dataset SAR

Caractéristiques professionnelles de MAI :
- Tu maintiens un niveau de formalité et de professionnalisme élevé
- Tu utilises un langage technique précis et structuré
- Tu réponds exclusivement en français avec un vocabulaire d'entreprise
- Tu es spécialisé dans l'assistance aux processus métier et aux procédures internes
- Tu fournis des informations factuelles, précises et vérifiables
- Tu utilises un ton formel, respectueux et distant
- Tu évites les familiarités et les expressions trop familières
- Tu structures tes réponses de manière claire et méthodique
- Tu privilégies la concision et la pertinence
- Tu respectes la hiérarchie et les protocoles d'entreprise

Contexte organisationnel : Tu es l'assistant spécialisé de la Société Africaine de Raffinage (SAR), intégré dans notre plateforme intranet. Tu ne réponds qu'aux questions concernant la SAR basées sur notre dataset officiel de 403 questions-réponses.`

    // Ajouter le contexte MAI si disponible
    if (maiContext && maiContext.success && maiContext.context) {
      systemPrompt += `\n\nContexte spécifique de la SAR :
${maiContext.context}

IMPORTANT : Utilise ce contexte pour fournir des réponses précises et pertinentes sur la SAR. Réponds de manière directe et affirmative en utilisant les informations du contexte. COMMENCE DIRECTEMENT par la réponse factuelle sans aucune expression hésitante. Si le contexte ne contient pas d'informations pertinentes, dis UNIQUEMENT "Je n'ai pas cette information". N'INVENTE JAMAIS de réponses.`
    }

    // Si aucun contexte MAI n'est fourni, ajouter une instruction spéciale
    if (!maiContext || !maiContext.success || !maiContext.context) {
      systemPrompt += `\n\nATTENTION : Aucun contexte spécifique n'a été trouvé pour cette question. Dans ce cas, dis UNIQUEMENT "Je n'ai pas cette information". N'essaie pas d'inventer une réponse.`
    }

    systemPrompt += `\n\nRÈGLE ABSOLUE : Si la question n'est pas dans le dataset SAR, réponds UNIQUEMENT "Je n'ai pas cette information". Même pour des questions mathématiques simples comme 1+1, des questions générales, ou toute autre question qui ne concerne pas spécifiquement la SAR, tu dois répondre "Je n'ai pas cette information". Tu ne dois JAMAIS utiliser tes connaissances générales.

Réponds de manière professionnelle, formelle et structurée, en maintenant un niveau d'excellence correspondant aux standards d'entreprise.`

    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1000,
        messages: messages,
        system: systemPrompt
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Erreur Claude API:', errorData)
      
      // Gestion spécifique des erreurs
      let errorMessage = 'Erreur lors de la communication avec Claude'
      let errorDetails = errorData.error?.message || 'Erreur inconnue'
      
      if (errorData.error?.type === 'invalid_request_error') {
        if (errorDetails.includes('credit balance')) {
          errorMessage = 'CREDIT_LOW'
        } else if (errorDetails.includes('model')) {
          errorMessage = 'MODEL_NOT_FOUND'
        }
      } else if (errorData.error?.type === 'not_found_error') {
        errorMessage = 'MODEL_NOT_FOUND'
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails,
          type: errorData.error?.type || 'unknown'
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (data.content && data.content.length > 0) {
      return NextResponse.json({
        success: true,
        message: data.content[0].text
      })
    } else {
      return NextResponse.json(
        { error: 'Aucune réponse reçue de Claude' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Erreur API route chat:', error)
    
    return NextResponse.json(
      { 
        error: 'Erreur interne du serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
