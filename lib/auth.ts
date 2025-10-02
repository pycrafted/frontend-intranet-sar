import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { config } from "@/lib/config"

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth temporairement désactivé pour la production
    // GoogleProvider({
    //   clientId: config.oauth.google.clientId,
    //   clientSecret: config.oauth.google.clientSecret,
    //   authorization: {
    //     params: {
    //       scope: [
    //         'openid',
    //         'email',
    //         'profile',
    //         'https://www.googleapis.com/auth/gmail.readonly',
    //         'https://www.googleapis.com/auth/drive.readonly',
    //         'https://www.googleapis.com/auth/calendar.readonly',
    //       ].join(' '),
    //       access_type: 'offline',
    //       prompt: 'consent',
    //     },
    //   },
    // }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Vérifier si l'utilisateur a un compte Google valide
      if (account?.provider === 'google') {
        try {
          // Envoyer les données à notre backend Django
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/google/callback/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: account.access_token, // NextAuth.js gère déjà l'échange de code
              user_data: {
                id: profile?.sub,
                email: user.email,
                first_name: profile?.given_name,
                last_name: profile?.family_name,
                picture: user.image,
              }
            }),
          })

          if (response.ok) {
            const data = await response.json()
            // Stocker les informations utilisateur dans la session
            user.id = data.user.id
            user.google_id = data.user.google_id
            user.google_email = data.user.google_email
            user.google_avatar_url = data.user.google_avatar_url
            return true
          } else {
            console.error('Erreur backend:', await response.text())
            return false
          }
        } catch (error) {
          console.error('Erreur lors de la connexion Google:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      // Persister les données OAuth dans le token JWT
      if (account?.provider === 'google') {
        token.google_id = user?.google_id
        token.google_email = user?.google_email
        token.google_avatar_url = user?.google_avatar_url
        token.access_token = account.access_token
        token.refresh_token = account.refresh_token
      }
      return token
    },
    async session({ session, token }) {
      // Envoyer les propriétés du token à la session client
      if (token) {
        session.user.id = token.sub
        session.user.google_id = token.google_id
        session.user.google_email = token.google_email
        session.user.google_avatar_url = token.google_avatar_url
        session.access_token = token.access_token
        session.refresh_token = token.refresh_token
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: config.oauth.nextauth.secret,
}

// Types pour TypeScript
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      google_id?: string
      google_email?: string
      google_avatar_url?: string
    }
    access_token?: string
    refresh_token?: string
  }

  interface User {
    id: string
    google_id?: string
    google_email?: string
    google_avatar_url?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    google_id?: string
    google_email?: string
    google_avatar_url?: string
    access_token?: string
    refresh_token?: string
  }
}
