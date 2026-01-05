'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Check, Download, CreditCard, Sparkles } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Navbar } from '@/components/Navbar'
import { NotificationContainer } from '@/components/Notification'
import { useNotifications } from '@/hooks/useNotifications'

const plans = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    features: [
      'Up to 100 leads',
      'Basic pipeline management',
      'CSV import/export',
      'Email support',
    ],
    popular: false,
  },
  {
    name: 'Professional',
    price: '$29',
    period: '/month',
    features: [
      'Unlimited leads',
      'Advanced analytics',
      'Team collaboration',
      'Priority support',
      'Custom fields',
      'API access',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'On-premise deployment',
    ],
    popular: false,
  },
]

export default function BillingPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useStore()
  const { notifications, success, dismissNotification } = useNotifications()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const handleUpgrade = (planName: string) => {
    success(`Upgrading to ${planName} plan...`)
    // In production, this would integrate with Stripe
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    success('Invoice downloaded')
    // In production, this would download the actual invoice
  }

  const invoices = [
    { id: 'INV-001', date: '2024-01-15', amount: 29, status: 'Paid' },
    { id: 'INV-002', date: '2024-02-15', amount: 29, status: 'Paid' },
    { id: 'INV-003', date: '2024-03-15', amount: 29, status: 'Pending' },
  ]

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium mb-1 sm:mb-2 text-[#0A0A0A] dark:text-[#FAFAFA]">Billing</h1>
          <p className="text-sm text-[#666666] dark:text-[#999999]">Manage your subscription and payment methods</p>
        </div>

        {/* Current Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium mb-1">Current Plan</h3>
              <p className="text-sm opacity-70">Professional Plan</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-medium">$29</div>
              <div className="text-sm opacity-70">per month</div>
            </div>
          </div>
          <div className="text-sm opacity-70">
            Next billing date: April 15, 2024
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <h3 className="text-lg font-medium mb-4">Payment Method</h3>
          <div className="flex items-center gap-4 p-4 bg-[#FAFAFA] dark:bg-[#141414]">
            <CreditCard className="w-6 h-6 opacity-70" />
            <div className="flex-1">
              <div className="text-sm font-medium">•••• •••• •••• 4242</div>
              <div className="text-xs opacity-70">Expires 12/2025</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-sm text-black dark:text-white hover:underline"
            >
              Update
            </motion.button>
          </div>
        </motion.div>

        {/* Plans */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-6">Available Plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card p-6 relative ${
                  plan.popular ? 'border-2 border-accent-light dark:border-accent-dark' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Popular
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="text-xl font-medium mb-2">{plan.name}</h4>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-medium">{plan.price}</span>
                    <span className="text-sm opacity-70 ml-1">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleUpgrade(plan.name)}
                  className={`w-full py-2.5 rounded-lg font-medium transition-opacity ${
                    plan.popular
                      ? 'bg-btn-primary text-white hover:opacity-90'
                      : 'card border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-white/10'
                  }`}
                >
                  {plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Invoices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-medium mb-4">Invoice History</h3>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="text-sm font-medium">{invoice.id}</div>
                    <div className="text-xs opacity-70">{invoice.date}</div>
                  </div>
                  <div className="text-sm">
                    ${invoice.amount}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 ${
                      invoice.status === 'Paid'
                        ? 'bg-[#FAFAFA] dark:bg-[#141414] text-[#666666] dark:text-[#999999]'
                        : 'bg-[#FAFAFA] dark:bg-[#141414] text-[#666666] dark:text-[#999999]'
                    }`}
                  >
                    {invoice.status}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDownloadInvoice(invoice.id)}
                  className="p-2 hover:bg-[#FAFAFA] dark:hover:bg-[#141414] transition-colors"
                >
                  <Download className="w-4 h-4" />
                </motion.button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <NotificationContainer
        notifications={notifications}
        onDismiss={dismissNotification}
      />
    </div>
  )
}
