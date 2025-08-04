import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

// Create a custom adapter that extends the default PrismaAdapter
const defaultAdapter = PrismaAdapter(prisma)

export const customPrismaAdapter = {
  ...defaultAdapter,
  createUser: async (data: any) => {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      console.log('User already exists:', existingUser.id)
      return existingUser
    }

    // Generate required fields for new users
    const userData = {
      ...data,
      fullName: data.name || data.email?.split('@')[0] || 'User',
      mobileNumber: '0000000000', // Default mobile number
      hsscId: `GOOGLE_${Date.now()}`, // Generate unique HSSC ID
      password: 'oauth_user', // OAuth users get a default password
      role: 'STUDENT', // Default role, can be changed during registration
      instituteName: 'Default Institute', // Default institute name
      instituteCategory: 'OTHER', // Default category
      pincode: '000000', // Default pincode
      isActive: true,
      emailVerified: true,
    }

    console.log('Creating user with data:', userData)

    try {
      const user = await prisma.user.create({
        data: userData,
      })
      console.log('User created successfully:', user.id)
      return user
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },
}
