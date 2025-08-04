import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Get the session to verify the user is authenticated
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      fullName,
      mobileNumber,
      instituteName,
      instituteCategory,
      pincode,
      gender,
      role
    } = body

    // Validate required fields
    if (!fullName || !mobileNumber || !instituteName || !pincode || !role) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Validate role
    if (!['STUDENT', 'TEACHER'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be STUDENT or TEACHER' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (existingUser) {
      // Update existing user with new information
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          fullName,
          mobileNumber,
          instituteName,
          instituteCategory,
          pincode,
          gender: gender || null,
          role,
          emailVerified: true,
          isActive: true,
          // Generate a unique HSSC ID if not exists
          hsscId: existingUser.hsscId || `GOOGLE_${Date.now()}`,
          // Generate a random password for OAuth users
          password: existingUser.password || crypto.randomBytes(32).toString('hex'),
          // Update NextAuth fields
          name: fullName,
          image: session.user.image || null
        }
      })

      return NextResponse.json({
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          role: updatedUser.role
        }
      })
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email: session.user.email,
          fullName,
          mobileNumber,
          instituteName,
          instituteCategory,
          pincode,
          gender: gender || null,
          role,
          hsscId: `GOOGLE_${Date.now()}`,
          password: crypto.randomBytes(32).toString('hex'), // Random password for OAuth users
          emailVerified: true,
          isActive: true,
          // NextAuth fields
          name: fullName,
          image: session.user.image || null
        }
      })

      return NextResponse.json({
        message: 'Registration completed successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role
        }
      })
    }
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    )
  }
}
