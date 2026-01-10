import { useState } from 'react'
import { capitalizeAllStoryTags } from '../utils/githubApi'

function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleCapitalizeTags = async () => {
    if (!confirm('This will capitalize tags in all existing stories. Continue?')) {
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await capitalizeAllStoryTags()
      setResult(response)
    } catch (err) {
      setError(err.message || 'Failed to capitalize tags')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">Admin Utilities</h1>
        <p className="text-warm-600 dark:text-warm-400 text-sm">
          Utility functions for managing the archive
        </p>
      </div>

      <div className="bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-2 text-warm-900 dark:text-warm-50">Tag Capitalization</h2>
            <p className="text-sm text-warm-600 dark:text-warm-400 mb-4">
              Capitalize all tags in existing stories to ensure consistency. This will update all story metadata files
              and the stories index.
            </p>
            <button
              onClick={handleCapitalizeTags}
              disabled={loading}
              className="px-6 py-2.5 bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 rounded-md font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Capitalize All Tags'}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-green-800 dark:text-green-200 text-sm font-medium mb-1">Success!</p>
              <p className="text-green-700 dark:text-green-300 text-sm">{result.message}</p>
              {result.updatedCount > 0 && (
                <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                  Updated {result.updatedCount} story/stories
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminPage
