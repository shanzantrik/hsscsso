'use client'

import { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardLayout from '@/components/DashboardLayout'

interface UserProfile {
  id: string
  fullName: string
  email: string
  phone: string
  role: string
  instituteName: string
  instituteCategory: string
  pincode: string
  address: string
  city: string
  state: string
  country: string
  isActive: boolean
  createdAt: string
  lastLoginAt: string | null
  profilePicture?: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Form state for editing
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: ''
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    checkAuthAndFetchProfile()
  }, [])

  const checkAuthAndFetchProfile = async () => {
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
        setCurrentUser(data.user)
        fetchProfile()
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

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setFormData({
          fullName: data.user.fullName || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          city: data.user.city || '',
          state: data.user.state || '',
          country: data.user.country || '',
          pincode: data.user.pincode || ''
        })
      } else {
        toast.error('Failed to fetch profile')
      }
    } catch (error) {
      toast.error('Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data to original values
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        pincode: profile.pincode || ''
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setIsEditing(false)
        toast.success('Profile updated successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to update profile')
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (response.ok) {
        toast.success('Password changed successfully')
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to change password')
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setUploadingImage(true)
    try {
      const token = localStorage.getItem('accessToken')
      const formData = new FormData()
      formData.append('profileImage', file)

      const response = await fetch('/api/user/upload-profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(prev => prev ? { ...prev, profilePicture: data.profileImage } : null)
        toast.success('Profile image updated successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to upload image')
      }
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'TEACHER':
        return 'bg-yellow-100 text-yellow-800'
      case 'STUDENT':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-5 h-5" />
      case 'TEACHER':
        return <GraduationCap className="w-5 h-5" />
      case 'STUDENT':
        return <User className="w-5 h-5" />
      default:
        return <User className="w-5 h-5" />
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={currentUser} loading={loading}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information and settings</p>
        </div>

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="card p-6">
                <div className="text-center">
                  {/* Profile Image */}
                  <div className="relative mx-auto mb-4">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto overflow-hidden">
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-gray-400" />
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>

                  {/* User Info */}
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{profile.fullName}</h2>
                  <p className="text-gray-600 mb-4">{profile.email}</p>

                  {/* Role Badge */}
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    {getRoleIcon(profile.role)}
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleColor(profile.role)}`}>
                      {profile.role}
                    </span>
                  </div>

                  {/* Institute Info */}
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <Building className="w-4 h-4" />
                      <span>{profile.instituteName}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>{profile.instituteCategory}</span>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2">
                      {profile.isActive ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${profile.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {profile.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className="btn-secondary flex items-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="btn-primary flex items-center"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="btn-secondary flex items-center"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="input-field"
                          value={formData.fullName}
                          onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.fullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {profile.email}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          className="input-field"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      ) : (
                        <p className="text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {profile.phone || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="input-field"
                          value={formData.pincode}
                          onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.pincode || 'Not provided'}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <textarea
                          className="input-field"
                          rows={3}
                          value={formData.address}
                          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        />
                      ) : (
                        <p className="text-gray-900 flex items-start">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                          {profile.address || 'Not provided'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="input-field"
                          value={formData.city}
                          onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.city || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="input-field"
                          value={formData.state}
                          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.state || 'Not provided'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          className="input-field"
                          value={formData.country}
                          onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.country || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="input-field pr-10"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="input-field"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        className="btn-primary"
                      >
                        {saving ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Member Since
                      </label>
                      <p className="text-gray-900">
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Login
                      </label>
                      <p className="text-gray-900">
                        {profile.lastLoginAt
                          ? new Date(profile.lastLoginAt).toLocaleString()
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
