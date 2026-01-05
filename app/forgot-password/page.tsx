'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationContainer } from '@/components/Notification'
import { Logo } from '@/components/Logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { notifications, success, error, dismissNotification } = useNotifications()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        error(resetError.message || 'Failed to send reset email')
        return
      }

      setEmailSent(true)
      success('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      error(err.message || 'Failed to send reset email. Please try again.')
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

        {!emailSent ? (
          <>
            <div className="mb-10">
              <h1 className="text-2xl font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Forgot password?</h1>
              <p className="text-sm text-[#666666] dark:text-[#999999]">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                    placeholder="you@example.com"
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
                  'Sending...'
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-medium mb-2 text-[#0A0A0A] dark:text-[#FAFAFA]">Check your email</h2>
              <p className="text-sm text-[#666666] dark:text-[#999999] mb-4">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-xs text-[#666666] dark:text-[#999999]">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
            <motion.button
              onClick={() => setEmailSent(false)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-secondary px-4 py-2 text-sm"
            >
              Try again
            </motion.button>
          </div>
        )}

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
