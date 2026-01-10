import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStoryMetadataFromGitHub, updateChapter, getChapterContent } from '../utils/githubApi'
import { loadStoryMetadata, loadChapter } from '../utils/storyLoader'

function EditChapterPage() {
  const { slug, chapterNum } = useParams()
  const navigate = useNavigate()
  const chapterNumber = parseInt(chapterNum, 10)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  })
  const [metadata, setMetadata] = useState(null)

  useEffect(() => {
    loadChapterData()
  }, [slug, chapterNum])

  const loadChapterData = async () => {
    setLoading(true)
    setError(null)
    try {
      let storyMetadata = null
      try {
        storyMetadata = await getStoryMetadataFromGitHub(slug)
      } catch (err) {
        storyMetadata = await loadStoryMetadata(slug)
      }

      if (!storyMetadata) {
        setError(`Story with slug "${slug}" not found.`)
        setLoading(false)
        return
      }

      setMetadata(storyMetadata)

      const chapters = storyMetadata.chapters || []
      const chapterIndex = chapterNumber - 1

      if (chapterIndex < 0 || chapterIndex >= chapters.length) {
        setError(`Chapter ${chapterNumber} not found.`)
        setLoading(false)
        return
      }

      const chapter = chapters[chapterIndex]
      let content = null

      try {
        content = await getChapterContent(slug, chapterNumber)
      } catch (err) {
        content = await loadChapter(slug, chapterNumber)
      }

      if (!content) {
        setError(`Chapter ${chapterNumber} content not found.`)
        setLoading(false)
        return
      }

      setFormData({
        title: chapter.title || '',
        content: content
      })
    } catch (err) {
      setError(err.message || 'Failed to load chapter.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Chapter title and content are required')
      setSaving(false)
      return
    }

    try {
      const result = await updateChapter(slug, chapterNumber, {
        title: formData.title,
        content: formData.content
      })

      if (result.success) {
        navigate(`/story/${slug}/chapter/${chapterNumber}`)
      } else {
        setError('Failed to update chapter. Please try again.')
        setSaving(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to update chapter. Please check your GitHub token configuration.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-warm-600 dark:text-warm-400">Loading chapter...</div>
      </div>
    )
  }

  if (error && !formData.title) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-medium mb-4 text-warm-900 dark:text-warm-50">Chapter not found</h1>
        <button
          onClick={() => navigate(`/story/${slug}`)}
          className="text-warm-700 dark:text-warm-300 hover:opacity-70 transition-opacity underline underline-offset-2"
        >
          Return to story
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">
          Edit Chapter {chapterNumber}
          {metadata && <span className="text-base font-normal text-warm-600 dark:text-warm-400 ml-2">from {metadata.title}</span>}
        </h1>
        <p className="text-warm-600 dark:text-warm-400 text-sm">
          Modify chapter title and content
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
              Chapter Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
              Chapter Content (Markdown) <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows="20"
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600 font-mono text-sm"
              required
            />
            <p className="mt-1 text-xs text-warm-500 dark:text-warm-400">
              Full markdown syntax is supported
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-warm-200 dark:border-warm-700">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 rounded-md font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/story/${slug}/chapter/${chapterNumber}`)}
              className="px-6 py-2.5 bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md font-medium hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditChapterPage
