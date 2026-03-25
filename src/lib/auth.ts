// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy',
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || 'dummy',
      clientSecret: process.env.APPLE_CLIENT_SECRET || 'dummy',
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Guest Login',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "test@example.com" },
      },
      async authorize(credentials) {
        return {
          id: 'guest_user_id',
          name: 'Guest User',
          email: credentials?.email || 'guest@example.com',
          image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false
      return true
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || 'user-id'
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url
      return `${baseUrl}/chat`
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    }
  }
}
