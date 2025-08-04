#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function fixAdminUser() {
  try {
    console.log('🔍 Checking admin user...')

    // Find admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@hssc.org' },
          { role: 'ADMIN' }
        ]
      }
    })

    if (!adminUser) {
      console.log('❌ No admin user found. Creating one...')

      const password = 'Admin@123'
      const hashedPassword = await bcrypt.hash(password, 12)

      const newAdmin = await prisma.user.create({
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

      console.log('✅ New admin user created:')
      console.log(`   Email: ${newAdmin.email}`)
      console.log(`   Password: ${password}`)
      console.log(`   Role: ${newAdmin.role}`)
      console.log(`   ID: ${newAdmin.id}`)
      return
    }

    console.log('📋 Current admin user:')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   ID: ${adminUser.id}`)
    console.log(`   Password field: ${adminUser.password ? 'Set' : 'Not set'}`)
    console.log(`   Password length: ${adminUser.password?.length || 0}`)

    // Check if password is properly hashed
    if (!adminUser.password || adminUser.password === 'oauth_user') {
      console.log('⚠️  Admin password needs to be set. Updating...')

      const password = 'Admin@123'
      const hashedPassword = await bcrypt.hash(password, 12)

      await prisma.user.update({
        where: { id: adminUser.id },
        data: { password: hashedPassword }
      })

      console.log('✅ Admin password updated:')
      console.log(`   Email: ${adminUser.email}`)
      console.log(`   Password: ${password}`)
      console.log(`   Role: ${adminUser.role}`)
    } else {
      console.log('✅ Admin password is properly set')

      // Test the password
      const testPassword = 'Admin@123'
      const isValid = await bcrypt.compare(testPassword, adminUser.password)

      if (isValid) {
        console.log('✅ Password test successful!')
        console.log('📋 Admin Credentials:')
        console.log(`   Email: ${adminUser.email}`)
        console.log(`   Password: ${testPassword}`)
        console.log(`   Role: ${adminUser.role}`)
      } else {
        console.log('❌ Password test failed. The password might be different.')
        console.log('💡 Try these common passwords:')
        console.log('   - Admin@123')
        console.log('   - admin123')
        console.log('   - password')
        console.log('   - admin')
      }
    }

  } catch (error) {
    console.error('❌ Error fixing admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixAdminUser()
