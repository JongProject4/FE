// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

// Kakao custom provider
const KakaoProvider = {
  id: 'kakao',
  name: '카카오',
  type: 'oauth' as const,
  authorization: {
    url: 'https://kauth.kakao.com/oauth/authorize',
    params: { scope: 'profile_nickname profile_image account_email' },
  },
  token: 'https://kauth.kakao.com/oauth/token',
  userinfo: 'https://kapi.kakao.com/v2/user/me',
  clientId: process.env.KAKAO_CLIENT_ID!,
  clientSecret: process.env.KAKAO_CLIENT_SECRET!,
  profile(profile: any) {
    return {
      id: String(profile.id),
      name: profile.kakao_account?.profile?.nickname,
      email: profile.kakao_account?.email,
      image: profile.kakao_account?.profile?.profile_image_url,
    }
  },
}

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
    KakaoProvider,
    CredentialsProvider({
      id: 'credentials',
      name: 'Guest Login',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "test@example.com" },
      },
      async authorize(credentials) {
        // Simple guest login
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
    async signIn({ user, account }) {
      if (!user.email) return false
      if (account?.provider === 'credentials') return true // Allow guest login

      try {
        // Upsert user — auto-register if new
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name,
            image: user.image,
            provider: account?.provider ?? 'unknown',
            provider_id: account?.providerAccountId,
          },
          create: {
            email: user.email,
            name: user.name,
            image: user.image,
            provider: account?.provider ?? 'unknown',
            provider_id: account?.providerAccountId,
          },
        })
        return true
      } catch (err) {
        console.error('[Auth] signIn error:', err)
        // Even if DB fails, let's allow login during dev if needed? 
        // No, let's keep it safe but allow credentials to pass.
        return false
      }
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      if (session.user?.email && token.id !== 'guest_user_id') {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true, email: true, image: true },
          })
          if (dbUser) {
            session.user = { ...session.user, ...dbUser, id: dbUser.id } as any
          }
        } catch (err) {
          console.error('[Auth] session error:', err)
        }
      }
      return session
    },

    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },

    async redirect({ url, baseUrl }) {
      // After login → go to chat
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

// Extend session types
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
