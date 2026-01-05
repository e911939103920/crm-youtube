import { useState, useCallback } from 'react'
import { Notification, NotificationType } from '@/components/Notification'

export interface NotificationWithUndo extends Notification {
  onUndo?: () => void
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationWithUndo[]>([])

  const addNotification = useCallback(
    (type: NotificationType, message: string, duration?: number, onUndo?: () => void) => {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const notification: NotificationWithUndo = { id, type, message, duration, onUndo }
      setNotifications((prev) => [...prev, notification])
      return id
    },
    []
  )

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return {
    notifications,
    addNotification,
    dismissNotification,
    success: (message: string, duration?: number, onUndo?: () => void) =>
      addNotification('success', message, duration, onUndo),
    error: (message: string, duration?: number) =>
      addNotification('error', message, duration),
    info: (message: string, duration?: number) =>
      addNotification('info', message, duration),
    warning: (message: string, duration?: number) =>
      addNotification('warning', message, duration),
  }
}
