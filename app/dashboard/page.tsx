'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import UserNavigation from '@/components/UserNavigation'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Check if user has completed registration (has more than default values)
    if (session.user?.role === 'STUDENT' && session.user?.id) {
      console.log('User authenticated successfully:', session.user)

      // Check if user has completed their profile (not using default values)
      // This is a simple check - you can enhance this based on your requirements
      const hasCompletedProfile = session.user.name && session.user.email

      if (hasCompletedProfile) {
        // Optionally auto-redirect to LMS after a short delay
        // Uncomment the following lines if you want automatic redirection
        /*
        const timer = setTimeout(() => {
          router.push('/sso-learnworlds?action=login')
        }, 2000)
        return () => clearTimeout(timer)
        */
      }
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <UserNavigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 relative">
              <img
                src="/logo.jpg"
                alt="HSSC Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to HSSC Dashboard
          </h1>
          <p className="text-gray-600 mb-4">
            Hello, {session.user?.name || session.user?.email}! You're successfully authenticated and ready to access the learning portal.
          </p>
          <div className="flex justify-center">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('/api/lms/redirect')
                  if (response.ok) {
                    const data = await response.json()
                    window.location.href = data.redirectUrl
                  } else {
                    // Fallback to SSO gateway
                    window.location.href = '/sso-learnworlds?action=login'
                  }
                } catch (error) {
                  // Fallback to SSO gateway
                  window.location.href = '/sso-learnworlds?action=login'
                }
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
            >
              🎓 Continue to Learning Portal
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* User Info */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Profile</h2>
              <div className="space-y-2">
                <p><strong>Name:</strong> {session.user?.name || 'Not set'}</p>
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Role:</strong> {session.user?.role || 'STUDENT'}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-green-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/lms/redirect')
                      if (response.ok) {
                        const data = await response.json()
                        window.location.href = data.redirectUrl
                      } else {
                        // Fallback to SSO gateway
                        window.location.href = '/sso-learnworlds?action=login'
                      }
                    } catch (error) {
                      // Fallback to SSO gateway
                      window.location.href = '/sso-learnworlds?action=login'
                    }
                  }}
                  className="block w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-center"
                >
                  Continue to Learning Portal
                </button>
                <Link
                  href="/profile"
                  className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 text-center"
                >
                  Complete Your Profile
                </Link>
                {session.user?.role === 'ADMIN' || session.user?.role === 'LMS_ADMIN' ? (
                  <Link
                    href="/admin/directory"
                    className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 text-center"
                  >
                    Admin Panel
                  </Link>
                ) : null}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-yellow-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-2 text-gray-700">
              <p>• Click "Continue to Learning Portal" to access your courses and learning materials</p>
              <p>• Complete your profile to personalize your learning experience</p>
              <p>• You can return to this dashboard anytime to manage your account</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/lms/redirect')
                if (response.ok) {
                  const data = await response.json()
                  window.location.href = data.redirectUrl
                } else {
                  // Fallback to SSO gateway
                  window.location.href = '/sso-learnworlds?action=login'
                }
              } catch (error) {
                // Fallback to SSO gateway
                window.location.href = '/sso-learnworlds?action=login'
              }
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Access Learning Portal
          </button>
        </div>
      </div>
    </div>
  )
}
