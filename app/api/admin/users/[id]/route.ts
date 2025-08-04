import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication using NextAuth
    const token = await getToken({ req: request })

    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin user exists and has admin role
    const adminUser = await prisma.user.findUnique({
      where: { id: token.id as string }
    })

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'LMS_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = params

    // Get the target user to view/edit/delete
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        hsscId: true,
        role: true,
        instituteName: true,
        instituteCategory: true,
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

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: targetUser })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication using NextAuth
    const token = await getToken({ req: request })

    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin user exists and has admin role
    const adminUser = await prisma.user.findUnique({
      where: { id: token.id as string }
    })

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'LMS_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()

    // Check if target user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Update target user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName: body.fullName,
        email: body.email,
        mobileNumber: body.mobileNumber,
        hsscId: body.hsscId,
        role: body.role,
        instituteName: body.instituteName,
        instituteCategory: body.instituteCategory,
        pincode: body.pincode,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        alternateEmail: body.alternateEmail,
        address: body.address,
        isActive: body.isActive,
        emailVerified: body.emailVerified,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        mobileNumber: true,
        hsscId: true,
        role: true,
        instituteName: true,
        instituteCategory: true,
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
      message: 'User updated successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin authentication using NextAuth
    const token = await getToken({ req: request })

    if (!token || !token.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin user exists and has admin role
    const adminUser = await prisma.user.findUnique({
      where: { id: token.id as string }
    })

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'LMS_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = params

    // Check if target user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent admin from deleting themselves
    if (id === adminUser.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete target user (this will also delete related records due to cascade)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
