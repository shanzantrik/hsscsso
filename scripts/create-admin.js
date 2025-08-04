#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createDefaultAdmin() {
  try {
    console.log('🔐 Creating default admin user...')

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@hssc.org' },
          { role: 'ADMIN' }
        ]
      }
    })

    if (existingAdmin) {
      console.log('⚠️  Admin user already exists:')
      console.log(`   Email: ${existingAdmin.email}`)
      console.log(`   Role: ${existingAdmin.role}`)
      console.log(`   ID: ${existingAdmin.id}`)
      return
    }

    // Generate secure password
    const password = 'Admin@123'
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@hssc.org',
        fullName: 'HSSC Administrator',
        mobileNumber: '9999999999',
        hsscId: 'ADMIN_001',
        password: hashedPassword,
        role: 'ADMIN',
        instituteName: 'HSSC Headquarters',
        instituteCategory: 'OTHER',
        pincode: '000000',
        isActive: true,
        emailVerified: true,
      }
    })

    console.log('✅ Default admin user created successfully!')
    console.log('📋 Admin Credentials:')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Password: ${password}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   ID: ${adminUser.id}`)
    console.log('\n🔗 Login URL: http://localhost:3000/admin/login')
    console.log('\n⚠️  IMPORTANT: Change the password after first login!')

  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createDefaultAdmin()
