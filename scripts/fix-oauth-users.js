#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixOAuthUsers() {
  try {
    console.log('🔍 Checking for OAuth user linking issues...')

    // Find all users
    const allUsers = await prisma.user.findMany()
    
    console.log(`Found ${allUsers.length} total users:`)
    
    for (const user of allUsers) {
      console.log(`\n👤 User: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Password type: ${user.password === 'oauth_user' ? 'OAuth' : 'Credentials'}`)
      console.log(`   Full Name: ${user.fullName}`)
      console.log(`   HSSC ID: ${user.hsscId}`)
      
      // Check if user has OAuth accounts
      const accounts = await prisma.account.findMany({
        where: { userId: user.id }
      })
      
      console.log(`   OAuth accounts: ${accounts.length}`)
      accounts.forEach(account => {
        console.log(`     - ${account.provider} (${account.providerAccountId})`)
      })
      
      // If user has OAuth accounts but password is not 'oauth_user', fix it
      if (accounts.length > 0 && user.password !== 'oauth_user') {
        console.log('   🔧 Fixing: Converting to OAuth user')
        await prisma.user.update({
          where: { id: user.id },
          data: {
            password: 'oauth_user',
            emailVerified: true,
          }
        })
        console.log('   ✅ Fixed: User converted to OAuth')
      }
    }

    console.log('\n✅ OAuth user check completed!')

  } catch (error) {
    console.error('❌ Error checking OAuth users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixOAuthUsers() 