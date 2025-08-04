#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOAuthFlow() {
  try {
    console.log('🧪 Testing OAuth flow...')

    // Test 1: Check existing OAuth users
    console.log('\n1️⃣ Existing OAuth Users:')
    const oauthUsers = await prisma.user.findMany({
      where: { password: 'oauth_user' }
    })

    console.log(`Found ${oauthUsers.length} OAuth users:`)
    oauthUsers.forEach(user => {
      console.log(`   - ${user.email} (${user.role}) - ID: ${user.id}`)
    })

    // Test 2: Check if users have proper data
    console.log('\n2️⃣ User Data Validation:')
    for (const user of oauthUsers) {
      console.log(`\n   User: ${user.email}`)
      console.log(`   - ID: ${user.id}`)
      console.log(`   - Role: ${user.role}`)
      console.log(`   - Full Name: ${user.fullName}`)
      console.log(`   - HSSC ID: ${user.hsscId}`)
      console.log(`   - Institute: ${user.instituteName}`)
      console.log(`   - Active: ${user.isActive}`)
      console.log(`   - Email Verified: ${user.emailVerified}`)
    }

    // Test 3: Check admin user
    console.log('\n3️⃣ Admin User Check:')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@hssc.org' }
    })

    if (adminUser) {
      console.log(`   ✅ Admin exists: ${adminUser.email}`)
      console.log(`   Role: ${adminUser.role}`)
      console.log(`   Password type: ${adminUser.password === 'oauth_user' ? 'OAuth' : 'Credentials'}`)
    } else {
      console.log('   ❌ Admin user not found!')
    }

    console.log('\n✅ OAuth flow test completed!')
    console.log('\n📋 Next Steps:')
    console.log('1. Go to http://localhost:3000/login')
    console.log('2. Try Google OAuth login')
    console.log('3. Check console logs for authentication flow')
    console.log('4. Verify user lands on /dashboard')

  } catch (error) {
    console.error('❌ Error testing OAuth flow:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
testOAuthFlow() 