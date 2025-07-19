'use client'

import { useState, useEffect } from 'react'
import {
  Activity,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Shield,
  Database,
  Settings,
  Eye,
  Trash2,
  Edit,
  Plus,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '@/components/DashboardLayout'

interface ActivityLog {
  id: string
  action: string
  description: string
  userId: string
  userEmail: string
  userRole: string
  ipAddress: string
  userAgent: string
  status: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO'
  category: 'AUTH' | 'USER' | 'SYSTEM' | 'LMS' | 'ADMIN'
  timestamp: string
  metadata?: any
}

interface Stats {
  totalLogs: number
  todayLogs: number
  errorLogs: number
  successLogs: number
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [stats, setStats] = useState<Stats>({
    totalLogs: 0,
    todayLogs: 0,
    errorLogs: 0,
    successLogs: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('ALL')
  const [userFilter, setUserFilter] = useState('ALL')

  // Current user for layout
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        window.location.href = '/'
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.user.role !== 'ADMIN' && data.user.role !== 'LMS_ADMIN') {
          window.location.href = '/dashboard'
          return
        }

        setCurrentUser(data.user)
        fetchLogs()
        fetchStats()
      } else {
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

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/admin/activity-logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs)
      } else {
        // Use mock data if endpoint doesn't exist
        setMockLogs()
      }
    } catch (error) {
      setMockLogs()
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/admin/activity-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        // Use mock stats if endpoint doesn't exist
        setMockStats()
      }
    } catch (error) {
      setMockStats()
    }
  }

  const setMockLogs = () => {
    const mockLogs: ActivityLog[] = [
      {
        id: '1',
        action: 'USER_LOGIN',
        description: 'User successfully logged in',
        userId: 'user1',
        userEmail: 'john.doe@hssc.com',
        userRole: 'STUDENT',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'SUCCESS',
        category: 'AUTH',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        action: 'USER_CREATED',
        description: 'New user account created',
        userId: 'user2',
        userEmail: 'jane.smith@college.edu',
        userRole: 'TEACHER',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        status: 'SUCCESS',
        category: 'USER',
        timestamp: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: '3',
        action: 'USER_UPDATE_FAILED',
        description: 'Failed to update user profile - validation error',
        userId: 'user3',
        userEmail: 'admin@hssc.com',
        userRole: 'ADMIN',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'ERROR',
        category: 'USER',
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
      {
        id: '4',
        action: 'LMS_SYNC',
        description: 'LMS data synchronization completed',
        userId: 'system',
        userEmail: 'system@hssc.com',
        userRole: 'SYSTEM',
        ipAddress: '127.0.0.1',
        userAgent: 'HSSC-System/1.0',
        status: 'SUCCESS',
        category: 'LMS',
        timestamp: new Date(Date.now() - 900000).toISOString(),
      },
      {
        id: '5',
        action: 'DATABASE_BACKUP',
        description: 'Database backup initiated',
        userId: 'system',
        userEmail: 'system@hssc.com',
        userRole: 'SYSTEM',
        ipAddress: '127.0.0.1',
        userAgent: 'HSSC-System/1.0',
        status: 'INFO',
        category: 'SYSTEM',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
      },
      {
        id: '6',
        action: 'USER_DELETED',
        description: 'User account deactivated',
        userId: 'user4',
        userEmail: 'old.user@school.edu',
        userRole: 'STUDENT',
        ipAddress: '192.168.1.103',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'WARNING',
        category: 'USER',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: '7',
        action: 'CONFIGURATION_CHANGED',
        description: 'System configuration updated',
        userId: 'admin1',
        userEmail: 'admin@hssc.com',
        userRole: 'ADMIN',
        ipAddress: '192.168.1.104',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        status: 'SUCCESS',
        category: 'ADMIN',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
      },
      {
        id: '8',
        action: 'API_RATE_LIMIT',
        description: 'API rate limit exceeded',
        userId: 'user5',
        userEmail: 'api.user@company.com',
        userRole: 'STUDENT',
        ipAddress: '192.168.1.105',
        userAgent: 'Company-API-Client/2.0',
        status: 'WARNING',
        category: 'SYSTEM',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
      }
    ]
    setLogs(mockLogs)
  }

  const setMockStats = () => {
    setStats({
      totalLogs: 1247,
      todayLogs: 89,
      errorLogs: 23,
      successLogs: 1124,
    })
  }

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Description', 'User', 'Role', 'IP Address', 'Status', 'Category'],
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.action,
        log.description,
        log.userEmail,
        log.userRole,
        log.ipAddress,
        log.status,
        log.category
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hssc-activity-logs.csv'
    a.click()
    window.URL.revokeObjectURL(url)
    toast.success('Activity logs exported successfully')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'ERROR':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-600" />
      default:
        return <Info className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800'
      case 'ERROR':
        return 'bg-red-100 text-red-800'
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800'
      case 'INFO':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'AUTH':
        return 'bg-purple-100 text-purple-800'
      case 'USER':
        return 'bg-blue-100 text-blue-800'
      case 'SYSTEM':
        return 'bg-gray-100 text-gray-800'
      case 'LMS':
        return 'bg-green-100 text-green-800'
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter
    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter
    const matchesUser = userFilter === 'ALL' || log.userRole === userFilter

    let matchesDate = true
    if (dateFilter === 'TODAY') {
      const today = new Date().toDateString()
      const logDate = new Date(log.timestamp).toDateString()
      matchesDate = today === logDate
    } else if (dateFilter === 'WEEK') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      matchesDate = new Date(log.timestamp) >= weekAgo
    } else if (dateFilter === 'MONTH') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      matchesDate = new Date(log.timestamp) >= monthAgo
    }

    return matchesSearch && matchesStatus && matchesCategory && matchesDate && matchesUser
  })

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activity logs...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={currentUser} loading={loading}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Activity Logs</h1>
          <p className="text-gray-600">Monitor system activity and user actions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Logs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalLogs}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Logs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.todayLogs}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Success</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.successLogs}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Errors</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.errorLogs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Logs Section */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">System Activity</h2>
              <button
                onClick={exportLogs}
                className="btn-secondary flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="input-field"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="ERROR">Error</option>
                <option value="WARNING">Warning</option>
                <option value="INFO">Info</option>
              </select>

              <select
                className="input-field"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                <option value="AUTH">Authentication</option>
                <option value="USER">User Management</option>
                <option value="SYSTEM">System</option>
                <option value="LMS">LMS</option>
                <option value="ADMIN">Admin</option>
              </select>

              <select
                className="input-field"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">This Week</option>
                <option value="MONTH">This Month</option>
              </select>

              <select
                className="input-field"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
              >
                <option value="ALL">All Users</option>
                <option value="STUDENT">Students</option>
                <option value="TEACHER">Teachers</option>
                <option value="ADMIN">Admins</option>
                <option value="SYSTEM">System</option>
              </select>
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Loading activity logs...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No activity logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {log.action}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {log.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">{log.userEmail}</div>
                          <div className="text-sm text-gray-500">{log.userRole}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(log.status)}
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(log.category)}`}>
                          {log.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.ipAddress}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
