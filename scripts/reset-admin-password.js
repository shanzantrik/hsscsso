#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function resetAdminPassword() {
  try {
    console.log('🔐 Resetting admin password...')

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
      console.log('❌ No admin user found!')
      return
    }

    // Set new password
    const newPassword = 'Admin@123'
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    })

    console.log('✅ Admin password reset successfully!')
    console.log('📋 New Admin Credentials:')
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Password: ${newPassword}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   ID: ${adminUser.id}`)
    console.log('\n🔗 Login URL: http://localhost:3000/admin/login')

  } catch (error) {
    console.error('❌ Error resetting admin password:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
resetAdminPassword()
