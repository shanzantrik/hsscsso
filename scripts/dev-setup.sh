#!/bin/bash

# Development Setup Script for HSSC SSO Gateway
# This script sets up the environment with SQLite for easy development

set -e

echo "🚀 HSSC SSO Gateway Development Setup"
echo "====================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_status "Creating .env.local file for development..."
    cat > .env.local << 'EOF'
# Database (SQLite for development)
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="dev-jwt-secret-key-change-in-production"
JWT_REFRESH_SECRET="dev-refresh-secret-key-change-in-production"

# NextAuth Configuration
NEXTAUTH_SECRET="dev-nextauth-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# LMS Integration (LearnWorlds) - Update with your actual values
LMS_CLIENT_ID="your-lms-client-id"
LMS_CLIENT_SECRET="your-lms-client-secret"
LMS_REDIRECT_URI="http://localhost:3000/api/auth/callback/lms"
LMS_AUTH_URL="https://your-domain.learnworlds.com/oauth/authorize"
LMS_TOKEN_URL="https://your-domain.learnworlds.com/oauth/token"
LMS_USERINFO_URL="https://your-domain.learnworlds.com/oauth/userinfo"

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Security
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="5"
SESSION_SECRET="dev-session-secret-key"

# File Upload
MAX_FILE_SIZE="5242880"
UPLOAD_DIR="uploads"
EOF
    print_success ".env.local file created for development"
else
    print_warning ".env.local already exists"
fi

# Switch to SQLite schema for development
print_status "Switching to SQLite schema for development..."
cp prisma/schema-sqlite.prisma prisma/schema.prisma
print_success "SQLite schema configured"

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Push database schema
print_status "Pushing database schema..."
npx prisma db push

# Seed database
print_status "Seeding database with sample data..."
npx prisma db seed

print_success "Development setup completed successfully!"
echo ""
echo "🎉 Your HSSC SSO Gateway is ready for development!"
echo ""
echo "📋 Sample users created:"
echo "  Admin: admin@hssc.org / Admin123!"
echo "  Teacher: teacher@example.com / Teacher123!"
echo "  Student: student1@example.com / Student123!"
echo ""
echo "🚀 Start the development server:"
echo "  npm run dev"
echo ""
echo "🌐 Access the application:"
echo "  Main app: http://localhost:3000"
echo "  Admin panel: http://localhost:3000/admin/dashboard"
echo ""
echo "🗄️ Database:"
echo "  SQLite file: ./dev.db"
echo "  View with: npx prisma studio"
echo ""
echo "⚠️  Note: This is a development setup using SQLite."
echo "   For production, use PostgreSQL and update the schema."
