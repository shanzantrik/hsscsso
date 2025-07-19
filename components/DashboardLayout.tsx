'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import toast from 'react-hot-toast'
import { Menu } from 'lucide-react'

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

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User | null
  loading: boolean
}

export default function DashboardLayout({ children, user, loading }: DashboardLayoutProps) {
  const [isLMSLoading, setIsLMSLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    const handleLMSAccess = () => {
      handleLMSRedirect()
    }

    window.addEventListener('lms-access', handleLMSAccess)
    return () => window.removeEventListener('lms-access', handleLMSAccess)
  }, [user])

  const handleLMSRedirect = async () => {
    if (!user) {
      toast.error('User not found')
      return
    }

    setIsLMSLoading(true)
    try {
      const response = await fetch('/api/sso/lms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          email: user.email,
          password: '', // In real implementation, you might need to handle this differently
          redirect_url: process.env.NEXT_PUBLIC_LMS_URL || 'https://your-lms-domain.com',
        }),
      })

      if (response.ok) {
        const data = await response.json()
        window.open(data.sso_url, '_blank')
        toast.success('Redirecting to LMS...')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to redirect to LMS')
      }
    } catch (error) {
      console.error('LMS redirect error:', error)
      toast.error('Failed to connect to LMS')
    } finally {
      setIsLMSLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
      })
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      window.location.href = '/'
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        userRole={user.role}
        onLogout={handleLogout}
        user={{
          fullName: user.fullName,
          email: user.email,
          profilePicture: user.profilePicture
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 mr-2"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-8 h-8 relative">
                <img
                  src="/logo.jpg"
                  alt="HSSC Logo"
                  className="w-full h-full object-cover rounded"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">HSSC</h1>
                <p className="text-xs text-gray-500">SSO Gateway</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isLMSLoading && (
                <div className="w-4 h-4 border-2 border-success-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
