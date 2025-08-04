#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixAdminUser() {
  try {
    console.log('🔐 Fixing admin user...')

    // Find any existing admin users
    const existingAdmins = await prisma.user.findMany({
      where: {
        OR: [
          { email: 'admin@hssc.org' },
          { email: 'admin@hssc.com' },
          { role: 'ADMIN' },
          { role: 'LMS_ADMIN' }
        ]
      }
    })

    console.log(`Found ${existingAdmins.length} existing admin users:`)
    existingAdmins.forEach(admin => {
      console.log(`   Email: ${admin.email}, Role: ${admin.role}, Password: ${admin.password === 'oauth_user' ? 'OAuth User' : 'Credentials User'}`)
    })

    // Delete any existing admin users that are OAuth users
    for (const admin of existingAdmins) {
      if (admin.password === 'oauth_user') {
        console.log(`🗑️  Deleting OAuth admin user: ${admin.email}`)
        await prisma.user.delete({
          where: { id: admin.id }
        })
      }
    }

    // Create proper admin user with credentials
    const adminEmail = 'admin@hssc.org'
    const adminPassword = 'Admin@123'
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Check if proper admin already exists
    const properAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })

    if (properAdmin && properAdmin.password !== 'oauth_user') {
      console.log('✅ Proper admin user already exists:')
      console.log(`   Email: ${properAdmin.email}`)
      console.log(`   Role: ${properAdmin.role}`)
      console.log(`   Password Type: Credentials`)
    } else {
      // Create new admin user
      const newAdmin = await prisma.user.create({
        data: {
          email: adminEmail,
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

      console.log('✅ New admin user created:')
      console.log(`   Email: ${newAdmin.email}`)
      console.log(`   Role: ${newAdmin.role}`)
      console.log(`   Password Type: Credentials`)
    }

    console.log('\n📋 Final Admin Credentials:')
    console.log(`   Email: ${adminEmail}`)
    console.log(`   Password: ${adminPassword}`)
    console.log(`   Login URL: http://localhost:3000/admin/login`)
    console.log('\n⚠️  IMPORTANT: Admin can ONLY login via credentials, not Google OAuth!')

  } catch (error) {
    console.error('❌ Error fixing admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixAdminUser() 