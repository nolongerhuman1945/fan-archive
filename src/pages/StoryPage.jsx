import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { loadStoryMetadata } from '../utils/storyLoader'
import { deleteStory } from '../utils/githubApi'
import ConfirmDialog from '../components/ConfirmDialog'

function StoryPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchMetadata() {
      setLoading(true)
      const data = await loadStoryMetadata(slug)
      setMetadata(data)
      setLoading(false)
    }
    fetchMetadata()
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-warm-600 dark:text-warm-400">Loading story...</div>
      </div>
    )
  }

  if (!metadata) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-medium mb-4 text-warm-900 dark:text-warm-50">Story not found</h1>
        <Link to="/" className="text-warm-700 dark:text-warm-300 hover:opacity-70 transition-opacity underline underline-offset-2">
          Return to homepage
        </Link>
      </div>
    )
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      const result = await deleteStory(slug)
      if (result.success) {
        navigate('/')
      } else {
        setError('Failed to delete story. Please try again.')
        setDeleting(false)
        setShowDeleteDialog(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete story. Please check your GitHub token configuration.')
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const ratingColors = {
    'G': 'bg-warm-100 text-warm-700 dark:bg-warm-800 dark:text-warm-300',
    'PG': 'bg-warm-200 text-warm-800 dark:bg-warm-700 dark:text-warm-200',
    'PG-13': 'bg-warm-300 text-warm-900 dark:bg-warm-600 dark:text-warm-100',
    'R': 'bg-warm-400 text-warm-900 dark:bg-warm-500 dark:text-warm-50',
    'M': 'bg-warm-500 text-white dark:bg-warm-400 dark:text-warm-900',
  }

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center text-warm-700 dark:text-warm-300 hover:opacity-70 transition-opacity mb-6 text-sm font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to stories
      </Link>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 p-6 md:p-8 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">
              {metadata.title}
            </h1>
            <p className="text-warm-600 dark:text-warm-400 mb-4">
              by {metadata.author}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 text-sm font-medium rounded-sm ${
              ratingColors[metadata.rating] || ratingColors['PG']
            }`}>
              {metadata.rating}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/edit-story/${slug}`)}
                className="px-3 py-1.5 text-xs bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors font-medium"
                title="Edit story"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors font-medium"
                title="Delete story"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {metadata.summary && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">Summary</h2>
            <p className="text-warm-700 dark:text-warm-300 leading-relaxed whitespace-pre-line">
              {metadata.summary}
            </p>
          </div>
        )}

        {metadata.tags && metadata.tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {metadata.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-sm text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-warm-200 dark:border-warm-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-medium text-warm-900 dark:text-warm-50 tracking-tight">Chapters</h2>
            <button
              onClick={() => navigate(`/upload?story=${slug}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 rounded-md hover:opacity-80 transition-opacity font-medium"
              aria-label="Add chapter"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Chapter
            </button>
          </div>
          {metadata.chapters && metadata.chapters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {metadata.chapters.map((chapter, index) => {
                const chapterNum = index + 1
                return (
                  <Link
                    key={chapterNum}
                    to={`/story/${slug}/chapter/${chapterNum}`}
                    className="block p-2.5 bg-warm-50 dark:bg-warm-700 rounded-md border border-warm-200 dark:border-warm-600 hover:border-warm-400 dark:hover:border-warm-500 hover:bg-warm-100 dark:hover:bg-warm-600 transition-all group"
                  >
                    <div className="font-medium text-warm-900 dark:text-warm-50 mb-0.5 group-hover:opacity-80 transition-opacity text-xs">
                      Chapter {chapterNum}
                    </div>
                    {chapter.title && (
                      <div className="text-xs text-warm-600 dark:text-warm-400 leading-snug line-clamp-2">
                        {chapter.title}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          ) : (
            <p className="text-warm-600 dark:text-warm-400">No chapters available.</p>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Story"
        message={`Are you sure you want to delete "${metadata.title}"? This will permanently delete the story and all its chapters. This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete Story"}
        cancelText="Cancel"
        danger={true}
      />
    </div>
  )
}

export default StoryPage
