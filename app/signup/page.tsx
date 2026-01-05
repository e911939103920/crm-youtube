'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationContainer } from '@/components/Notification'
import { Logo } from '@/components/Logo'

export default function SignupPage() {
  const [name, setName] = useState('')
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
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      })

      if (signUpError) {
        error(signUpError.message || 'Signup failed')
        return
      }

      if (data.user) {
        success('Account created! Please check your email to verify your account.')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 2000)
      }
    } catch (err: any) {
      error(err.message || 'Signup failed. Please try again.')
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
          <h1 className="text-2xl font-medium mb-1 text-[#0A0A0A] dark:text-[#FAFAFA]">Create account</h1>
          <p className="text-sm text-[#666666] dark:text-[#999999]">Start managing your leads beautifully</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm mb-2 text-[#666666] dark:text-[#999999]">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>

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
                minLength={6}
                className="w-full pl-10 pr-4 py-2.5 card focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1 text-xs text-[#666666] dark:text-[#999999]">Minimum 6 characters</p>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-2.5 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              'Creating account...'
            ) : (
              <>
                Create account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-sm text-[#666666] dark:text-[#999999]">
          Already have an account?{' '}
          <Link href="/login" className="text-black dark:text-white hover:underline">
            Sign in
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
