#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAuthFlow() {
  try {
    console.log('🧪 Testing authentication flow...')

    // Test 1: Check admin user
    console.log('\n1️⃣ Testing Admin User:')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@hssc.org' }
    })

    if (adminUser) {
      console.log(`   ✅ Admin user exists: ${adminUser.email}`)
      console.log(`   Role: ${adminUser.role}`)
      console.log(`   Password type: ${adminUser.password === 'oauth_user' ? 'OAuth' : 'Credentials'}`)

      // Test password
      const isPasswordValid = await bcrypt.compare('Admin@123', adminUser.password)
      console.log(`   Password valid: ${isPasswordValid ? '✅' : '❌'}`)
    } else {
      console.log('   ❌ Admin user not found!')
    }

    // Test 2: Check OAuth users
    console.log('\n2️⃣ Testing OAuth Users:')
    const oauthUsers = await prisma.user.findMany({
      where: { password: 'oauth_user' }
    })

    console.log(`   Found ${oauthUsers.length} OAuth users:`)
    oauthUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`)
    })

    // Test 3: Check for any admin users that are OAuth
    console.log('\n3️⃣ Checking for OAuth Admin Users:')
    const oauthAdmins = await prisma.user.findMany({
      where: {
        AND: [
          { password: 'oauth_user' },
          {
            OR: [
              { role: 'ADMIN' },
              { role: 'LMS_ADMIN' }
            ]
          }
        ]
      }
    })

    if (oauthAdmins.length > 0) {
      console.log('   ⚠️  Found admin users with OAuth passwords:')
      oauthAdmins.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.role})`)
      })
    } else {
      console.log('   ✅ No OAuth admin users found (good!)')
    }

    // Test 4: Check credentials users
    console.log('\n4️⃣ Testing Credentials Users:')
    const credentialsUsers = await prisma.user.findMany({
      where: {
        NOT: { password: 'oauth_user' }
      }
    })

    console.log(`   Found ${credentialsUsers.length} credentials users:`)
    credentialsUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role})`)
    })

    console.log('\n✅ Authentication flow test completed!')

  } catch (error) {
    console.error('❌ Error testing auth flow:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
testAuthFlow()
