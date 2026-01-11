import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { loadStoryMetadata } from '../utils/storyLoader'
import { deleteStory, deleteChapter } from '../utils/githubApi'
import ConfirmDialog from '../components/ConfirmDialog'
import { getBookmark } from '../utils/bookmarkManager'
import EditIcon from '../components/icons/EditIcon'
import DeleteIcon from '../components/icons/DeleteIcon'
import { getGenreName } from '../utils/genreData'
import ContextMenuTrigger from '../components/ContextMenuTrigger'
import { SkeletonStoryMetadata } from '../components/Skeleton'

function StoryPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [bookmark, setBookmark] = useState(null)
  const [chapterToDelete, setChapterToDelete] = useState(null)
  const [showDeleteChapterDialog, setShowDeleteChapterDialog] = useState(false)
  const [deletingChapter, setDeletingChapter] = useState(false)

  useEffect(() => {
    async function fetchMetadata() {
      setLoading(true)
      // Check URL for refresh parameter to force fresh fetch
      const urlParams = new URLSearchParams(window.location.search)
      const forceRefresh = urlParams.get('refresh') === 'true'
      const data = await loadStoryMetadata(slug, forceRefresh)
      setMetadata(data)
      // Check for bookmark
      const bookmarkData = getBookmark(slug)
      setBookmark(bookmarkData)
      setLoading(false)
      // Remove refresh parameter from URL after loading
      if (forceRefresh) {
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.delete('refresh')
        const newSearch = urlParams.toString()
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '')
        window.history.replaceState({}, '', newUrl)
      }
    }
    fetchMetadata()
  }, [slug])

  if (loading) {
    return <SkeletonStoryMetadata />
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

  const handleDeleteChapter = async () => {
    if (!chapterToDelete) return
    setDeletingChapter(true)
    setError(null)
    try {
      const result = await deleteChapter(slug, chapterToDelete)
      if (result.success) {
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.set('refresh', 'true')
        window.location.href = window.location.pathname + '?' + urlParams.toString()
      } else {
        setError('Failed to delete chapter. Please try again.')
        setDeletingChapter(false)
        setShowDeleteChapterDialog(false)
        setChapterToDelete(null)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete chapter. Please check your GitHub token configuration.')
      setDeletingChapter(false)
      setShowDeleteChapterDialog(false)
      setChapterToDelete(null)
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
                className="p-2 bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
                title="Edit story"
                aria-label="Edit story"
              >
                <EditIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="Delete story"
                aria-label="Delete story"
              >
                <DeleteIcon className="w-4 h-4" />
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

        {((metadata.genres && metadata.genres.length > 0) || (metadata.tags && metadata.tags.length > 0)) && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {metadata.genres && metadata.genres.length > 0
                ? metadata.genres.map(genreId => (
                    <span
                      key={genreId}
                      className="px-3 py-1.5 bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-sm text-sm font-medium"
                    >
                      {getGenreName(genreId)}
                    </span>
                  ))
                : metadata.tags.map(tag => (
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
          {bookmark && bookmark.chapterNum && bookmark.chapterNum <= (metadata.chapters?.length || 0) && (
            <div className="mb-4">
              <Link
                to={`/story/${slug}/chapter/${bookmark.chapterNum}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 rounded-md hover:opacity-80 transition-opacity font-medium text-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Continue from Chapter {bookmark.chapterNum}
              </Link>
            </div>
          )}
          {metadata.chapters && metadata.chapters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {metadata.chapters.map((chapter, index) => {
                const chapterNum = index + 1
                const menuItems = [
                  {
                    label: 'Edit',
                    icon: <EditIcon className="w-4 h-4" />,
                    onClick: () => navigate(`/edit-chapter/${slug}/${chapterNum}`)
                  },
                  {
                    label: 'Delete',
                    icon: <DeleteIcon className="w-4 h-4" />,
                    onClick: () => {
                      setChapterToDelete(chapterNum)
                      setShowDeleteChapterDialog(true)
                    },
                    danger: true
                  }
                ]
                return (
                  <ContextMenuTrigger key={chapterNum} items={menuItems}>
                    <Link
                      to={`/story/${slug}/chapter/${chapterNum}`}
                      className="block p-2.5 bg-warm-50 dark:bg-warm-700 rounded-md border border-warm-200 dark:border-warm-600 hover:border-warm-400 dark:hover:border-warm-500 hover:bg-warm-100 dark:hover:bg-warm-600 transition-all group relative"
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
                  </ContextMenuTrigger>
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

      <ConfirmDialog
        isOpen={showDeleteChapterDialog}
        onClose={() => {
          setShowDeleteChapterDialog(false)
          setChapterToDelete(null)
        }}
        onConfirm={handleDeleteChapter}
        title="Delete Chapter"
        message={`Are you sure you want to delete Chapter ${chapterToDelete}? This will permanently delete this chapter and renumber remaining chapters. This action cannot be undone.`}
        confirmText={deletingChapter ? "Deleting..." : "Delete Chapter"}
        cancelText="Cancel"
        danger={true}
      />
    </div>
  )
}

export default StoryPage
