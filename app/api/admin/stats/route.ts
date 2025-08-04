import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getToken } from 'next-auth/jwt'

const prisma = new PrismaClient()

// Helper function to verify admin authentication using NextAuth
async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = await getToken({ req: request })

    if (!token || !token.id) {
      return { error: 'Unauthorized', status: 401 }
    }

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { id: true, role: true, isActive: true }
    })

    if (!user || !user.isActive) {
      return { error: 'User not found or inactive', status: 401 }
    }

    // Check if user has admin role
    if (user.role !== 'ADMIN' && user.role !== 'LMS_ADMIN') {
      return { error: 'Admin access required', status: 403 }
    }

    return { user }
  } catch (error) {
    return { error: 'Invalid token', status: 401 }
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request)
    if ('error' in authResult) {
      return NextResponse.json(
        { message: authResult.error },
        { status: authResult.status }
      )
    }

    // Get user statistics
    const [
      totalUsers,
      activeUsers,
      students,
      teachers,
      admins,
      uniqueInstitutes,
      recentLogins,
      loginStats,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active users
      prisma.user.count({ where: { isActive: true } }),

      // Students
      prisma.user.count({ where: { role: 'STUDENT' } }),

      // Teachers
      prisma.user.count({ where: { role: 'TEACHER' } }),

      // Admins
      prisma.user.count({ where: { role: 'ADMIN' } }),

      // Unique institutes
      prisma.user.groupBy({
        by: ['instituteName'],
        _count: { instituteName: true },
      }),

      // Recent logins (last 7 days)
      prisma.loginLog.count({
        where: {
          success: true,
          timestamp: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Login statistics by role
      prisma.loginLog.groupBy({
        by: ['success'],
        _count: { success: true },
        where: {
          timestamp: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
    ])

    // Get institute category distribution
    const instituteCategories = await prisma.user.groupBy({
      by: ['instituteCategory'],
      _count: { instituteCategory: true },
    })

    // Get recent activity
    const recentActivity = await prisma.loginLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Calculate success rate
    const totalLogins = loginStats.reduce((acc, stat) => acc + stat._count.success, 0)
    const successfulLogins = loginStats.find(stat => stat.success)?._count.success || 0
    const successRate = totalLogins > 0 ? (successfulLogins / totalLogins) * 100 : 0

    return NextResponse.json({
      totalUsers,
      activeUsers,
      students,
      teachers,
      admins,
      institutes: uniqueInstitutes.length,
      recentLogins,
      successRate: Math.round(successRate),
      instituteCategories: instituteCategories.map(cat => ({
        category: cat.instituteCategory,
        count: cat._count.instituteCategory,
      })),
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        timestamp: activity.timestamp,
        success: activity.success,
        ipAddress: activity.ipAddress,
        user: activity.user,
      })),
    })
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
