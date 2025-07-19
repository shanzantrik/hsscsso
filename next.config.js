/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    LMS_CLIENT_ID: process.env.LMS_CLIENT_ID,
    LMS_CLIENT_SECRET: process.env.LMS_CLIENT_SECRET,
    LMS_REDIRECT_URI: process.env.LMS_REDIRECT_URI,
    LMS_AUTH_URL: process.env.LMS_AUTH_URL,
    LMS_TOKEN_URL: process.env.LMS_TOKEN_URL,
    LMS_USERINFO_URL: process.env.LMS_USERINFO_URL,
  },
}

module.exports = nextConfig
