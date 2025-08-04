import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { customPrismaAdapter } from './prisma-adapter'
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: customPrismaAdapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔐 Credentials provider called with:', credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          console.log('❌ User not found:', credentials.email)
          return null
        }

        console.log('✅ User found:', user.email, 'Role:', user.role)

        // Check if user has a password (not OAuth user)
        if (user.password === 'oauth_user') {
          console.log('❌ User is OAuth user, cannot login with credentials')
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          console.log('❌ Password invalid for user:', user.email)
          return null
        }

        console.log('✅ Password valid for user:', user.email)

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          image: user.profilePicture
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      console.log('🔐 SignIn callback called with:', {
        provider: account?.provider,
        email: user?.email,
        hasCredentials: !!credentials
      })

      // Allow Google OAuth
      if (account?.provider === 'google') {
        console.log('✅ Allowing Google OAuth sign in')
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        })

        // Prevent admin users from logging in via Google OAuth
        if (existingUser && (existingUser.role === 'ADMIN' || existingUser.role === 'LMS_ADMIN')) {
          console.log('❌ Admin user cannot login via Google OAuth:', user.email)
          return false
        }

        console.log('✅ OAuth user allowed:', user.email)
        return true
      }

      // Allow credentials login (for admin users)
      if (credentials) {
        console.log('✅ Allowing credentials sign in')
        return true
      }

      console.log('❌ Denying sign in - no valid provider')
      return false
    },
    async redirect({ url, baseUrl }: any) {
      // If there's a specific callback URL, respect it
      if (url.startsWith('/')) {
        const redirectUrl = `${baseUrl}${url}`
        return redirectUrl
      }
      else if (new URL(url).origin === baseUrl) {
        return url
      }

      // Default redirection logic
      const defaultUrl = baseUrl + '/dashboard'
      return defaultUrl
    },
    async session({ session, token }: any) {
      console.log('🔐 Session callback called with:', { 
        hasSession: !!session, 
        hasToken: !!token,
        sessionUser: session?.user?.email,
        tokenId: token?.id,
        tokenRole: token?.role
      })
      
      // Add user ID and role to session from token
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string || 'STUDENT'
        console.log('✅ Updated session with token data:', { id: session.user.id, role: session.user.role })
      }
      return session
    },
    async jwt({ token, user }: any) {
      console.log('🔐 JWT callback called with:', { 
        hasUser: !!user, 
        userId: user?.id, 
        userRole: user?.role,
        tokenId: token?.id,
        tokenRole: token?.role
      })
      
      if (user) {
        token.id = user.id
        token.role = user.role || 'STUDENT'
        console.log('✅ Updated token with user data:', { id: token.id, role: token.role })
      }
      return token
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/login', // Redirect to login on error
  },
  session: {
    strategy: 'jwt' as const,
  },
  debug: process.env.NODE_ENV === 'development',
}
