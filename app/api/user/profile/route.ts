import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get token using NextAuth JWT
    const token = await getToken({ req: request })

    if (!token || !token.id) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        instituteName: true,
        instituteCategory: true,
        hsscId: true,
        mobileNumber: true,
        pincode: true,
        gender: true,
        dateOfBirth: true,
        alternateEmail: true,
        address: true,
        profilePicture: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: 'User account is deactivated' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get token using NextAuth JWT
    const token = await getToken({ req: request })

    if (!token || !token.id) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    const updateData = await request.json()

    // Update user profile
    const user = await prisma.user.update({
      where: { id: token.id as string },
      data: {
        fullName: updateData.fullName,
        mobileNumber: updateData.mobileNumber,
        address: updateData.address,
        pincode: updateData.pincode,
        alternateEmail: updateData.alternateEmail,
        gender: updateData.gender,
        dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        instituteName: true,
        instituteCategory: true,
        hsscId: true,
        mobileNumber: true,
        pincode: true,
        gender: true,
        dateOfBirth: true,
        alternateEmail: true,
        address: true,
        profilePicture: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
