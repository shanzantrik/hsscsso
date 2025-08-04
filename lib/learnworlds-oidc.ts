import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface LearnWorldsOIDCConfig {
  clientId: string
  clientSecret: string
  redirectUrl: string
  issuer: string
  authorizationEndpoint: string
  tokenEndpoint: string
  jwksEndpoint: string
  scopes: string[]
}

interface OIDCTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  id_token: string
  scope: string
}

interface OIDCUserInfo {
  sub: string
  email: string
  name: string
  given_name?: string
  family_name?: string
  picture?: string
}

export class LearnWorldsOIDC {
  private config: LearnWorldsOIDCConfig

  constructor() {
    this.config = {
      clientId: process.env.LEARNWORLDS_CLIENT_ID || '',
      clientSecret: process.env.LEARNWORLDS_CLIENT_SECRET || '',
      redirectUrl: 'https://academy.dadb.com/f/signin/openid/175345417149762',
      issuer: 'https://academy.dadb.com',
      authorizationEndpoint: 'https://academy.dadb.com/oauth/authorize',
      tokenEndpoint: 'https://academy.dadb.com/oauth/token',
      jwksEndpoint: 'https://academy.dadb.com/.well-known/jwks.json',
      scopes: ['openid', 'profile', 'email']
    }
  }

  /**
   * Generate authorization URL for OIDC flow
   */
  generateAuthUrl(state: string, nonce: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUrl,
      scope: this.config.scopes.join(' '),
      state: state,
      nonce: nonce
    })

    return `${this.config.authorizationEndpoint}?${params.toString()}`
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<OIDCTokenResponse> {
    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.config.redirectUrl
      })
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get user info from OIDC provider
   */
  async getUserInfo(accessToken: string): Promise<OIDCUserInfo> {
    const response = await fetch(`${this.config.issuer}/oauth/userinfo`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create or update user in our database and return LMS redirect URL
   */
  async createLMSRedirect(userId: string, userEmail: string, userName: string): Promise<string> {
    try {
      // Get user from our database
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Generate state and nonce for OIDC flow
      const state = Buffer.from(JSON.stringify({
        userId: user.id,
        email: user.email,
        timestamp: Date.now()
      })).toString('base64')

      const nonce = Buffer.from(Math.random().toString()).toString('base64')

      // Store OIDC state in database (optional, for security)
      await prisma.user.update({
        where: { id: user.id },
        data: {
          // You could store state/nonce here if needed
        }
      })

      // Generate authorization URL
      const authUrl = this.generateAuthUrl(state, nonce)

      return authUrl
    } catch (error) {
      console.error('Error creating LMS redirect:', error)
      throw error
    }
  }

  /**
   * Handle OIDC callback and redirect to LMS
   */
  async handleCallback(code: string, state: string): Promise<string> {
    try {
      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(code)

      // Get user info
      const userInfo = await this.getUserInfo(tokens.access_token)

      // Decode state to get user info
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString())

      // Return the final LMS URL with tokens
      return `${this.config.issuer}/f/signin/openid/175345417149762?token=${tokens.access_token}&id_token=${tokens.id_token}`
    } catch (error) {
      console.error('Error handling OIDC callback:', error)
      throw error
    }
  }
}

export default LearnWorldsOIDC
