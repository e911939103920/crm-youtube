'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Palette, 
  Building, 
  Link as LinkIcon, 
  Save, 
  Download,
  Trash2,
  Key,
  Shield,
  Database,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { useTheme } from '@/components/ThemeProvider'
import { Navbar } from '@/components/Navbar'
import { NotificationContainer } from '@/components/Notification'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import Papa from 'papaparse'

export default function SettingsPage() {
  // ALL HOOKS MUST BE CALLED FIRST - NO CONDITIONAL RETURNS BEFORE THIS
  const router = useRouter()
  const { isAuthenticated, user, setUser, leads, tasks, savedLists, logout } = useStore()
  const { theme, toggleTheme } = useTheme()
  const { notifications, success, error, dismissNotification } = useNotifications()
  const { loading: authLoading } = useAuth()
  const supabase = createClient()
  
  const [activeTab, setActiveTab] = useState('account')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    notifications: true,
    emailNotifications: true,
  })
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isDeleting, setIsDeleting] = useState(false)

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        company: '',
        notifications: true,
        emailNotifications: true,
      })
    }
  }, [user])

  // NOW we can do conditional returns after ALL hooks are called
  if (authLoading) {
    return (
      <div className="min-h-screen pt-14 flex items-center justify-center">
        <div className="text-sm text-[#666666] dark:text-[#999999]">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleSave = async () => {
    if (user) {
      try {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            name: formData.name,
            email: formData.email,
            company: formData.company,
          })
          .eq('id', user.id)

        if (updateError) throw updateError

        setUser({ ...user, name: formData.name, email: formData.email })
        success('Settings saved successfully')
      } catch (err: any) {
        console.error('Error saving settings:', err)
        error('Failed to save settings. Please try again.')
      }
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      error('Password must be at least 6 characters')
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (updateError) throw updateError

      success('Password updated successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordFields(false)
    } catch (err: any) {
      console.error('Error updating password:', err)
      error('Failed to update password. Please try again.')
    }
  }

  const handleExportData = () => {
    try {
      // Export leads
      const leadsCSV = Papa.unparse(leads)
      const leadsBlob = new Blob([leadsCSV], { type: 'text/csv' })
      const leadsUrl = window.URL.createObjectURL(leadsBlob)
      const leadsLink = document.createElement('a')
      leadsLink.href = leadsUrl
      leadsLink.download = `glasscrm-leads-${new Date().toISOString().split('T')[0]}.csv`
      leadsLink.click()

      // Export tasks
      const tasksCSV = Papa.unparse(tasks)
      const tasksBlob = new Blob([tasksCSV], { type: 'text/csv' })
      const tasksUrl = window.URL.createObjectURL(tasksBlob)
      const tasksLink = document.createElement('a')
      tasksLink.href = tasksUrl
      tasksLink.download = `glasscrm-tasks-${new Date().toISOString().split('T')[0]}.csv`
      tasksLink.click()

      success('Data exported successfully')
    } catch (err) {
      console.error('Error exporting data:', err)
      error('Failed to export data')
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.')) {
      return
    }

    if (!confirm('This is your last chance. All your leads, tasks, and saved lists will be permanently deleted.')) {
      return
    }

    setIsDeleting(true)
    try {
      // Delete all user data first
      const { error: deleteError } = await supabase.auth.deleteUser()
      
      if (deleteError) throw deleteError

      await logout()
      success('Account deleted successfully')
      router.push('/')
    } catch (err: any) {
      console.error('Error deleting account:', err)
      error('Failed to delete account. Please contact support.')
      setIsDeleting(false)
    }
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'data', label: 'Data & Export', icon: Database },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
  ]

  return (
    <div className="min-h-screen pt-16 bg-white dark:bg-[#0A0A0A]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium mb-1 sm:mb-2 text-[#0A0A0A] dark:text-[#FAFAFA]">Settings</h1>
          <p className="text-sm text-[#666666] dark:text-[#999999]">Manage your account preferences and data</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="card p-2 flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-[#FAFAFA] dark:bg-[#141414] font-medium text-[#0A0A0A] dark:text-[#FAFAFA]'
                        : 'hover:bg-[#FAFAFA] dark:hover:bg-[#141414] text-[#666666] dark:text-[#999999]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="card p-4 sm:p-6"
            >
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">Account Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                          placeholder="your@email.com"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 btn-primary"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">Security</h3>
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Change Password</h4>
                            <p className="text-xs text-[#666666] dark:text-[#999999]">Update your account password</p>
                          </div>
                          <button
                            onClick={() => setShowPasswordFields(!showPasswordFields)}
                            className="text-sm text-[#666666] dark:text-[#999999] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA]"
                          >
                            {showPasswordFields ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {showPasswordFields && (
                          <div className="space-y-4 p-4 bg-[#FAFAFA] dark:bg-[#141414]">
                            <div>
                              <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">New Password</label>
                              <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                placeholder="Enter new password"
                              />
                            </div>
                            <div>
                              <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Confirm Password</label>
                              <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                                placeholder="Confirm new password"
                              />
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={handlePasswordChange}
                              className="flex items-center gap-2 px-4 py-2 btn-primary"
                            >
                              <Key className="w-4 h-4" />
                              Update Password
                            </motion.button>
                          </div>
                        )}
                      </div>

                      <div className="pt-6 border-t border-[#E5E5E5] dark:border-[#2A2A2A]">
                        <h4 className="text-sm font-medium mb-2 text-red-600 dark:text-red-400">Danger Zone</h4>
                        <p className="text-xs text-[#666666] dark:text-[#999999] mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          {isDeleting ? 'Deleting...' : 'Delete Account'}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">Appearance</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-4 text-[#666666] dark:text-[#999999]">Theme</label>
                        <div className="flex gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (theme === 'dark') toggleTheme()
                            }}
                            className={`flex-1 p-4 border-2 transition-all ${
                              theme === 'light'
                                ? 'border-black dark:border-white bg-[#FAFAFA] dark:bg-[#141414]'
                                : 'border-[#E5E5E5] dark:border-[#2A2A2A]'
                            }`}
                          >
                            <div className="text-sm font-medium mb-2 text-[#0A0A0A] dark:text-[#FAFAFA]">Light</div>
                            <div className="w-full h-16 bg-white border border-[#E5E5E5]"></div>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (theme === 'light') toggleTheme()
                            }}
                            className={`flex-1 p-4 border-2 transition-all ${
                              theme === 'dark'
                                ? 'border-black dark:border-white bg-[#FAFAFA] dark:bg-[#141414]'
                                : 'border-[#E5E5E5] dark:border-[#2A2A2A]'
                            }`}
                          >
                            <div className="text-sm font-medium mb-2 text-[#0A0A0A] dark:text-[#FAFAFA]">Dark</div>
                            <div className="w-full h-16 bg-[#0A0A0A] border border-[#2A2A2A]"></div>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#FAFAFA] dark:bg-[#141414]">
                        <div>
                          <div className="text-sm font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Push Notifications</div>
                          <div className="text-xs text-[#666666] dark:text-[#999999]">Receive notifications in the app</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.notifications}
                            onChange={(e) =>
                              setFormData({ ...formData, notifications: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#E5E5E5] dark:bg-[#2A2A2A] peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#FAFAFA] dark:bg-[#141414]">
                        <div>
                          <div className="text-sm font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Email Notifications</div>
                          <div className="text-xs text-[#666666] dark:text-[#999999]">Receive email updates</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.emailNotifications}
                            onChange={(e) =>
                              setFormData({ ...formData, emailNotifications: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#E5E5E5] dark:bg-[#2A2A2A] peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:h-5 after:w-5 after:transition-all peer-checked:bg-black dark:peer-checked:bg-white"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'company' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">Company Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Company Name</label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="w-full px-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                          placeholder="Your company name"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 btn-primary"
                      >
                        <Save className="w-4 h-4" />
                        Save Company Info
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">Data & Export</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-[#FAFAFA] dark:bg-[#141414]">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Export Your Data</h4>
                            <p className="text-xs text-[#666666] dark:text-[#999999]">
                              Download all your leads and tasks as CSV files
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4 text-xs text-[#666666] dark:text-[#999999]">
                          <div>• {leads.length} leads</div>
                          <div>• {tasks.length} tasks</div>
                          <div>• {savedLists.length} saved lists</div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={handleExportData}
                          className="flex items-center gap-2 px-4 py-2 btn-primary"
                        >
                          <Download className="w-4 h-4" />
                          Export All Data
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-6 text-[#0A0A0A] dark:text-[#FAFAFA]">Integrations</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-[#FAFAFA] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#2A2A2A]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">Supabase</div>
                          <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            Connected
                          </span>
                        </div>
                        <div className="text-xs text-[#666666] dark:text-[#999999]">
                          Your data is securely stored in Supabase with Row Level Security
                        </div>
                      </div>
                      <div className="p-4 bg-[#FAFAFA] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#2A2A2A]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">Stripe</div>
                          <span className="text-xs px-2 py-1 bg-[#FAFAFA] dark:bg-[#141414] text-[#666666] dark:text-[#999999]">
                            Coming Soon
                          </span>
                        </div>
                        <div className="text-xs text-[#666666] dark:text-[#999999]">
                          Integrate Stripe for payment processing
                        </div>
                      </div>
                      <div className="p-4 bg-[#FAFAFA] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#2A2A2A]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">Email Integration</div>
                          <span className="text-xs px-2 py-1 bg-[#FAFAFA] dark:bg-[#141414] text-[#666666] dark:text-[#999999]">
                            Coming Soon
                          </span>
                        </div>
                        <div className="text-xs text-[#666666] dark:text-[#999999]">
                          Connect your email for automated lead capture
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  )
}
