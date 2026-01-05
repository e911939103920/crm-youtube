'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Workflow, Users, CreditCard, Settings, Moon, Sun, LogOut, Menu, X, CheckCircle2 } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/pipeline', icon: Workflow, label: 'Pipeline' },
  { href: '/leads', icon: Users, label: 'Leads' },
  { href: '/tasks', icon: CheckCircle2, label: 'Tasks' },
  { href: '/billing', icon: CreditCard, label: 'Billing' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    router.push('/login')
    router.refresh()
  }

  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white dark:bg-[#0A0A0A] border-b border-[#E5E5E5] dark:border-[#2A2A2A]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-8 lg:gap-12">
          <Link href="/dashboard" className="text-base font-medium text-[#0A0A0A] dark:text-[#FAFAFA]">
            GlassCRM
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative px-3 py-2 transition-colors hover:bg-[#FAFAFA] dark:hover:bg-[#141414]"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-[#FAFAFA] dark:bg-[#141414]"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className="relative flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-normal">{item.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
          
          {user && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#FAFAFA] dark:bg-[#141414]">
                <div className="w-6 h-6 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-[#E5E5E5] dark:border-[#2A2A2A] bg-white dark:bg-[#0A0A0A]"
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                      isActive
                        ? 'bg-[#FAFAFA] dark:bg-[#141414]'
                        : 'hover:bg-[#FAFAFA] dark:hover:bg-[#141414]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-normal">{item.label}</span>
                  </Link>
                )
              })}
              {user && (
                <div className="pt-2 mt-2 border-t border-[#E5E5E5] dark:border-[#2A2A2A]">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="w-6 h-6 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{user.name}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
