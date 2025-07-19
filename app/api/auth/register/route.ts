import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schema
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  mobileNumber: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
  hsscId: z.string().min(1, 'HSSC ID is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least 1 uppercase letter, 1 number, and 1 special character'),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
  instituteName: z.string().min(1, 'Institute name is required'),
  instituteCategory: z.enum(['SCHOOL', 'COLLEGE', 'PRIVATE', 'INDUSTRY']),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  alternateEmail: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationResult.error.errors
        },
        { status: 400 }
      )
    }

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
    } = validationResult.data

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email address already registered' },
        { status: 409 }
      )
    }

    // Check if HSSC ID already exists
    const existingHsscId = await prisma.user.findUnique({
      where: { hsscId },
    })

    if (existingHsscId) {
      return NextResponse.json(
        { message: 'HSSC ID already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        mobileNumber,
        hsscId,
        password: hashedPassword,
        role,
        instituteName,
        instituteCategory,
        pincode,
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        alternateEmail: alternateEmail || null,
        address: address || null,
      },
    })

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User registered successfully',
      user: userWithoutPassword,
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
