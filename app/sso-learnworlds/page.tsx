'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react'

interface SSOFormData {
  email: string
  password: string
  username?: string
  confirmPassword?: string
}

export default function SSOGateway() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [action, setAction] = useState<'login' | 'passwordreset'>('login')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<SSOFormData>({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  })

    useEffect(() => {
    const actionParam = searchParams.get('action') as 'login' | 'passwordreset'
    const redirectParam = searchParams.get('redirectUrl')
 
    if (actionParam) {
      setAction(actionParam)
    }
 
    if (redirectParam) {
      setRedirectUrl(decodeURIComponent(redirectParam))
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return false
    }

    return true
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store tokens
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)

        // Call LearnWorlds SSO API
        await callLearnWorldsSSO(data.user, redirectUrl)
      } else {
        toast.error(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password reset email sent successfully')
        // Redirect back to LearnWorlds
        if (redirectUrl) {
          window.location.href = redirectUrl
        }
      } else {
        toast.error(data.message || 'Password reset failed')
      }
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error('An error occurred during password reset')
    } finally {
      setIsLoading(false)
    }
  }

  const callLearnWorldsSSO = async (user: any, redirectUrl: string) => {
    try {
      const response = await fetch('/api/sso/learnworlds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          email: user.email,
          username: user.fullName || user.username,
          redirectUrl: redirectUrl,
          user_id: user.id,
        }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Redirect to LearnWorlds with SSO
        window.location.href = data.url
      } else {
        toast.error('SSO integration failed')
        // Fallback redirect
        if (redirectUrl) {
          window.location.href = redirectUrl
        }
      }
    } catch (error) {
      console.error('SSO error:', error)
      toast.error('SSO integration failed')
      // Fallback redirect
      if (redirectUrl) {
        window.location.href = redirectUrl
      }
    }
  }

  const getPageTitle = () => {
    switch (action) {
      case 'login':
        return 'Sign In to HSSC'
      case 'passwordreset':
        return 'Reset Password'
      default:
        return 'Authentication'
    }
  }

  const getPageDescription = () => {
    switch (action) {
      case 'login':
        return 'Sign in to access your learning portal'
      case 'passwordreset':
        return 'Enter your email to reset your password'
      default:
        return 'Authentication required'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="/logo.jpg"
              alt="HSSC Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getPageTitle()}
          </h1>
          <p className="text-gray-600">
            {getPageDescription()}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <form onSubmit={action === 'login' ? handleLogin : handlePasswordReset}>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {action !== 'passwordreset' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}



            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                action === 'login' ? 'Sign In' : 'Send Reset Email'
              )}
            </button>
          </form>

          {/* Action Links */}
          <div className="mt-6 text-center">
            {action === 'login' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <button
                    onClick={() => {
                      const url = new URL(window.location.href)
                      url.searchParams.set('action', 'passwordreset')
                      window.location.href = url.toString()
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot your password?
                  </button>
                </p>
              </div>
            )}

            {action === 'passwordreset' && (
              <p className="text-sm text-gray-600">
                Remember your password?{' '}
                <button
                  onClick={() => {
                    const url = new URL(window.location.href)
                    url.searchParams.set('action', 'login')
                    window.location.href = url.toString()
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Back to LearnWorlds */}
          {redirectUrl && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => window.location.href = redirectUrl}
                className="w-full flex items-center justify-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Learning Portal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
