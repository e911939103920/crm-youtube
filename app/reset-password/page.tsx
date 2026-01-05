'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationContainer } from '@/components/Notification'
import { Logo } from '@/components/Logo'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { notifications, success, error, dismissNotification } = useNotifications()

  useEffect(() => {
    // Check if we have the necessary tokens in the URL
    const code = searchParams.get('code')
    if (!code) {
      error('Invalid reset link. Please request a new password reset.')
      setTimeout(() => router.push('/forgot-password'), 3000)
    }
  }, [searchParams, router, error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        error(updateError.message || 'Failed to reset password')
        return
      }

      success('Password reset successfully! Redirecting to login...')
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err: any) {
      error(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-white dark:bg-[#0A0A0A]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-6 sm:p-8 lg:p-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Logo href="/" className="mb-6" size="lg" />
        </div>

        <div className="mb-10">
          <h1 className="text-2xl font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Reset password</h1>
          <p className="text-sm text-[#666666] dark:text-[#999999]">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1 text-xs text-[#666666] dark:text-[#999999]">Minimum 6 characters</p>
          </div>

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-2.5 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              'Resetting password...'
            ) : (
              <>
                Reset password
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-[#666666] dark:text-[#999999] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] inline-flex items-center gap-2 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </motion.div>

      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  )
}
