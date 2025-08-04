import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request })

    console.log('Session check - Full token:', token)
    console.log('Session check - User ID:', token?.id)
    console.log('Session check - User Email:', token?.email)

    return NextResponse.json({
      authenticated: !!token,
      token: token,
      userId: token?.id,
      userEmail: token?.email,
      userRole: token?.role
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({
      error: 'Session check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
