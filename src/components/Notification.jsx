import { useEffect } from 'react'
import { useNotification } from '../contexts/NotificationContext'

function Notification({ notification }) {
  const { removeNotification } = useNotification()

  useEffect(() => {
    if (notification.type !== 'loading' && notification.duration > 0) {
      const timer = setTimeout(() => {
        removeNotification(notification.id)
      }, notification.duration)
      return () => clearTimeout(timer)
    }
  }, [notification, removeNotification])

  const handleClose = () => {
    if (notification.onClose) {
      notification.onClose()
    }
    removeNotification(notification.id)
  }

  const typeStyles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    loading: 'bg-warm-100 dark:bg-warm-800 border-warm-300 dark:border-warm-700 text-warm-800 dark:text-warm-200',
  }

  return (
    <div
      className={`relative p-3 pr-8 rounded-md border shadow-lg backdrop-blur-sm ${typeStyles[notification.type] || typeStyles.info} transition-all duration-300`}
      role="alert"
    >
      <div className="flex items-start gap-2">
        {notification.type === 'loading' && (
          <svg
            className="animate-spin h-4 w-4 mt-0.5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {notification.type === 'success' && (
          <svg
            className="h-4 w-4 mt-0.5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {notification.type === 'error' && (
          <svg
            className="h-4 w-4 mt-0.5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">{notification.message}</p>
          {notification.progress !== undefined && (
            <div className="mt-2">
              <div className="w-full bg-warm-200 dark:bg-warm-700 rounded-full h-1.5">
                <div
                  className="bg-warm-600 dark:bg-warm-400 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, notification.progress))}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {notification.type !== 'loading' && (
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-current opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Close notification"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default function NotificationContainer() {
  const { notifications } = useNotification()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-20 right-2 sm:right-4 z-50 space-y-2 max-w-sm w-[calc(100%-1rem)] sm:w-full pointer-events-none">
      {notifications.map(notification => (
        <div key={notification.id} className="pointer-events-auto animate-[slideIn_0.3s_ease-out]">
          <Notification notification={notification} />
        </div>
      ))}
    </div>
  )
}
