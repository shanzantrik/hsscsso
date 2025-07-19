#!/bin/bash

# HSSC SSO Gateway Setup Script
# This script automates the initial setup process

set -e

echo "🚀 HSSC SSO Gateway Setup"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    print_status "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi

    print_success "Node.js $(node -v) is installed"
}

# Check if npm is installed
check_npm() {
    print_status "Checking npm installation..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi

    print_success "npm $(npm -v) is installed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed successfully"
}

# Setup environment file
setup_env() {
    print_status "Setting up environment configuration..."

    if [ ! -f .env.local ]; then
        if [ -f env.example ]; then
            cp env.example .env.local
            print_success "Environment file created from template"
            print_warning "Please edit .env.local with your configuration values"
        else
            print_error "env.example file not found"
            exit 1
        fi
    else
        print_warning ".env.local already exists. Skipping environment setup"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."

    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not set. Please configure it in .env.local"
        print_status "You can use a local PostgreSQL instance or a cloud database"
        return
    fi

    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate

    # Push database schema
    print_status "Pushing database schema..."
    npx prisma db push

    # Seed database
    print_status "Seeding database with sample data..."
    npx prisma db seed

    print_success "Database setup completed"
}

# Build application
build_app() {
    print_status "Building application..."
    npm run build
    print_success "Application built successfully"
}

# Start development server
start_dev() {
    print_status "Starting development server..."
    print_success "Application will be available at http://localhost:3000"
    print_status "Press Ctrl+C to stop the server"
    npm run dev
}

# Main setup function
main() {
    echo ""
    print_status "Starting HSSC SSO Gateway setup..."

    # Check prerequisites
    check_node
    check_npm

    # Install dependencies
    install_dependencies

    # Setup environment
    setup_env

    # Setup database
    setup_database

    # Build application
    build_app

    echo ""
    print_success "Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env.local with your configuration"
    echo "2. Run 'npm run dev' to start the development server"
    echo "3. Open http://localhost:3000 in your browser"
    echo ""
    echo "Sample users (if database was seeded):"
    echo "  Admin: admin@hssc.org / Admin123!"
    echo "  Teacher: teacher@example.com / Teacher123!"
    echo "  Student: student1@example.com / Student123!"
    echo ""

    # Ask if user wants to start the development server
    read -p "Do you want to start the development server now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_dev
    fi
}

# Run main function
main "$@"
