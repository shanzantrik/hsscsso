#!/bin/bash

# Quick Setup Script for HSSC SSO Gateway
# This script helps set up the environment and database quickly

set -e

echo "🚀 HSSC SSO Gateway Quick Setup"
echo "================================"

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
    print_status "Creating .env.local file..."
    cat > .env.local << 'EOF'
# Database
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here-change-in-production"

# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key-change-in-production"
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
SESSION_SECRET="your-session-secret-key"

# File Upload
MAX_FILE_SIZE="5242880"
UPLOAD_DIR="uploads"
EOF
    print_success ".env.local file created"
else
    print_warning ".env.local already exists"
fi

# Check if SQLite is available
print_status "Setting up SQLite database..."

# SQLite will be created automatically by Prisma
print_success "SQLite database will be created automatically"

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Push database schema
print_status "Pushing database schema..."
npx prisma db push

# Seed database
print_status "Seeding database with sample data..."
npx prisma db seed

print_success "Setup completed successfully!"
echo ""
echo "🎉 Your HSSC SSO Gateway is ready!"
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
