'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserData {
  fullName: string
  mobileNumber: string
  instituteName: string
  instituteCategory: string
  pincode: string
  gender: string
  role: string
}

export default function RegisterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userData, setUserData] = useState<UserData>({
    fullName: '',
    mobileNumber: '',
    instituteName: '',
    instituteCategory: 'OTHER',
    pincode: '',
    gender: '',
    role: 'STUDENT'
  })

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    // Pre-fill user data from session
    if (session.user) {
      setUserData(prev => ({
        ...prev,
        fullName: session.user.name || session.user.email?.split('@')[0] || '',
      }))
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (response.ok) {
        // Registration successful, redirect to dashboard
        router.push('/dashboard')
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      setError('An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 relative">
              <img
                src="/logo.jpg"
                alt="HSSC Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to HSSC
          </h1>
          <p className="text-gray-600">
            Complete your registration to access the Learning Portal
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.fullName}
              onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.mobileNumber}
              onChange={(e) => setUserData({ ...userData, mobileNumber: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institute Name *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.instituteName}
              onChange={(e) => setUserData({ ...userData, instituteName: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institute Category *
            </label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.instituteCategory}
              onChange={(e) => setUserData({ ...userData, instituteCategory: e.target.value })}
            >
              <option value="OTHER">Other</option>
              <option value="UNIVERSITY">University</option>
              <option value="COLLEGE">College</option>
              <option value="SCHOOL">School</option>
              <option value="TRAINING_CENTER">Training Center</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.pincode}
              onChange={(e) => setUserData({ ...userData, pincode: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.gender}
              onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
            >
              <option value="">Select Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={userData.role === 'STUDENT'}
                  onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                  className="mr-2"
                />
                <span>Student</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="TEACHER"
                  checked={userData.role === 'TEACHER'}
                  onChange={(e) => setUserData({ ...userData, role: e.target.value })}
                  className="mr-2"
                />
                <span>Teacher</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Completing Registration...' : 'Complete Registration'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => signOut()}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Sign out and try different account
          </button>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/sso-learnworlds?action=login"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Back to SSO Gateway
          </Link>
        </div>
      </div>
    </div>
  )
}
