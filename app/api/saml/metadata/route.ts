import { NextResponse } from 'next/server'
import { generateSAMLMetadata } from '@/lib/saml'

export async function GET() {
  try {
    const metadata = generateSAMLMetadata()

    const xmlMetadata = `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="${metadata.entityId}">
    <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
        <md:AssertionConsumerService Binding="${metadata.binding}"
                                    Location="${metadata.acsUrl}"
                                    index="0"/>
        <md:SingleLogoutService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
                               Location="${metadata.sloUrl}"/>
    </md:SPSSODescriptor>
</md:EntityDescriptor>`

    return new NextResponse(xmlMetadata, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error('SAML metadata error:', error)
    return NextResponse.json({ error: 'Failed to generate SAML metadata' }, { status: 500 })
  }
}
