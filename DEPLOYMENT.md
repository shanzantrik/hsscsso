# HSSC SSO Gateway - Deployment Guide

This guide provides step-by-step instructions for deploying the HSSC SSO Authentication Gateway in various environments.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Git

### 1. Clone and Setup

```bash
git clone <repository-url>
cd hssc-sso-gateway
```

### 2. Configure Environment

```bash
cp env.example .env.local
# Edit .env.local with your production values
```

### 3. Start the Application

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Manual Deployment

### Prerequisites

- Node.js 18+
- npm or yarn

### 1. Database Setup

```bash
# SQLite database will be created automatically
# No additional setup required
```

### 2. Application Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:push

# Seed database (optional)
npm run db:seed

# Build for production
npm run build

# Start production server
npm start
```

## ☁️ Cloud Deployment

### Vercel Deployment

1. **Connect Repository**

   - Push code to GitHub/GitLab
   - Connect repository to Vercel

2. **Environment Variables**
   Set the following environment variables in Vercel:

   ```
   DATABASE_URL=file:./prod.db
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_refresh_secret
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   LMS_CLIENT_ID=your_lms_client_id
   LMS_CLIENT_SECRET=your_lms_client_secret
   LMS_REDIRECT_URI=https://your-domain.vercel.app/api/auth/callback/lms
   LMS_AUTH_URL=https://your-domain.learnworlds.com/oauth/authorize
   LMS_TOKEN_URL=https://your-domain.learnworlds.com/oauth/token
   LMS_USERINFO_URL=https://your-domain.learnworlds.com/oauth/userinfo
   ```

3. **Database Setup**
   - SQLite database will be created automatically
   - Run migrations: `npx prisma db push`

### AWS Deployment

#### Using AWS EC2

1. **Launch EC2 Instance**

   - Use Amazon Linux 2 or Ubuntu
   - Configure security groups for port 3000
   - Attach EBS volume for data persistence

2. **Install Dependencies**

   ```bash
   # Update system
   sudo yum update -y  # For Amazon Linux
   # or
   sudo apt update && sudo apt upgrade -y  # For Ubuntu

   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Install PM2 for process management
   sudo npm install -g pm2
   ```

3. **Deploy Application**

   ```bash
   # Clone repository
   git clone <repository-url>
   cd hssc-sso-gateway

   # Install dependencies
   npm install

   # Set up environment variables
   cp env.example .env.local
   # Edit .env.local with production values

   # Build application
   npm run build

   # Start with PM2
   pm2 start npm --name "hssc-sso" -- start
   pm2 startup
   pm2 save
   ```

### Google Cloud Platform

#### Using Cloud Run

1. **Enable APIs**

   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

2. **Build and Deploy**
   ```bash
   gcloud builds submit --tag gcr.io/your-project/hssc-sso-gateway
   gcloud run deploy hssc-sso-gateway \
     --image gcr.io/your-project/hssc-sso-gateway \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars DATABASE_URL=your_database_url
   ```

## 🔐 Security Configuration

### Environment Variables

**Required for Production:**

```env
# Database
DATABASE_URL=file:./prod.db

# JWT Secrets (Generate strong, unique secrets)
JWT_SECRET=your-very-long-and-secure-jwt-secret-key
JWT_REFRESH_SECRET=your-very-long-and-secure-refresh-secret-key

# NextAuth
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=https://your-domain.com

# LMS Integration
LMS_CLIENT_ID=your-lms-client-id
LMS_CLIENT_SECRET=your-lms-client-secret
LMS_REDIRECT_URI=https://your-domain.com/api/auth/callback/lms
LMS_AUTH_URL=https://your-domain.learnworlds.com/oauth/authorize
LMS_TOKEN_URL=https://your-domain.learnworlds.com/oauth/token
LMS_USERINFO_URL=https://your-domain.learnworlds.com/oauth/userinfo
```

**Optional:**

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
SESSION_SECRET=your-session-secret-key

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads
```

### SSL/HTTPS Configuration

1. **Obtain SSL Certificate**

   - Use Let's Encrypt for free certificates
   - Or purchase from certificate authority

2. **Configure Reverse Proxy (Nginx)**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /path/to/certificate.crt;
       ssl_certificate_key /path/to/private.key;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 📊 Monitoring and Logging

### Application Monitoring

1. **Health Check Endpoint**

   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Database Monitoring**

   ```bash
   # Check database connection
   npx prisma db execute --stdin
   ```

3. **Log Monitoring**
   - Use centralized logging (ELK Stack, CloudWatch, etc.)
   - Monitor login attempts and failures
   - Track SSO integration errors

### Performance Optimization

1. **Database Indexing**

   ```sql
   -- Add indexes for better performance
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_users_hssc_id ON users(hssc_id);
   CREATE INDEX idx_login_logs_timestamp ON login_logs(timestamp);
   CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
   ```

2. **Caching Strategy**
   - Implement Redis for session storage
   - Cache user profile data
   - Cache LMS integration tokens

## 🔄 Backup and Recovery

### Database Backup

1. **Automated Backups**

   ```bash
   # Create backup script
   #!/bin/bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Cloud Provider Backups**
   - AWS RDS automated backups
   - Google Cloud SQL backups
   - Azure Database for PostgreSQL backups

### Disaster Recovery

1. **Backup Strategy**

   - Daily automated backups
   - Point-in-time recovery
   - Cross-region backup replication

2. **Recovery Procedures**

   ```bash
   # Restore database
   psql $DATABASE_URL < backup_file.sql

   # Restore application
   git pull origin main
   npm install
   npm run build
   npm start
   ```

## 🧪 Testing

### Pre-deployment Testing

1. **Unit Tests**

   ```bash
   npm test
   ```

2. **Integration Tests**

   ```bash
   npm run test:integration
   ```

3. **Load Testing**
   ```bash
   # Using Artillery
   npm install -g artillery
   artillery run load-test.yml
   ```

### Post-deployment Verification

1. **Health Checks**

   - Application health endpoint
   - Database connectivity
   - SSO integration test

2. **User Acceptance Testing**
   - User registration flow
   - Login/logout functionality
   - SSO integration
   - Admin dashboard access

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer Configuration**

   - Use AWS ALB, Google Cloud Load Balancer, or Nginx
   - Configure sticky sessions for JWT tokens
   - Health check configuration

2. **Database Scaling**
   - Read replicas for read-heavy workloads
   - Connection pooling (PgBouncer)
   - Database sharding for large datasets

### Vertical Scaling

1. **Resource Allocation**
   - Increase CPU and memory for application servers
   - Optimize database instance size
   - Monitor resource usage

## 🔧 Maintenance

### Regular Maintenance Tasks

1. **Database Maintenance**

   ```sql
   -- Clean up expired refresh tokens
   DELETE FROM refresh_tokens WHERE expires_at < NOW();

   -- Clean up old login logs (keep 90 days)
   DELETE FROM login_logs WHERE timestamp < NOW() - INTERVAL '90 days';
   ```

2. **Application Updates**

   ```bash
   # Update dependencies
   npm update

   # Run database migrations
   npx prisma migrate deploy

   # Restart application
   npm restart
   ```

3. **Security Updates**
   - Regular dependency updates
   - Security patch application
   - SSL certificate renewal

## 📞 Support

For deployment support:

- Check the [README.md](README.md) for basic setup
- Review [API Documentation](README.md#api-documentation)
- Contact the development team for issues

---

**© 2025 The Explorer. Developed by Shantanu Goswami**
