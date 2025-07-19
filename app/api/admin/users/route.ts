import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { verifyAccessToken } from '@/lib/auth'

const prisma = new PrismaClient()

// Verify JWT token and check admin role
async function verifyAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !['ADMIN', 'LMS_ADMIN'].includes(user.role)) {
      return null
    }

    return user
  } catch (error) {
    return null
  }
}

// GET - Fetch all users with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const institute = searchParams.get('institute') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { hsscId: { contains: search, mode: 'insensitive' } },
        { instituteName: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role) {
      where.role = role
    }

    if (institute) {
      where.instituteCategory = institute
    }

    if (status === 'ACTIVE') {
      where.isActive = true
    } else if (status === 'INACTIVE') {
      where.isActive = false
    }

    // Fetch users
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          instituteName: true,
          instituteCategory: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          mobileNumber: true,
          hsscId: true,
          gender: true,
          dateOfBirth: true,
          alternateEmail: true,
          address: true,
          pincode: true,
          profilePicture: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where })
    ])

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      fullName,
      email,
      mobileNumber,
      hsscId,
      password,
      role,
      instituteName,
      instituteCategory,
      pincode,
      gender,
      dateOfBirth,
      alternateEmail,
      address,
      profilePicture,
    } = body

    // Validate required fields
    if (!fullName || !email || !mobileNumber || !hsscId || !password || !role || !instituteName || !instituteCategory) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { hsscId }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or HSSC ID already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        mobileNumber,
        hsscId,
        password: hashedPassword,
        role,
        instituteName,
        instituteCategory,
        pincode: pincode || '',
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        alternateEmail: alternateEmail || null,
        address: address || null,
        profilePicture: profilePicture || null,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        instituteName: true,
        instituteCategory: true,
        isActive: true,
        createdAt: true,
        mobileNumber: true,
        hsscId: true,
        gender: true,
        dateOfBirth: true,
        alternateEmail: true,
        address: true,
        pincode: true,
        profilePicture: true,
      }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      id,
      fullName,
      email,
      mobileNumber,
      hsscId,
      role,
      instituteName,
      instituteCategory,
      pincode,
      gender,
      dateOfBirth,
      alternateEmail,
      address,
      isActive,
      profilePicture,
    } = body

    // Validate required fields
    if (!id || !fullName || !email || !mobileNumber || !hsscId || !role || !instituteName || !instituteCategory) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email or HSSC ID is already taken by another user
    const duplicateUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { hsscId }
        ],
        NOT: { id }
      }
    })

    if (duplicateUser) {
      return NextResponse.json(
        { error: 'User with this email or HSSC ID already exists' },
        { status: 400 }
      )
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        email,
        mobileNumber,
        hsscId,
        role,
        instituteName,
        instituteCategory,
        pincode: pincode || '',
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        alternateEmail: alternateEmail || null,
        address: address || null,
        profilePicture: profilePicture || null,
        isActive: isActive !== undefined ? isActive : existingUser.isActive,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        instituteName: true,
        instituteCategory: true,
        isActive: true,
        createdAt: true,
        mobileNumber: true,
        hsscId: true,
        gender: true,
        dateOfBirth: true,
        alternateEmail: true,
        address: true,
        pincode: true,
        profilePicture: true,
      }
    })

    return NextResponse.json({
      message: 'User updated successfully',
      user
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Deactivate user (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request)
    if (!adminUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent admin from deactivating themselves
    if (id === adminUser.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 400 }
      )
    }

    // Deactivate user (soft delete)
    await prisma.user.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      message: 'User deactivated successfully'
    })
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
