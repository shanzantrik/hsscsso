'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  Database,
  Key,
  Globe,
  Shield,
  Mail,
  Cloud,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '@/components/DashboardLayout'

interface EnvironmentConfig {
  id: string
  key: string
  value: string
  description: string
  category: 'DATABASE' | 'AUTH' | 'LMS' | 'EMAIL' | 'GENERAL' | 'SECURITY'
  isEncrypted: boolean
  isRequired: boolean
  updatedAt: string
}

export default function SystemSettingsPage() {
  const [configs, setConfigs] = useState<EnvironmentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})
  const [editingConfig, setEditingConfig] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  // Current user for layout
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    checkAuthAndFetchData()
  }, [])

  const checkAuthAndFetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        window.location.href = '/admin/login'
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
        fetchConfigs()
      } else {
        window.location.href = '/admin/login'
      }
    } catch (error) {
      console.error('Auth check error:', error)
      window.location.href = '/admin/login'
    } finally {
      setLoading(false)
    }
  }

  const fetchConfigs = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/admin/settings/configs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setConfigs(data.configs || [])
      } else {
        // Use mock data if API fails
        setMockConfigs()
      }
    } catch (error) {
      console.error('Error fetching configs:', error)
      setMockConfigs()
    }
  }

  const setMockConfigs = () => {
    const mockConfigs: EnvironmentConfig[] = [
      {
        id: '1',
        key: 'DATABASE_URL',
        value: 'file:./dev.db',
        description: 'SQLite database file path',
        category: 'DATABASE',
        isEncrypted: false,
        isRequired: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        key: 'JWT_SECRET',
        value: 'your-super-secret-jwt-key-here',
        description: 'Secret key for JWT token signing',
        category: 'AUTH',
        isEncrypted: true,
        isRequired: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        key: 'LMS_AUTH_URL',
        value: 'https://academy.dadb.com',
        description: 'LearnWorlds LMS authentication URL',
        category: 'LMS',
        isEncrypted: false,
        isRequired: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        key: 'LMS_CLIENT_ID',
        value: 'your_learnworlds_client_id',
        description: 'LearnWorlds client ID for SSO',
        category: 'LMS',
        isEncrypted: true,
        isRequired: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        key: 'LMS_ACCESS_TOKEN',
        value: 'your_learnworlds_access_token',
        description: 'LearnWorlds access token for API calls',
        category: 'LMS',
        isEncrypted: true,
        isRequired: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '6',
        key: 'SAML_ENTITY_ID',
        value: 'https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/metadata',
        description: 'SAML Entity ID for SSO integration',
        category: 'LMS',
        isEncrypted: false,
        isRequired: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '7',
        key: 'SAML_ACS_URL',
        value: 'https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-acs',
        description: 'SAML Assertion Consumer Service URL',
        category: 'LMS',
        isEncrypted: false,
        isRequired: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '8',
        key: 'SAML_SLO_URL',
        value: 'https://academy.dadb.com/admin/api/saml/624af5b2368c2b02724afe80/175345527775879/sp/saml2-sls',
        description: 'SAML Single Logout Service URL',
        category: 'LMS',
        isEncrypted: false,
        isRequired: true,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '9',
        key: 'SAML_CERTIFICATE',
        value: 'your_saml_certificate_here',
        description: 'SAML certificate for signing/encryption',
        category: 'LMS',
        isEncrypted: true,
        isRequired: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '10',
        key: 'SMTP_HOST',
        value: 'smtp.gmail.com',
        description: 'SMTP server host for email notifications',
        category: 'EMAIL',
        isEncrypted: false,
        isRequired: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '11',
        key: 'SMTP_PORT',
        value: '587',
        description: 'SMTP server port',
        category: 'EMAIL',
        isEncrypted: false,
        isRequired: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '12',
        key: 'SMTP_USER',
        value: 'noreply@hssc.com',
        description: 'SMTP username for authentication',
        category: 'EMAIL',
        isEncrypted: false,
        isRequired: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '13',
        key: 'SMTP_PASS',
        value: 'email_password_123',
        description: 'SMTP password for authentication',
        category: 'EMAIL',
        isEncrypted: true,
        isRequired: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '14',
        key: 'REDIS_URL',
        value: 'redis://localhost:6379',
        description: 'Redis connection URL for caching',
        category: 'GENERAL',
        isEncrypted: false,
        isRequired: false,
        updatedAt: new Date().toISOString(),
      },
      {
        id: '15',
        key: 'NEXTAUTH_SECRET',
        value: 'nextauth-secret-key-123',
        description: 'NextAuth.js secret key',
        category: 'AUTH',
        isEncrypted: true,
        isRequired: true,
        updatedAt: new Date().toISOString(),
      },
    ]
    setConfigs(mockConfigs)
  }

  const handleEditConfig = (config: EnvironmentConfig) => {
    setEditingConfig(config.id)
    setEditValue(config.value)
  }

  const handleSaveConfig = async (configId: string) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/admin/settings/configs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: configId,
          value: editValue,
        }),
      })

      if (response.ok) {
        setConfigs(prev => prev.map(config =>
          config.id === configId
            ? { ...config, value: editValue, updatedAt: new Date().toISOString() }
            : config
        ))
        toast.success('Configuration updated successfully!')
      } else {
        toast.error('Failed to update configuration')
      }
    } catch (error) {
      console.error('Error updating config:', error)
      toast.error('Failed to update configuration')
    } finally {
      setSaving(false)
      setEditingConfig(null)
      setEditValue('')
    }
  }

  const handleCancelEdit = () => {
    setEditingConfig(null)
    setEditValue('')
  }

  const togglePasswordVisibility = (configId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [configId]: !prev[configId]
    }))
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DATABASE':
        return <Database className="w-5 h-5 text-blue-600" />
      case 'AUTH':
        return <Shield className="w-5 h-5 text-green-600" />
      case 'LMS':
        return <Cloud className="w-5 h-5 text-purple-600" />
      case 'EMAIL':
        return <Mail className="w-5 h-5 text-red-600" />
      case 'GENERAL':
        return <Settings className="w-5 h-5 text-gray-600" />
      case 'SECURITY':
        return <Key className="w-5 h-5 text-orange-600" />
      default:
        return <Settings className="w-5 h-5 text-gray-600" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DATABASE':
        return 'bg-blue-100 text-blue-800'
      case 'AUTH':
        return 'bg-green-100 text-green-800'
      case 'LMS':
        return 'bg-purple-100 text-purple-800'
      case 'EMAIL':
        return 'bg-red-100 text-red-800'
      case 'GENERAL':
        return 'bg-gray-100 text-gray-800'
      case 'SECURITY':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const groupedConfigs = configs.reduce((groups, config) => {
    if (!groups[config.category]) {
      groups[config.category] = []
    }
    groups[config.category].push(config)
    return groups
  }, {} as Record<string, EnvironmentConfig[]>)

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system settings...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={currentUser} loading={loading}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h1>
          <p className="text-gray-600">Manage environment configuration and system variables</p>
        </div>

        {/* Environment Configuration */}
        <div className="space-y-6">
          {Object.entries(groupedConfigs).map(([category, configs]) => (
            <div key={category} className="card">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                  {getCategoryIcon(category)}
                  <h2 className="text-lg font-medium text-gray-900 ml-2">{category} Configuration</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {configs.map((config) => (
                    <div key={config.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">{config.key}</span>
                          {config.isRequired && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Required
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(config.category)}`}>
                            {config.category}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {config.isEncrypted && (
                            <button
                              onClick={() => togglePasswordVisibility(config.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {showPasswords[config.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                          {editingConfig === config.id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleSaveConfig(config.id)}
                                disabled={saving}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-red-600 hover:text-red-700"
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditConfig(config)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{config.description}</p>
                      {editingConfig === config.id ? (
                        <div className="space-y-2">
                          <input
                            type={config.isEncrypted && !showPasswords[config.id] ? 'password' : 'text'}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Enter ${config.key} value`}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {config.isEncrypted && !showPasswords[config.id] ? '••••••••' : config.value}
                          </code>
                          <span className="text-xs text-gray-500">
                            Updated: {new Date(config.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
