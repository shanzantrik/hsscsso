'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to SSO gateway as default landing page
    router.push('/sso-learnworlds?action=login')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-26 h-16 relative">
            <img
              src="/logo.jpg"
              alt="HSSC Logo"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          HSSC SSO Gateway
        </h1>
        <p className="text-gray-600 mb-4">
          Redirecting to login...
        </p>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  )
}
