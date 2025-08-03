# HSSC SSO Authentication Gateway

A secure, scalable Single Sign-On (SSO) authentication gateway for the Hydrocarbon Sector Skill Council (HSSC), enabling seamless access to Learning Management Systems (LMS) with role-based authentication and user management.

## 🚀 Features

### Core Features

- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Role-Based Access Control**: Student, Teacher, Admin, and LMS Admin roles
- **LearnWorlds SSO Integration**:
  - Custom SSO Gateway for login, signup, and password reset
  - SAML 2.0 integration with metadata and ACS endpoints
  - LearnWorlds API integration for seamless authentication
  - Support for both Custom SSO and SAML protocols
- **User Management**: Complete user registration and profile management
- **Admin Dashboard**: Comprehensive admin panel with user analytics
- **Security Features**: Password hashing, rate limiting, CSRF protection

### User Roles

- **Student**: Access learning materials and track progress
- **Teacher**: Manage content and monitor student progress
- **Admin**: Oversee user registration and access control
- **LMS Admin**: Technical contact for LMS integration

### Technical Features

- **Next.js 14**: Modern React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework with Tailadmin theme
- **Prisma ORM**: Type-safe database operations
- **SQLite**: Lightweight database backend
- **JWT Authentication**: Secure token-based authentication
- **OAuth 2.0**: Standard SSO protocol support

## 📋 Prerequisites

- Node.js 18+
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hssc-sso-gateway
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env.local
   ```

   Edit `.env.local` with your configuration:

   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key-here"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

   # NextAuth Configuration
   NEXTAUTH_SECRET="your-nextauth-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # LearnWorlds LMS Integration
   LMS_AUTH_URL="https://academy.dadb.com"
   LMS_CLIENT_ID="your_learnworlds_client_id"
   LMS_ACCESS_TOKEN="your_learnworlds_access_token"

   # SAML Configuration
   SAML_ENTITY_ID="https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/metadata"
   SAML_ACS_URL="https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-acs"
   SAML_SLO_URL="https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-sls"
   SAML_CERTIFICATE="your_saml_certificate_here"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma db push

   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 SSO Testing

### Custom SSO Gateway

Test the SSO gateway with LearnWorlds integration:

```bash
# Test login flow
http://localhost:3000/sso-learnworlds?action=login&redirectUrl=https://academy.dadb.com

# Test password reset flow
http://localhost:3000/sso-learnworlds?action=passwordreset&redirectUrl=https://academy.dadb.com
```

### SAML Integration

Access SAML metadata for IDP configuration:

```bash
# SAML Metadata
http://localhost:3000/api/saml/metadata
```

## 🏗️ Project Structure

```
hssc-sso-gateway/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── admin/                # Admin API endpoints
│   │   ├── sso/                  # SSO integration
│   │   └── user/                 # User profile endpoints
│   ├── admin/                    # Admin dashboard pages
│   ├── dashboard/                # User dashboard pages
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Reusable components
├── lib/                          # Utility functions
├── prisma/                       # Database schema and migrations
├── types/                        # TypeScript type definitions
├── public/                       # Static assets
└── package.json                  # Dependencies and scripts
```

## 🔐 Authentication Flow

1. **User Registration**: Users register with required information
2. **Email Verification**: Optional email verification process
3. **Login**: Username/password authentication
4. **Token Generation**: JWT access and refresh tokens
5. **Role-Based Redirect**: Users redirected based on their role
6. **SSO Integration**: Seamless LMS access via SSO tokens

## 🔗 SSO Integration

The application integrates with LearnWorlds LMS using both Custom SSO and SAML 2.0 protocols:

### Custom SSO Flow

1. LearnWorlds redirects user to SSO gateway with `action` and `redirectUrl` parameters
2. User authenticates through HSSC gateway (login/signup/password reset)
3. Gateway calls LearnWorlds SSO API with user credentials
4. LearnWorlds returns authentication URL
5. User redirected to LearnWorlds with active session

### SAML 2.0 Flow

1. User initiates SAML authentication from LearnWorlds
2. LearnWorlds sends SAML request to HSSC gateway
3. Gateway validates SAML request and authenticates user
4. Gateway sends SAML response back to LearnWorlds
5. User logged into LearnWorlds with SSO session

### LearnWorlds API Integration

The system uses the LearnWorlds SSO API for seamless integration:

```typescript
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

### SAML Configuration

Based on the provided SAML endpoints:

- **Service Provider (SP) URL**: `https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/metadata`
- **Assertion Consumer Service (ACS) URL**: `https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-acs`
- **Single Logout URL**: `https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-sls`

### User Attribute Mapping

- `email`: User email address (unique identifier)
- `username`: User display name
- `user_id`: LearnWorlds user ID (for existing users)
- `role`: User role (student/teacher/admin)
- `institute_category`: Institute category

## 👥 User Management

### User Fields

**Mandatory Fields:**

- Full Name
- Email Address (unique)
- Mobile Number (10-digit)
- HSSC ID (unique)
- Password (hashed)
- User Role
- Institute Name
- Institute Category
- Pincode (6-digit)

**Optional Fields:**

- Gender
- Date of Birth
- Alternate Email
- Address
- Profile Picture

### Password Policy

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- At least 1 special character

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **CSRF Protection**: Cross-site request forgery protection
- **XSS Protection**: Cross-site scripting protection
- **SQL Injection Protection**: Parameterized queries via Prisma
- **HTTPS Enforcement**: Secure communication
- **Token Revocation**: Secure logout mechanism

## 📊 Admin Dashboard

### Features

- **User Management**: View, edit, and manage users
- **Statistics**: Real-time user and activity statistics
- **Search & Filter**: Advanced user search and filtering
- **Export**: CSV export functionality
- **Activity Logs**: Login activity monitoring
- **Role Management**: User role assignment

### Analytics

- Total users count
- Active users tracking
- Role-based statistics
- Institute distribution
- Login success rates
- Recent activity monitoring

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all environment variables are properly configured for production:

- Use strong, unique JWT secrets
- Configure production database URL
- Set up proper LMS integration URLs
- Enable HTTPS
- Configure rate limiting

### Database Migration

```bash
npx prisma migrate deploy
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "mobileNumber": "1234567890",
  "hsscId": "HSSC001",
  "password": "SecurePass123!",
  "role": "STUDENT",
  "instituteName": "Example Institute",
  "instituteCategory": "COLLEGE",
  "pincode": "123456"
}
```

#### POST /api/auth/login

Authenticate user and generate tokens.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body:**

```json
{
  "refreshToken": "refresh_token"
}
```

#### POST /api/auth/logout

Logout user and revoke tokens.

**Request Body:**

```json
{
  "refreshToken": "refresh_token"
}
```

### SSO Endpoints

#### GET /api/sso/lms?token={jwt_token}

Generate SSO token and redirect to LMS.

#### POST /api/sso/lms

Generate SSO token for LMS integration.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password",
  "redirect_url": "https://lms.example.com"
}
```

### Admin Endpoints

#### GET /api/admin/users

Get paginated list of users with filters.

#### GET /api/admin/stats

Get dashboard statistics.

#### PUT /api/admin/users

Update user information.

#### DELETE /api/admin/users

Deactivate user account.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0**: Initial release with basic SSO functionality
- **v1.1.0**: Added admin dashboard and user management
- **v1.2.0**: Enhanced security features and LMS integration

## 📞 Contact

- **Developer**: Shantanu Goswami
- **Organization**: HSSC Development Team
- **Email**: [contact@hssc.org](mailto:contact@hssc.org)

---

**© 2025 The Explorer. Developed by Shantanu Goswami**
