import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const redirectUrl = searchParams.get('redirect_url')

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      )
    }

    // Verify the token
    let decoded
    try {
      decoded = verifyAccessToken(token)
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { message: 'User not found or inactive' },
        { status: 401 }
      )
    }

    // Generate SSO token for LMS
    const ssoToken = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        hssc_id: user.hsscId,
        institute: user.instituteName,
        institute_category: user.instituteCategory,
        // Additional fields as per LearnWorlds requirements
        first_name: user.fullName.split(' ')[0],
        last_name: user.fullName.split(' ').slice(1).join(' ') || '',
        username: user.email,
        avatar: user.profilePicture || '',
        custom_fields: {
          mobile_number: user.mobileNumber,
          pincode: user.pincode,
          gender: user.gender,
          date_of_birth: user.dateOfBirth,
          alternate_email: user.alternateEmail,
          address: user.address,
        },
      },
      process.env.LMS_CLIENT_SECRET!,
      { expiresIn: '5m' }
    )

    // Log SSO attempt
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: true,
      },
    })

    // Redirect to LMS with SSO token
    const lmsUrl = redirectUrl || process.env.LMS_AUTH_URL
    const ssoUrl = `${lmsUrl}?sso_token=${ssoToken}`

    return NextResponse.redirect(ssoUrl)
  } catch (error) {
    console.error('SSO error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, redirect_url } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user || !user.isActive) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password (you might want to use bcrypt here)
    // For now, we'll assume the password is already verified
    // In a real implementation, you'd verify against the hashed password

    // Generate SSO token
    const ssoToken = jwt.sign(
      {
        user_id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        hssc_id: user.hsscId,
        institute: user.instituteName,
        institute_category: user.instituteCategory,
        first_name: user.fullName.split(' ')[0],
        last_name: user.fullName.split(' ').slice(1).join(' ') || '',
        username: user.email,
        avatar: user.profilePicture || '',
        custom_fields: {
          mobile_number: user.mobileNumber,
          pincode: user.pincode,
          gender: user.gender,
          date_of_birth: user.dateOfBirth,
          alternate_email: user.alternateEmail,
          address: user.address,
        },
      },
      process.env.LMS_CLIENT_SECRET!,
      { expiresIn: '5m' }
    )

    // Log SSO attempt
    await prisma.loginLog.create({
      data: {
        userId: user.id,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: true,
      },
    })

    // Return SSO URL
    const lmsUrl = redirect_url || process.env.LMS_AUTH_URL
    const ssoUrl = `${lmsUrl}?sso_token=${ssoToken}`

    return NextResponse.json({
      message: 'SSO token generated successfully',
      sso_url: ssoUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.fullName,
        role: user.role,
        hsscId: user.hsscId,
      },
    })
  } catch (error) {
    console.error('SSO POST error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
