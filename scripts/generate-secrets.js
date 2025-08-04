#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 HSSC SSO Gateway - Secret Generator');
console.log('=====================================\n');

// Generate secure secrets
const generateSecret = () => crypto.randomBytes(32).toString('base64');

const secrets = {
  NEXTAUTH_SECRET: generateSecret(),
  JWT_SECRET: generateSecret(),
  JWT_REFRESH_SECRET: generateSecret(),
  SESSION_SECRET: generateSecret(),
};

console.log('📋 Copy these secrets to your .env.local file:\n');

Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}="${value}"`);
});

console.log('\n🔒 Security Notes:');
console.log('• Keep these secrets secure and never commit them to version control');
console.log('• Use different secrets for development and production');
console.log('• Rotate secrets regularly for production environments');
console.log('• Store production secrets in a secure environment variable manager');

console.log('\n📝 Next Steps:');
console.log('1. Copy the secrets above to your .env.local file');
console.log('2. Update other required environment variables');
console.log('3. Restart your development server');
console.log('4. Test the application');

console.log('\n✅ Done! Your secrets are ready to use.');
