'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
  onUndo?: () => void
}

interface NotificationProps {
  notification: Notification
  onDismiss: (id: string) => void
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const colors = {
  success: 'border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#141414]',
  error: 'border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#141414]',
  info: 'border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#141414]',
  warning: 'border-[#E5E5E5] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#141414]',
}

export function NotificationToast({ notification, onDismiss }: NotificationProps) {
  const Icon = icons[notification.type]
  const duration = notification.duration || 3000

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(notification.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [notification.id, duration, onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`card p-4 mb-3 flex items-center gap-3 min-w-[300px] border ${colors[notification.type]}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm">{notification.message}</p>
      <div className="flex items-center gap-2">
        {notification.onUndo && (
          <button
            onClick={() => {
              notification.onUndo?.()
              onDismiss(notification.id)
            }}
            className="text-xs text-black dark:text-white hover:underline"
          >
            Undo
          </button>
        )}
        <button
          onClick={() => onDismiss(notification.id)}
          className="text-[#999999] hover:text-[#0A0A0A] dark:hover:text-[#FAFAFA] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

interface NotificationContainerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <AnimatePresence>
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={onDismiss}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
