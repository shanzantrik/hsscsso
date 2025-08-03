import { NextRequest, NextResponse } from 'next/server'
import { extractUserFromSAMLResponse, validateSAMLResponse } from '@/lib/saml'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const samlResponse = formData.get('SAMLResponse') as string
    const relayState = formData.get('RelayState') as string

    if (!samlResponse) {
      return NextResponse.json({ error: 'No SAML response provided' }, { status: 400 })
    }

    // Decode the SAML response
    const decodedResponse = Buffer.from(samlResponse, 'base64').toString('utf-8')

    // Validate the SAML response
    if (!validateSAMLResponse(decodedResponse)) {
      return NextResponse.json({ error: 'Invalid SAML response' }, { status: 400 })
    }

    // Extract user information from SAML response
    const userInfo = extractUserFromSAMLResponse(decodedResponse)

    if (!userInfo) {
      return NextResponse.json({ error: 'Could not extract user information from SAML response' }, { status: 400 })
    }

    // Find or create user in our database
    let user = await prisma.user.findUnique({
      where: { email: userInfo.email }
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: userInfo.email,
          fullName: userInfo.name || userInfo.email.split('@')[0],
          mobileNumber: '', // Required field
          hsscId: `SAML_${Date.now()}`, // Generate unique HSSC ID
          role: 'STUDENT',
          instituteName: 'SAML User', // Required field
          instituteCategory: 'OTHER',
          pincode: '', // Required field
          password: '', // SAML users don't need passwords
          isActive: true
        }
      })
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    )

    // Redirect to the original URL or dashboard
    const redirectUrl = relayState || '/dashboard'

    // Create a temporary page that will set the tokens and redirect
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SSO Authentication</title>
        </head>
        <body>
          <script>
            localStorage.setItem('accessToken', '${accessToken}');
            localStorage.setItem('refreshToken', '${refreshToken}');
            window.location.href = '${redirectUrl}';
          </script>
          <p>Authenticating...</p>
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('SAML ACS error:', error)
    return NextResponse.json({ error: 'SAML authentication failed' }, { status: 500 })
  }
}
