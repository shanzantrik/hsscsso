import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import type { AdapterAccount, AdapterUser } from '@auth/core/adapters'

// Create a custom adapter that extends the default PrismaAdapter
const defaultAdapter = PrismaAdapter(prisma)

export const customPrismaAdapter = {
  ...defaultAdapter,
  createUser: async (data: any): Promise<AdapterUser> => {
    console.log('🔐 Custom adapter createUser called with:', data)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      console.log('✅ User already exists:', existingUser.id)
      // Return only the fields that NextAuth expects (AdapterUser interface)
      return {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.fullName,
        image: existingUser.profilePicture,
        emailVerified: existingUser.emailVerified ? new Date() : null,
      }
    }

    // Generate required fields for new users
    const userData = {
      email: data.email,
      name: data.name,
      image: data.image,
      fullName: data.name || data.email?.split('@')[0] || 'User',
      mobileNumber: '0000000000',
      hsscId: `GOOGLE_${Date.now()}`,
      password: 'oauth_user',
      role: 'STUDENT',
      instituteName: 'Default Institute',
      instituteCategory: 'OTHER',
      pincode: '000000',
      isActive: true,
      emailVerified: true,
    }

    console.log('🆕 Creating new user with data:', userData)

    try {
      const user = await prisma.user.create({
        data: userData,
      })
      console.log('✅ User created successfully:', user.id)

      // Return only the fields that NextAuth expects (AdapterUser interface)
      return {
        id: user.id,
        email: user.email,
        name: user.fullName,
        image: user.profilePicture,
        emailVerified: user.emailVerified ? new Date() : null,
      }
    } catch (error) {
      console.error('❌ Error creating user:', error)
      throw error
    }
  },
  getUser: async (id: string): Promise<AdapterUser | null> => {
    console.log('🔐 Custom adapter getUser called with:', id)

    try {
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) {
        console.log('❌ User not found:', id)
        return null
      }

      console.log('✅ User found:', user.email)

      // Return only the fields that NextAuth expects (AdapterUser interface)
      return {
        id: user.id,
        email: user.email,
        name: user.fullName,
        image: user.profilePicture,
        emailVerified: user.emailVerified ? new Date() : null,
      }
    } catch (error) {
      console.error('❌ Error getting user:', error)
      return null
    }
  },
  getUserByEmail: async (email: string): Promise<AdapterUser | null> => {
    console.log('🔐 Custom adapter getUserByEmail called with:', email)

    try {
      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        console.log('❌ User not found by email:', email)
        return null
      }

      console.log('✅ User found by email:', user.email)

      // Return only the fields that NextAuth expects (AdapterUser interface)
      return {
        id: user.id,
        email: user.email,
        name: user.fullName,
        image: user.profilePicture,
        emailVerified: user.emailVerified ? new Date() : null,
      }
    } catch (error) {
      console.error('❌ Error getting user by email:', error)
      return null
    }
  },
  getUserByAccount: async (providerAccountId: { provider: string; providerAccountId: string }): Promise<AdapterUser | null> => {
    console.log('🔐 Custom adapter getUserByAccount called with:', providerAccountId)

    try {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: providerAccountId.provider,
            providerAccountId: providerAccountId.providerAccountId,
          },
        },
        include: {
          user: true,
        },
      })

      if (!account || !account.user) {
        console.log('❌ Account or user not found:', providerAccountId)
        return null
      }

      console.log('✅ User found by account:', account.user.email)

      // Return only the fields that NextAuth expects (AdapterUser interface)
      return {
        id: account.user.id,
        email: account.user.email,
        name: account.user.fullName,
        image: account.user.profilePicture,
        emailVerified: account.user.emailVerified ? new Date() : null,
      }
    } catch (error) {
      console.error('❌ Error getting user by account:', error)
      return null
    }
  },
  linkAccount: async (data: any): Promise<void> => {
    console.log('🔐 Custom adapter linkAccount called with:', {
      userId: data.userId,
      provider: data.provider,
      providerAccountId: data.providerAccountId
    })

    try {
      await prisma.account.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token,
          access_token: data.access_token,
          expires_at: data.expires_at,
          token_type: data.token_type,
          scope: data.scope,
          id_token: data.id_token,
          session_state: data.session_state,
        },
      })
      console.log('✅ Account linked successfully')
    } catch (error) {
      console.error('❌ Error linking account:', error)
      throw error
    }
  },
}
