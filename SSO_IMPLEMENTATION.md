# HSSC SSO Gateway - LearnWorlds Integration

## Overview

This document describes the implementation of a Single Sign-On (SSO) authentication gateway for the Hydrocarbon Sector Skill Council (HSSC) that integrates with LearnWorlds Learning Management System (LMS) using both Custom SSO and SAML protocols.

## Architecture

### SSO Gateway Components

1. **Custom SSO Gateway** (`/sso-learnworlds`)

   - Handles login, signup, and password reset workflows
   - Accepts `action` and `redirectUrl` parameters from LearnWorlds
   - Integrates with LearnWorlds SSO API

2. **SAML Integration**

   - SAML metadata endpoint (`/api/saml/metadata`)
   - SAML Assertion Consumer Service (`/api/saml/acs`)
   - SAML configuration utilities (`/lib/saml.ts`)

3. **LearnWorlds API Integration**
   - SSO API endpoint (`/api/sso/learnworlds`)
   - User management and authentication

## LearnWorlds Integration

### Custom SSO Implementation

Based on the [LearnWorlds Custom SSO documentation](https://support.learnworlds.com/support/solutions/articles/12000080804), the system implements:

#### URL Parameters

- `action`: `login` or `passwordreset`
- `redirectUrl`: Encoded URL to redirect after authentication

#### Workflow Implementation

1. **Login Workflow**

   ```
   User → LearnWorlds → SSO Gateway → Authentication → LearnWorlds API → Redirect
   ```

2. **Password Reset Workflow**
   ```
   User → LearnWorlds → SSO Gateway → Password Reset → Email → Redirect
   ```

### LearnWorlds API Integration

The system uses the [LearnWorlds SSO API](https://www.learnworlds.dev/docs/api/58052c1c3066e-single-sign-on) for seamless integration:

```typescript
// Example API call
POST https://{SCHOOLHOMEPAGE}/admin/api/sso
Headers:
  Lw-Client: your_client_id
  Authorization: Bearer application_access_token
Body:
  {
    "email": "user@example.com",
    "username": "User Name",
    "redirectUrl": "https://learnworlds.com",
    "user_id": "optional_user_id"
  }
```

## SAML Configuration

### SAML Endpoints

Based on the provided SAML configuration:

- **Service Provider (SP) URL**: `https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/metadata`
- **Assertion Consumer Service (ACS) URL**: `https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-acs`
- **Single Logout URL**: `https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-sls`

### Required SAML Configuration

For SAML integration, you'll need from your Identity Provider (IDP):

1. **IDP Identifier (Entity ID)**
2. **Sign-on URL**
3. **Single Logout URL**
4. **Identity Provider Certificate**

## Environment Configuration

### Required Environment Variables

```env
# LearnWorlds LMS Integration
LMS_AUTH_URL=https://academy.dadb.com
LMS_CLIENT_ID=your_learnworlds_client_id
LMS_ACCESS_TOKEN=your_learnworlds_access_token

# SAML Configuration
SAML_ENTITY_ID=https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/metadata
SAML_ACS_URL=https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-acs
SAML_SLO_URL=https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-sls
SAML_CERTIFICATE=your_saml_certificate_here
```

## API Endpoints

### SSO Gateway

- **GET/POST** `/sso-learnworlds` - Main SSO gateway page
- **POST** `/api/sso/learnworlds` - LearnWorlds SSO API integration

### SAML Endpoints

- **GET** `/api/saml/metadata` - SAML metadata for IDP configuration
- **POST** `/api/saml/acs` - SAML Assertion Consumer Service

## LearnWorlds Setup

### Custom SSO Configuration

1. Navigate to **Website Settings** → **Authentication** → **Custom SSO**
2. Create a new Custom SSO
3. Set the SSO URL to: `https://your-domain.com/sso-learnworlds`
4. Test the URL to validate implementation
5. Save the configuration

### Important Notes

- **Payment Flow**: Change Site Navigation settings for logged-out users to require sign-up/login before payment
- **Sign-in/up Forms**: Hide the default LearnWorlds forms in Payment Sections
- **User Management**: Users created via SSO will need new passwords if reverting to LearnWorlds authentication
- **Email Changes**: Manual updates required in both systems when changing user emails

## Security Considerations

### JWT Token Management

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Secure token storage in localStorage

### SAML Security

- Certificate-based authentication
- XML signature validation
- Secure transmission over HTTPS

### Rate Limiting

- API rate limiting implemented
- Session management
- Brute force protection

## Development vs Production

### Development Mode

- Mock SSO URLs for testing
- Fallback authentication mechanisms
- Detailed error logging

### Production Mode

- Full SAML integration
- Secure certificate validation
- Production-grade error handling

## Testing

### SSO Gateway Testing

1. Access `/sso-learnworlds?action=login&redirectUrl=https://academy.dadb.com`
2. Test login and password reset flows
3. Verify LearnWorlds API integration

### SAML Testing

1. Configure IDP with SAML metadata from `/api/saml/metadata`
2. Test SAML authentication flow
3. Verify user creation and session management

## Troubleshooting

### Common Issues

1. **401 Unauthorized Errors**

   - Check JWT token validity
   - Verify LearnWorlds API credentials
   - Ensure proper authentication headers

2. **SAML Authentication Failures**

   - Validate SAML certificate
   - Check ACS URL configuration
   - Verify XML signature

3. **LearnWorlds Integration Issues**
   - Verify client ID and access token
   - Check API endpoint URLs
   - Validate redirect URL encoding

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` for detailed error information.

## Deployment

### Production Deployment

1. Configure production environment variables
2. Set up SSL certificates for HTTPS
3. Configure SAML certificates
4. Update LearnWorlds SSO URL to production domain
5. Test all authentication flows

### Monitoring

- Monitor SSO authentication success rates
- Track LearnWorlds API response times
- Log authentication errors for debugging

## Support

For technical support or questions about the SSO implementation, refer to:

- [LearnWorlds Custom SSO Documentation](https://support.learnworlds.com/support/solutions/articles/12000080804)
- [LearnWorlds SSO API Documentation](https://www.learnworlds.dev/docs/api/58052c1c3066e-single-sign-on)
- [SAML 2.0 Specification](https://docs.oasis-open.org/security/saml/Post2.0/sstc-saml-tech-overview-2.0.html)
