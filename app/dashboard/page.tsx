'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  GraduationCap,
  Calendar,
  BarChart3,
  ExternalLink,
  User,
  Settings,
  Bell
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '@/components/DashboardLayout'

interface User {
  id: string
  fullName: string
  email: string
  role: string
  instituteName: string
  instituteCategory: string
  hsscId: string
  lastLoginAt: string | null
  profilePicture?: string
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      console.log('Token from localStorage:', token ? 'Present' : 'Missing')

      if (!token) {
        console.log('No token found, redirecting to login')
        window.location.href = '/'
        return
      }

      console.log('Fetching user profile...')
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Profile response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('User data received:', data)
        setUser(data.user)
      } else {
        const errorData = await response.json()
        console.log('Profile error:', errorData)
        // Token might be expired, redirect to login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Fetch user data error:', error)
      toast.error('Failed to fetch user data')
    } finally {
      setLoading(false)
    }
  }

  const handleLMSRedirect = async () => {
    try {
      const response = await fetch('/api/sso/lms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          email: user?.email,
          password: '', // In real implementation, you might need to handle this differently
          redirect_url: process.env.NEXT_PUBLIC_LMS_URL,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.open(data.sso_url, '_blank')
        toast.success('Redirecting to LMS...')
      } else {
        toast.error('Failed to redirect to LMS')
      }
    } catch (error) {
      toast.error('Failed to connect to LMS')
    }
  }



  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={user} loading={loading}>
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user.fullName}!
          </h2>
          <p className="text-gray-600">
            {user.role === 'STUDENT' ? 'Welcome to your HSSC dashboard. Manage your profile and view your account information.' :
             'Manage your courses and monitor student progress.'}
          </p>
        </div>

        {/* User Info Card */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-12 h-12 object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{user.fullName}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-500">HSSC ID: {user.hsscId}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                user.role === 'STUDENT' ? 'bg-green-100 text-green-800' :
                user.role === 'TEACHER' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {user.role}
              </span>
              <p className="text-sm text-gray-500 mt-1">{user.instituteName}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`grid grid-cols-1 md:grid-cols-2 ${user.role === 'STUDENT' ? 'lg:grid-cols-2' : 'lg:grid-cols-4'} gap-6 mb-8`}>
          {user.role !== 'STUDENT' && (
            <button
              onClick={handleLMSRedirect}
              className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpen className="h-8 w-8 text-primary-600 group-hover:text-primary-700" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Learning Portal</p>
                  <p className="text-sm text-gray-500">Access LMS</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto group-hover:text-gray-600" />
              </div>
            </button>
          )}

          {user.role !== 'STUDENT' && (
            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GraduationCap className="h-8 w-8 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">My Courses</p>
                  <p className="text-sm text-gray-500">View progress</p>
                </div>
              </div>
            </div>
          )}

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Schedule</p>
                <p className="text-sm text-gray-500">Upcoming events</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-8 w-8 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-500">Performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Successfully logged in</p>
                  <p className="text-xs text-gray-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'First time login'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Account created</p>
                  <p className="text-xs text-gray-500">
                    Welcome to HSSC Learning Platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
