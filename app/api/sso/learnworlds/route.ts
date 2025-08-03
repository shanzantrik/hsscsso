import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const user = await verifyAccessToken(token)

    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { email, username, redirectUrl, user_id } = body

    // Call LearnWorlds SSO API
    const ssoResponse = await callLearnWorldsSSO({
      email: email || user.email,
      username: username || user.fullName || user.username,
      redirectUrl,
      user_id: user_id || user.id
    })

    return NextResponse.json(ssoResponse)
  } catch (error) {
    console.error('SSO error:', error)
    return NextResponse.json({ error: 'SSO failed' }, { status: 500 })
  }
}

async function callLearnWorldsSSO({ email, username, redirectUrl, user_id }: {
  email: string
  username: string
  redirectUrl: string
  user_id: string
}) {
  try {
    const schoolHomepage = process.env.LMS_AUTH_URL || 'https://academy.dadb.com'
    const clientId = process.env.LMS_CLIENT_ID
    const accessToken = process.env.LMS_ACCESS_TOKEN

    if (!clientId || !accessToken) {
      throw new Error('LearnWorlds credentials not configured')
    }

    const response = await fetch(`${schoolHomepage}/admin/api/sso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lw-Client': clientId,
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        email,
        username,
        redirectUrl,
        user_id
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('LearnWorlds SSO API error:', errorText)
      throw new Error(`LearnWorlds SSO failed: ${response.status}`)
    }

    const data = await response.json()

    return {
      success: true,
      url: data.url,
      user_id: data.user_id
    }
  } catch (error) {
    console.error('LearnWorlds SSO error:', error)

    // Fallback: return a mock URL for development
    if (process.env.NODE_ENV === 'development') {
      const schoolHomepage = process.env.LMS_AUTH_URL || 'https://academy.dadb.com'
      return {
        success: true,
        url: `${schoolHomepage}/login?email=${encodeURIComponent(email)}&sso=true&redirect=${encodeURIComponent(redirectUrl)}`,
        user_id: user_id
      }
    }

    throw error
  }
}
