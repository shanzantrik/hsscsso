'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import {
  Home,
  User,
  LogOut,
  GraduationCap,
  Settings,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

export default function UserNavigation() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!session) {
    return null
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <img
                src="/logo.jpg"
                alt="HSSC Logo"
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-xl font-bold text-gray-900">HSSC</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/profile"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </Link>

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
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Learning Portal</span>
            </button>

            {(session.user?.role === 'ADMIN' || session.user?.role === 'LMS_ADMIN') && (
              <Link
                href="/admin/dashboard"
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Admin</span>
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              )}
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{session.user?.name}</p>
                <p className="text-gray-500">{session.user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              <Link
                href="/dashboard"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>

              <button
                onClick={async () => {
                  setIsMenuOpen(false)
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
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors w-full text-left"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Learning Portal</span>
              </button>

              {(session.user?.role === 'ADMIN' || session.user?.role === 'LMS_ADMIN') && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
              )}

              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center space-x-3 px-3 py-2">
                  {session.user?.image && (
                    <img
                      src={session.user.image}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                    <p className="text-xs text-gray-500">{session.user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
