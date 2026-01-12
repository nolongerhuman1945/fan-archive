import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { loadStoryMetadata, loadChapter } from '../utils/storyLoader'
import { deleteChapter } from '../utils/githubApi'
import ConfirmDialog from '../components/ConfirmDialog'
import { setBookmark } from '../utils/bookmarkManager'
import ReadingSettingsPanel from '../components/ReadingSettingsPanel'
import { getReadingSettings, getReadingStyles } from '../utils/readingSettings'
import EditIcon from '../components/icons/EditIcon'
import DeleteIcon from '../components/icons/DeleteIcon'
import { SkeletonChapterContent } from '../components/Skeleton'

function ChapterPage({ 
  content: providedContent, 
  source, 
  metadata: providedMetadata,
  customNavigation,
  storySlug: providedStorySlug
}) {
  const { slug, chapterNum } = useParams()
  const navigate = useNavigate()
  const [metadata, setMetadata] = useState(providedMetadata || null)
  const [content, setContent] = useState(providedContent || null)
  const [loading, setLoading] = useState(!providedContent && !providedMetadata)
  const [readingProgress, setReadingProgress] = useState(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [readingStyles, setReadingStyles] = useState(null)
  const [settingsVisible, setSettingsVisible] = useState(true)
  const contentRef = useRef(null)
  const lastScrollY = useRef(0)

  // Use provided slug or fallback to params slug
  const storySlug = providedStorySlug || slug
  const currentChapter = parseInt(chapterNum, 10)
  const totalChapters = metadata?.chapters?.length || 0
  const isAO3 = source === 'ao3'

  useEffect(() => {
    // Update state when provided props change
    if (providedContent !== undefined) {
      setContent(providedContent)
    }
    if (providedMetadata !== undefined) {
      setMetadata(providedMetadata)
    }

    // Skip loading if content and metadata are provided
    if (providedContent && providedMetadata) {
      setLoading(false)
      // Update bookmark when chapter is loaded
      if (storySlug && currentChapter) {
        setBookmark(storySlug, currentChapter)
      }
      return
    }

    // Skip loading if source is AO3 (content will be passed from parent)
    if (source === 'ao3') {
      return
    }

    async function fetchData() {
      setLoading(true)
      // Check URL for refresh parameter to force fresh fetch
      const urlParams = new URLSearchParams(window.location.search)
      const forceRefresh = urlParams.get('refresh') === 'true'
      const [storyData, chapterData] = await Promise.all([
        loadStoryMetadata(slug, forceRefresh),
        loadChapter(slug, currentChapter, forceRefresh)
      ])
      setMetadata(storyData)
      setContent(chapterData)
      setLoading(false)
      
      // Update bookmark when chapter is loaded
      if (storyData && currentChapter) {
        setBookmark(slug, currentChapter)
      }
      
      // Remove refresh parameter from URL after loading
      if (forceRefresh) {
        const urlParams = new URLSearchParams(window.location.search)
        urlParams.delete('refresh')
        const newSearch = urlParams.toString()
        const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '')
        window.history.replaceState({}, '', newUrl)
      }
    }
    fetchData()
  }, [slug, currentChapter, providedContent, providedMetadata, source, storySlug])

  // Load reading settings on mount
  useEffect(() => {
    const settings = getReadingSettings()
    const styles = getReadingStyles(settings)
    setReadingStyles(styles)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollableHeight = documentHeight - windowHeight
      const progress = (scrollTop / scrollableHeight) * 100

      setReadingProgress(Math.min(Math.max(progress, 0), 100))

      // Hide/show settings panel based on scroll direction
      if (scrollTop < 10) {
        setSettingsVisible(true)
      } else if (scrollTop > lastScrollY.current && scrollTop > 100) {
        setSettingsVisible(false)
      } else if (scrollTop < lastScrollY.current) {
        setSettingsVisible(true)
      }

      lastScrollY.current = scrollTop
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [content])

  useEffect(() => {
    const savedProgress = localStorage.getItem(`reading-${storySlug}-${currentChapter}`)
    if (savedProgress && contentRef.current) {
      window.scrollTo(0, parseInt(savedProgress, 10))
    }
  }, [content, storySlug, currentChapter])

  useEffect(() => {
    const handleScrollSave = () => {
      if (contentRef.current) {
        localStorage.setItem(`reading-${storySlug}-${currentChapter}`, window.pageYOffset.toString())
      }
    }

    const timeout = setTimeout(handleScrollSave, 1000)
    return () => clearTimeout(timeout)
  }, [storySlug, currentChapter])

  const goToChapter = (newChapterNum) => {
    if (newChapterNum >= 1 && newChapterNum <= totalChapters) {
      if (customNavigation) {
        customNavigation(newChapterNum)
      } else {
        navigate(`/story/${slug}/chapter/${newChapterNum}`)
      }
      window.scrollTo(0, 0)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      const result = await deleteChapter(slug, currentChapter)
      if (result.success) {
        if (currentChapter === 1 && totalChapters === 1) {
          navigate(`/story/${slug}`)
        } else if (currentChapter === totalChapters) {
          navigate(`/story/${slug}/chapter/${currentChapter - 1}`)
        } else {
          navigate(`/story/${slug}/chapter/${currentChapter}`)
        }
      } else {
        setError('Failed to delete chapter. Please try again.')
        setDeleting(false)
        setShowDeleteDialog(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to delete chapter. Please check your GitHub token configuration.')
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return <SkeletonChapterContent />
  }

  if (!metadata || !content) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-medium mb-4 text-warm-900 dark:text-warm-50">Chapter not found</h1>
        <Link to={`/story/${slug}`} className="text-warm-700 dark:text-warm-300 hover:opacity-70 transition-opacity underline underline-offset-2">
          Return to story
        </Link>
      </div>
    )
  }

  const chapterTitle = metadata.chapters?.[currentChapter - 1]?.title || `Chapter ${currentChapter}`

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md max-w-4xl mx-auto">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <div className={`sticky top-[64px] z-40 bg-warm-50/95 dark:bg-[#14191A]/95 backdrop-blur-sm border-b border-warm-200 dark:border-warm-800 mb-6 transition-transform duration-300 ${
        settingsVisible ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link
              to={`/story/${slug}`}
              className="inline-flex items-center text-warm-700 dark:text-warm-300 hover:opacity-70 transition-opacity text-sm font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              {metadata.title}
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-warm-600 dark:text-warm-400 font-medium">
                Chapter {currentChapter} of {totalChapters}
              </span>
              <div className="flex items-center gap-2">
                <ReadingSettingsPanel onSettingsChange={setReadingStyles} />
                {!isAO3 && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/edit-chapter/${slug}/${currentChapter}`)}
                      className="p-1.5 bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
                      title="Edit chapter"
                      aria-label="Edit chapter"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      disabled={totalChapters === 1}
                      className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={totalChapters === 1 ? "Cannot delete the only chapter" : "Delete chapter"}
                      aria-label={totalChapters === 1 ? "Cannot delete the only chapter" : "Delete chapter"}
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full bg-warm-200/50 dark:bg-warm-700/30 rounded-full h-[1px]">
            <div
              className="bg-warm-900/60 dark:bg-warm-100/50 h-[1px] rounded-full transition-all duration-300"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4">
        <header className="mb-8 text-center pb-6 border-b border-warm-200 dark:border-warm-700">
          <h1 className="text-2xl md:text-3xl font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">
            {chapterTitle}
          </h1>
          <p className="text-warm-600 dark:text-warm-400">
            {metadata.title} • Chapter {currentChapter}
          </p>
        </header>

        <div 
          ref={contentRef} 
          className="prose-content mb-12"
          style={readingStyles ? {
            '--reading-font-family': readingStyles.fontFamily,
            '--reading-font-size': readingStyles.fontSize,
            '--reading-bg-color': readingStyles.backgroundColor,
            '--reading-text-color': readingStyles.color,
            padding: readingStyles.backgroundColor !== 'transparent' ? '1.5rem' : '0',
            borderRadius: readingStyles.backgroundColor !== 'transparent' ? '0.5rem' : '0'
          } : {}}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>

        <nav className="border-t border-warm-200 dark:border-warm-700 pt-8 pb-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => goToChapter(currentChapter - 1)}
              disabled={currentChapter === 1}
              className={`px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2 ${
                currentChapter === 1
                  ? 'bg-warm-100 dark:bg-warm-800 text-warm-400 dark:text-warm-600 cursor-not-allowed opacity-50'
                  : 'bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 hover:opacity-80'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Previous Chapter
            </button>

            <Link
              to={`/story/${slug}`}
              className="px-6 py-3 rounded-md font-medium bg-warm-200 dark:bg-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-300 dark:hover:bg-warm-600 transition-colors"
            >
              Story Index
            </Link>

            <button
              onClick={() => goToChapter(currentChapter + 1)}
              disabled={currentChapter === totalChapters}
              className={`px-6 py-3 rounded-md font-medium transition-all flex items-center gap-2 ${
                currentChapter === totalChapters
                  ? 'bg-warm-100 dark:bg-warm-800 text-warm-400 dark:text-warm-600 cursor-not-allowed opacity-50'
                  : 'bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 hover:opacity-80'
              }`}
            >
              Next Chapter
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </nav>
      </article>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Chapter"
        message={`Are you sure you want to delete "${chapterTitle}"? This will permanently delete this chapter and renumber remaining chapters. This action cannot be undone.`}
        confirmText={deleting ? "Deleting..." : "Delete Chapter"}
        cancelText="Cancel"
        danger={true}
      />
    </div>
  )
}

export default ChapterPage
