'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  Activity,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Building,
  Shield,
  ExternalLink,
  User
} from 'lucide-react'

interface SidebarProps {
  userRole: string
  onLogout: () => void
  user?: {
    fullName: string
    email: string
    profilePicture?: string
  }
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ userRole, onLogout, user, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  const isAdmin = userRole === 'ADMIN' || userRole === 'LMS_ADMIN'

  const menuItems = [
    {
      title: 'Dashboard',
      href: isAdmin ? '/admin/dashboard' : '/dashboard',
      icon: Home,
      active: pathname === (isAdmin ? '/admin/dashboard' : '/dashboard')
    },
    ...(isAdmin ? [
      {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
        active: pathname === '/admin/users'
      },
      {
        title: 'Activity Logs',
        href: '/admin/activity',
        icon: Activity,
        active: pathname === '/admin/activity'
      },
      {
        title: 'System Settings',
        href: '/admin/settings',
        icon: Settings,
        active: pathname === '/admin/settings'
      }
    ] : userRole === 'STUDENT' ? [
      {
        title: 'My Profile',
        href: '/profile',
        icon: Shield,
        active: pathname === '/profile'
      }
    ] : [
      {
        title: 'My Profile',
        href: '/profile',
        icon: Shield,
        active: pathname === '/profile'
      }
    ])
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-all duration-300 flex flex-col w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 relative">
              <Image
                src="/logo.jpg"
                alt="HSSC Logo"
                fill
                className="object-cover rounded"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">HSSC</h1>
              <p className="text-xs text-gray-500">SSO Gateway</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
                  ${item.active
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* LMS Access Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              // This will be handled by the parent component
              window.dispatchEvent(new CustomEvent('lms-access'))
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            <ExternalLink className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">LMS Access</span>
          </button>
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-10 h-10 object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}
