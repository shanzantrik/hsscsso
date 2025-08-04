import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import LearnWorldsOIDC from '@/lib/learnworlds-oidc'

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

    // Create OIDC instance
    const oidc = new LearnWorldsOIDC()

    // Generate LMS redirect URL
    const redirectUrl = await oidc.createLMSRedirect(
      token.id as string,
      token.email as string,
      token.name as string
    )

    return NextResponse.json({
      success: true,
      redirectUrl: redirectUrl
    })
  } catch (error) {
    console.error('LMS redirect error:', error)
    return NextResponse.json(
      {
        message: 'Failed to generate LMS redirect',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
