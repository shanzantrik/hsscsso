import { NextRequest, NextResponse } from 'next/server'

export interface SAMLConfig {
  entityId: string
  acsUrl: string
  sloUrl: string
  certificate: string
}

export interface SAMLMetadata {
  entityId: string
  acsUrl: string
  sloUrl: string
  certificate: string
  nameIdFormat: string
  binding: string
}

export function getSAMLConfig(): SAMLConfig {
  return {
    entityId: process.env.SAML_ENTITY_ID || 'https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/metadata',
    acsUrl: process.env.SAML_ACS_URL || 'https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-acs',
    sloUrl: process.env.SAML_SLO_URL || 'https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-sls',
    certificate: process.env.SAML_CERTIFICATE || ''
  }
}

export function generateSAMLMetadata(): SAMLMetadata {
  const config = getSAMLConfig()

  return {
    entityId: config.entityId,
    acsUrl: config.acsUrl,
    sloUrl: config.sloUrl,
    certificate: config.certificate,
    nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    binding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST'
  }
}

export function generateSAMLRequest(relayState?: string): string {
  const config = getSAMLConfig()
  const requestId = `_${Math.random().toString(36).substr(2, 9)}`
  const issueInstant = new Date().toISOString()

  return `<?xml version="1.0"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
                     xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
                     ID="${requestId}"
                     Version="2.0"
                     IssueInstant="${issueInstant}"
                     ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                     AssertionConsumerServiceURL="${config.acsUrl}">
    <saml:Issuer>${config.entityId}</saml:Issuer>
    <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" AllowCreate="true"/>
</samlp:AuthnRequest>`
}

export function validateSAMLResponse(response: string): boolean {
  // Basic validation - in production, you'd want to validate the signature
  return response.includes('saml:Response') || response.includes('samlp:Response')
}

export function extractUserFromSAMLResponse(response: string): { email: string; name?: string } | null {
  try {
    // This is a simplified extraction - in production, you'd parse the XML properly
    const emailMatch = response.match(/<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/)
    const nameMatch = response.match(/<saml:Attribute[^>]*Name="displayName"[^>]*>.*?<saml:AttributeValue>([^<]+)<\/saml:AttributeValue>/)

    if (emailMatch) {
      return {
        email: emailMatch[1],
        name: nameMatch ? nameMatch[1] : undefined
      }
    }

    return null
  } catch (error) {
    console.error('Error extracting user from SAML response:', error)
    return null
  }
}
