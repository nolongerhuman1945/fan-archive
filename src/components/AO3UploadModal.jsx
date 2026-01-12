import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { downloadAO3Work, saveAO3WorkToRepo, extractWorkId } from '../utils/ao3Api'
import { useNotification } from '../contexts/NotificationContext'

function AO3UploadModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { addNotification, updateNotification } = useNotification()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const validateUrl = (urlString) => {
    if (!urlString.trim()) {
      return 'Please enter an AO3 URL'
    }
    
    try {
      const urlObj = new URL(urlString)
      if (!urlObj.hostname.includes('archiveofourown.org')) {
        return 'Please enter a valid Archive of Our Own URL (archiveofourown.org)'
      }
      
      const workId = extractWorkId(urlString)
      if (!workId) {
        return 'Could not extract work ID from URL. Please ensure the URL is a valid AO3 work URL (e.g., https://archiveofourown.org/works/123456)'
      }
      
      return null
    } catch (error) {
      return 'Please enter a valid URL'
    }
  }

  const handleFetch = async () => {
    setError(null)
    
    const validationError = validateUrl(url)
    if (validationError) {
      setError(validationError)
      return
    }

    const workId = extractWorkId(url)
    if (!workId) {
      setError('Could not extract work ID from URL.')
      return
    }

    // Close modal immediately and redirect to homepage
    onClose()
    navigate('/')

    // Start background download with progress notifications
    const notificationId = addNotification({
      type: 'loading',
      message: 'Downloading story from AO3...',
      duration: 0, // Don't auto-close loading notifications
      progress: 10,
    })

    setLoading(true)
    
    try {
      // Step 1: Download entire work (50% progress)
      updateNotification(notificationId, {
        message: 'Downloading story from AO3...',
        progress: 50,
      })

      const { metadata, chapters } = await downloadAO3Work(url)
      
      // Step 2: Saving to repository (80% progress)
      updateNotification(notificationId, {
        message: 'Saving to repository...',
        progress: 80,
      })
      
      const result = await saveAO3WorkToRepo(metadata, chapters, url)
      
      if (result.success) {
        // Step 3: Complete (100% progress)
        updateNotification(notificationId, {
          type: 'success',
          message: `"${metadata.title}" has been imported successfully!`,
          duration: 4000,
          progress: 100,
        })

        // Navigate to story page after a short delay
        setTimeout(() => {
          navigate(`/story/ao3-${result.workId}`)
        }, 500)
      } else {
        updateNotification(notificationId, {
          type: 'error',
          message: 'Failed to save story to repository. Please try again.',
          duration: 5000,
        })
      }
    } catch (err) {
      updateNotification(notificationId, {
        type: 'error',
        message: err.message || 'Failed to download story. Please try again.',
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setUrl('')
      setError(null)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-warm-200 dark:border-warm-700">
          <h3 className="text-lg font-medium text-warm-900 dark:text-warm-50">
            Import from Archive of Our Own
          </h3>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="ao3-url" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
              AO3 Work URL
            </label>
            <input
              type="text"
              id="ao3-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !loading) {
                  handleFetch()
                }
              }}
              placeholder="https://archiveofourown.org/works/123456"
              disabled={loading}
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-warm-500 dark:text-warm-400">
              Enter the URL of an AO3 work to download and import
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-warm-200 dark:border-warm-700 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            className="px-4 py-2 text-sm bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 rounded-md hover:opacity-80 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4"
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
            {loading ? 'Downloading...' : 'Download Story'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AO3UploadModal
