// Configuration de l'application
export const config = {
  claude: {
    apiKey: process.env.NEXT_PUBLIC_CLAUDE_API_KEY,
    apiUrl: "https://api.anthropic.com/v1/messages",
    model: "claude-3-haiku-20240307",
    maxTokens: 1000,
    maxHistory: 10
  },
  backend: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://backend-intranet-sar-1.onrender.com/api"
  },
  chatbot: {
    name: "MAI",
    description: "Assistant virtuel spécialisé SAR",
    welcomeMessage: "Bonjour ! Je suis MAÏ, votre assistant virtuel de la SAR. Comment puis-je vous aider ?"
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "1097497114713-d41if19v9680foj5rk6su0vdbm8708bd.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    nextauth: {
      url: process.env.NEXTAUTH_URL || "http://localhost:3000",
      secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",
    }
  }
}