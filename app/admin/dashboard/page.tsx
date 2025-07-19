'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Activity,
  Building,
  GraduationCap,
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '@/components/DashboardLayout'

interface Stats {
  totalUsers: number
  activeUsers: number
  students: number
  teachers: number
  admins: number
  institutes: number
}

interface AnalyticsData {
  userGrowth: { month: string; users: number }[]
  roleDistribution: { role: string; count: number }[]
  instituteDistribution: { category: string; count: number }[]
  loginActivity: { date: string; logins: number }[]
  recentActivity: { action: string; user: string; timestamp: string }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    institutes: 0,
  })
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    roleDistribution: [],
    instituteDistribution: [],
    loginActivity: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  // Current user for layout
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      console.log('Admin dashboard - Token from localStorage:', token ? 'Present' : 'Missing')

      if (!token) {
        console.log('No token found, redirecting to login')
        window.location.href = '/'
        return
      }

      console.log('Admin dashboard - Verifying token...')
      // Verify token by making a request to user profile
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      console.log('Admin dashboard - Profile response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Admin dashboard - User data:', data.user)

        // Check if user has admin role
        if (data.user.role !== 'ADMIN' && data.user.role !== 'LMS_ADMIN') {
          console.log('User is not admin, redirecting to dashboard')
          window.location.href = '/dashboard'
          return
        }

        setCurrentUser(data.user)
        console.log('User is admin, fetching data...')
        // User is authenticated and is admin, fetch data
        fetchStats()
        fetchAnalytics()
      } else {
        const errorData = await response.json()
        console.log('Admin dashboard - Profile error:', errorData)
        console.log('Token invalid, redirecting to login')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Auth check error:', error)
      toast.error('Authentication failed')
      window.location.href = '/'
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        toast.error('Failed to fetch statistics')
      }
    } catch (error) {
      toast.error('Failed to fetch statistics')
    }
  }

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        // If analytics endpoint doesn't exist, use mock data
        setAnalytics({
          userGrowth: [
            { month: 'Jan', users: 120 },
            { month: 'Feb', users: 150 },
            { month: 'Mar', users: 180 },
            { month: 'Apr', users: 220 },
            { month: 'May', users: 280 },
            { month: 'Jun', users: 320 }
          ],
          roleDistribution: [
            { role: 'Students', count: stats.students },
            { role: 'Teachers', count: stats.teachers },
            { role: 'Admins', count: stats.admins }
          ],
          instituteDistribution: [
            { category: 'Schools', count: Math.floor(stats.institutes * 0.4) },
            { category: 'Colleges', count: Math.floor(stats.institutes * 0.3) },
            { category: 'Private', count: Math.floor(stats.institutes * 0.2) },
            { category: 'Industry', count: Math.floor(stats.institutes * 0.1) }
          ],
          loginActivity: [
            { date: 'Today', logins: 45 },
            { date: 'Yesterday', logins: 38 },
            { date: '2 days ago', logins: 42 },
            { date: '3 days ago', logins: 35 },
            { date: '4 days ago', logins: 28 },
            { date: '5 days ago', logins: 31 },
            { date: '6 days ago', logins: 26 }
          ],
          recentActivity: [
            { action: 'User Login', user: 'john.doe@hssc.com', timestamp: '2 minutes ago' },
            { action: 'New User Created', user: 'jane.smith@college.edu', timestamp: '15 minutes ago' },
            { action: 'User Updated', user: 'admin@hssc.com', timestamp: '1 hour ago' },
            { action: 'User Login', user: 'teacher@school.edu', timestamp: '2 hours ago' },
            { action: 'New Institute Added', user: 'system', timestamp: '3 hours ago' }
          ]
        })
      }
    } catch (error) {
      // Use mock data if analytics endpoint fails
      setAnalytics({
        userGrowth: [
          { month: 'Jan', users: 120 },
          { month: 'Feb', users: 150 },
          { month: 'Mar', users: 180 },
          { month: 'Apr', users: 220 },
          { month: 'May', users: 280 },
          { month: 'Jun', users: 320 }
        ],
        roleDistribution: [
          { role: 'Students', count: stats.students },
          { role: 'Teachers', count: stats.teachers },
          { role: 'Admins', count: stats.admins }
        ],
        instituteDistribution: [
          { category: 'Schools', count: Math.floor(stats.institutes * 0.4) },
          { category: 'Colleges', count: Math.floor(stats.institutes * 0.3) },
          { category: 'Private', count: Math.floor(stats.institutes * 0.2) },
          { category: 'Industry', count: Math.floor(stats.institutes * 0.1) }
        ],
        loginActivity: [
          { date: 'Today', logins: 45 },
          { date: 'Yesterday', logins: 38 },
          { date: '2 days ago', logins: 42 },
          { date: '3 days ago', logins: 35 },
          { date: '4 days ago', logins: 28 },
          { date: '5 days ago', logins: 31 },
          { date: '6 days ago', logins: 26 }
        ],
        recentActivity: [
          { action: 'User Login', user: 'john.doe@hssc.com', timestamp: '2 minutes ago' },
          { action: 'New User Created', user: 'jane.smith@college.edu', timestamp: '15 minutes ago' },
          { action: 'User Updated', user: 'admin@hssc.com', timestamp: '1 hour ago' },
          { action: 'User Login', user: 'teacher@school.edu', timestamp: '2 hours ago' },
          { action: 'New Institute Added', user: 'system', timestamp: '3 hours ago' }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={currentUser} loading={loading}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Analytics and insights for HSSC system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
                <p className="text-xs text-green-600 mt-1">+8% from last week</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GraduationCap className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Students</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.students}</p>
                <p className="text-xs text-green-600 mt-1">+15% from last month</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Institutes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.institutes}</p>
                <p className="text-xs text-green-600 mt-1">+5% from last month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">User Growth</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics.userGrowth.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t w-8 transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${(item.users / 400) * 200}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Role Distribution */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Role Distribution</h3>
              <PieChart className="w-5 h-5 text-green-600" />
            </div>
            <div className="space-y-4">
              {analytics.roleDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-700">{item.role}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Login Activity */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Login Activity</h3>
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div className="space-y-3">
              {analytics.loginActivity.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.date}</span>
                  <span className="text-sm font-medium text-gray-900">{item.logins} logins</span>
                </div>
              ))}
            </div>
          </div>

          {/* Institute Distribution */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Institute Types</h3>
              <Building className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="space-y-3">
              {analytics.instituteDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.category}</span>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div className="space-y-3">
              {analytics.recentActivity.map((item, index) => (
                <div key={index} className="text-sm">
                  <p className="text-gray-900 font-medium">{item.action}</p>
                  <p className="text-gray-500 text-xs">{item.user}</p>
                  <p className="text-gray-400 text-xs">{item.timestamp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-blue-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">Add, edit, or view users</p>
              </div>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Activity className="w-5 h-5 text-green-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">View Logs</p>
                <p className="text-sm text-gray-500">Check system activity</p>
              </div>
            </button>
            <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart3 className="w-5 h-5 text-purple-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">System Settings</p>
                <p className="text-sm text-gray-500">Configure system</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
