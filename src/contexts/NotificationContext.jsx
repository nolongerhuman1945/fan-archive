import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      type: notification.type || 'info', // 'info', 'success', 'error', 'loading'
      message: notification.message,
      duration: notification.duration || (notification.type === 'error' ? 5000 : 3000),
      onClose: notification.onClose,
      progress: notification.progress, // For loading notifications
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove after duration (unless it's a loading notification)
    if (newNotification.type !== 'loading' && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const updateNotification = useCallback((id, updates) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, ...updates } : n)
    )
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        updateNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
