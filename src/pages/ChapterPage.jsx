import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { loadStoryMetadata, loadChapter } from '../utils/storyLoader'

function ChapterPage() {
  const { slug, chapterNum } = useParams()
  const navigate = useNavigate()
  const [metadata, setMetadata] = useState(null)
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [readingProgress, setReadingProgress] = useState(0)
  const contentRef = useRef(null)

  const currentChapter = parseInt(chapterNum, 10)
  const totalChapters = metadata?.chapters?.length || 0

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [storyData, chapterData] = await Promise.all([
        loadStoryMetadata(slug),
        loadChapter(slug, currentChapter)
      ])
      setMetadata(storyData)
      setContent(chapterData)
      setLoading(false)
    }
    fetchData()
  }, [slug, currentChapter])

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return

      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollableHeight = documentHeight - windowHeight
      const progress = (scrollTop / scrollableHeight) * 100

      setReadingProgress(Math.min(Math.max(progress, 0), 100))
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [content])

  useEffect(() => {
    const savedProgress = localStorage.getItem(`reading-${slug}-${currentChapter}`)
    if (savedProgress && contentRef.current) {
      window.scrollTo(0, parseInt(savedProgress, 10))
    }
  }, [content, slug, currentChapter])

  useEffect(() => {
    const handleScrollSave = () => {
      if (contentRef.current) {
        localStorage.setItem(`reading-${slug}-${currentChapter}`, window.pageYOffset.toString())
      }
    }

    const timeout = setTimeout(handleScrollSave, 1000)
    return () => clearTimeout(timeout)
  }, [slug, currentChapter])

  const goToChapter = (newChapterNum) => {
    if (newChapterNum >= 1 && newChapterNum <= totalChapters) {
      navigate(`/story/${slug}/chapter/${newChapterNum}`)
      window.scrollTo(0, 0)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-warm-600 dark:text-warm-400">Loading chapter...</div>
      </div>
    )
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
      <div className="sticky top-[64px] z-40 bg-warm-50/95 dark:bg-[#14191A]/95 backdrop-blur-sm border-b border-warm-200 dark:border-warm-800 mb-6">
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
            <span className="text-sm text-warm-600 dark:text-warm-400 font-medium">
              Chapter {currentChapter} of {totalChapters}
            </span>
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

        <div ref={contentRef} className="prose-content mb-12">
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
    </div>
  )
}

export default ChapterPage
