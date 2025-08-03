import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'

// Mock configs data - in production this would come from a database
const mockConfigs = [
  {
    id: '1',
    key: 'DATABASE_URL',
    value: 'file:./dev.db',
    description: 'SQLite database file path',
    category: 'DATABASE',
    isEncrypted: false,
    isRequired: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    key: 'JWT_SECRET',
    value: 'your-super-secret-jwt-key-here',
    description: 'Secret key for JWT token signing',
    category: 'AUTH',
    isEncrypted: true,
    isRequired: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    key: 'LMS_AUTH_URL',
    value: 'https://academy.dadb.com',
    description: 'LearnWorlds LMS authentication URL',
    category: 'LMS',
    isEncrypted: false,
    isRequired: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    key: 'LMS_CLIENT_ID',
    value: 'your_learnworlds_client_id',
    description: 'LearnWorlds client ID for SSO',
    category: 'LMS',
    isEncrypted: true,
    isRequired: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    key: 'LMS_ACCESS_TOKEN',
    value: 'your_learnworlds_access_token',
    description: 'LearnWorlds access token for API calls',
    category: 'LMS',
    isEncrypted: true,
    isRequired: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    key: 'SAML_ENTITY_ID',
    value: 'https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/metadata',
    description: 'SAML Entity ID for SSO integration',
    category: 'LMS',
    isEncrypted: false,
    isRequired: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    key: 'SAML_ACS_URL',
    value: 'https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-acs',
    description: 'SAML Assertion Consumer Service URL',
    category: 'LMS',
    isEncrypted: false,
    isRequired: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    key: 'SAML_SLO_URL',
    value: 'https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-sls',
    description: 'SAML Single Logout Service URL',
    category: 'LMS',
    isEncrypted: false,
    isRequired: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '9',
    key: 'SAML_CERTIFICATE',
    value: 'your_saml_certificate_here',
    description: 'SAML certificate for signing/encryption',
    category: 'LMS',
    isEncrypted: true,
    isRequired: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '10',
    key: 'SMTP_HOST',
    value: 'smtp.gmail.com',
    description: 'SMTP server host for email notifications',
    category: 'EMAIL',
    isEncrypted: false,
    isRequired: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '11',
    key: 'SMTP_PORT',
    value: '587',
    description: 'SMTP server port',
    category: 'EMAIL',
    isEncrypted: false,
    isRequired: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '12',
    key: 'SMTP_USER',
    value: 'noreply@hssc.com',
    description: 'SMTP username for authentication',
    category: 'EMAIL',
    isEncrypted: false,
    isRequired: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '13',
    key: 'SMTP_PASS',
    value: 'email_password_123',
    description: 'SMTP password for authentication',
    category: 'EMAIL',
    isEncrypted: true,
    isRequired: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '14',
    key: 'REDIS_URL',
    value: 'redis://localhost:6379',
    description: 'Redis connection URL for caching',
    category: 'GENERAL',
    isEncrypted: false,
    isRequired: false,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '15',
    key: 'NEXTAUTH_SECRET',
    value: 'nextauth-secret-key-123',
    description: 'NextAuth.js secret key',
    category: 'AUTH',
    isEncrypted: true,
    isRequired: true,
    updatedAt: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    // Check if user is admin
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'LMS_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    return NextResponse.json({ configs: mockConfigs })
  } catch (error) {
    console.error('Settings configs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    // Check if user is admin
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'LMS_ADMIN')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id, value } = await request.json()

    if (!id || value === undefined) {
      return NextResponse.json(
        { error: 'Config ID and value are required' },
        { status: 400 }
      )
    }

    // Find and update the config (in production, this would update a database)
    const configIndex = mockConfigs.findIndex(config => config.id === id)
    if (configIndex === -1) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 })
    }

    // Update the config value
    mockConfigs[configIndex].value = value
    mockConfigs[configIndex].updatedAt = new Date().toISOString()

    return NextResponse.json({
      message: 'Configuration updated successfully',
      config: mockConfigs[configIndex]
    })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
