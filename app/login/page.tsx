'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationContainer } from '@/components/Notification'
import { Logo } from '@/components/Logo'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { notifications, success, error, dismissNotification } = useNotifications()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        error(signInError.message || 'Invalid credentials')
        return
      }

      if (data.user) {
        success('Welcome back!')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 500)
      }
    } catch (err: any) {
      error(err.message || 'Login failed. Please try again.')
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
          <h1 className="text-2xl font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Welcome back</h1>
          <p className="text-sm text-[#666666] dark:text-[#999999]">Sign in to your GlassCRM account</p>
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

          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              'Signing in...'
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sm text-[#666666] dark:text-[#999999] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] hover:underline">
            Forgot password?
          </Link>
        </div>

        <div className="mt-6 text-center text-sm text-[#666666] dark:text-[#999999]">
          Don't have an account?{' '}
          <Link href="/signup" className="text-black dark:text-white hover:underline">
            Sign up
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
