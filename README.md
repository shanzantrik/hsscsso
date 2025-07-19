# HSSC SSO Authentication Gateway

A secure, scalable Single Sign-On (SSO) authentication gateway for the Hydrocarbon Sector Skill Council (HSSC), enabling seamless access to Learning Management Systems (LMS) with role-based authentication and user management.

## 🚀 Features

### Core Features

- **Secure Authentication**: JWT-based authentication with refresh tokens
- **Role-Based Access Control**: Student, Teacher, Admin, and LMS Admin roles
- **SSO Integration**: Seamless integration with LearnWorlds LMS
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

   # LMS Integration (LearnWorlds)
   LMS_CLIENT_ID="your-lms-client-id"
   LMS_CLIENT_SECRET="your-lms-client-secret"
   LMS_REDIRECT_URI="http://localhost:3000/api/auth/callback/lms"
   LMS_AUTH_URL="https://your-domain.learnworlds.com/oauth/authorize"
   LMS_TOKEN_URL="https://your-domain.learnworlds.com/oauth/token"
   LMS_USERINFO_URL="https://your-domain.learnworlds.com/oauth/userinfo"
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

The application integrates with LearnWorlds LMS using OAuth 2.0 and OpenID Connect:

### SSO Flow

1. User authenticates through HSSC gateway
2. Gateway generates SSO token with user attributes
3. User redirected to LMS with SSO token
4. LMS validates token and creates user session

### Required LMS Configuration

- OAuth 2.0 Authorization Code Flow
- OpenID Connect support
- JWT-based token exchange
- Token validation endpoint

### User Attribute Mapping

- `user_id`: Unique user identifier
- `email`: User email address
- `name`: Full name
- `role`: User role (student/teacher/admin)
- `hssc_id`: HSSC identifier
- `institute`: Institute name
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
