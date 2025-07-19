import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface JWTPayload {
  userId: string
  email: string
  role: string
  hsscId: string
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  userId: string
  tokenVersion: number
  iat?: number
  exp?: number
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' })
}

export function generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not configured')
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): JWTPayload {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as JWTPayload
  } catch (error) {
    throw new AuthError('Invalid access token')
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not configured')
  }

  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET) as RefreshTokenPayload
  } catch (error) {
    throw new AuthError('Invalid refresh token')
  }
}

export async function validateRefreshToken(token: string): Promise<boolean> {
  try {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    })

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token, isRevoked: false },
    data: { isRevoked: true },
  })
}

export async function storeRefreshToken(
  token: string,
  userId: string,
  expiresIn: number = 7 * 24 * 60 * 60 * 1000
): Promise<void> {
  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + expiresIn),
    },
  })
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7)
}

export async function getUserFromToken(token: string) {
  const payload = verifyAccessToken(token)

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      hsscId: true,
      instituteName: true,
      instituteCategory: true,
      isActive: true,
      lastLoginAt: true,
    },
  })

  if (!user || !user.isActive) {
    throw new AuthError('User not found or inactive')
  }

  return user
}

export function generateSSOToken(user: any, clientSecret: string): string {
  const ssoPayload = {
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
  }

  return jwt.sign(ssoPayload, clientSecret, { expiresIn: '5m' })
}
