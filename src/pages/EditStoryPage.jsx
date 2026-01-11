import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getStoryMetadataFromGitHub, updateStory } from '../utils/githubApi'
import { loadStoryMetadata } from '../utils/storyLoader'
import GenreModal from '../components/GenreModal'
import { getGenreIdsFromNames } from '../utils/genreData'
import Tooltip from '../components/Tooltip'
import { SkeletonForm } from '../components/Skeleton'

function EditStoryPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    summary: '',
    rating: 'PG',
    genres: [],
    slug: ''
  })
  const [showGenreModal, setShowGenreModal] = useState(false)

  useEffect(() => {
    loadStory()
  }, [slug])

  const loadStory = async () => {
    setLoading(true)
    setError(null)
    try {
      let metadata = null
      try {
        metadata = await getStoryMetadataFromGitHub(slug)
      } catch (err) {
        metadata = await loadStoryMetadata(slug)
      }

      if (metadata) {
        // Support both genres and tags for backward compatibility
        const genres = metadata.genres || (metadata.tags ? getGenreIdsFromNames(Array.isArray(metadata.tags) ? metadata.tags : [metadata.tags]) : [])
        setFormData({
          title: metadata.title || '',
          author: metadata.author || '',
          summary: metadata.summary || '',
          rating: metadata.rating || 'PG',
          genres: genres,
          slug: metadata.slug || slug
        })
      } else {
        setError(`Story with slug "${slug}" not found.`)
      }
    } catch (err) {
      setError(err.message || 'Failed to load story.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGenresApply = (genreIds) => {
    setFormData(prev => ({
      ...prev,
      genres: genreIds
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (!formData.title.trim() || !formData.author.trim()) {
      setError('Title and author are required fields')
      setSaving(false)
      return
    }

    try {
      const result = await updateStory(slug, {
        title: formData.title,
        author: formData.author,
        summary: formData.summary,
        rating: formData.rating,
        genres: formData.genres
      })

      if (result.success) {
        navigate(`/story/${slug}`)
      } else {
        setError('Failed to update story. Please try again.')
        setSaving(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to update story. Please check your GitHub token configuration.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-warm-200 dark:bg-warm-700 rounded-md animate-pulse w-32 mb-2" />
          <div className="h-4 bg-warm-200 dark:bg-warm-700 rounded-md animate-pulse w-64" />
        </div>
        <SkeletonForm showChapters={false} />
      </div>
    )
  }

  if (error && !formData.title) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-medium mb-4 text-warm-900 dark:text-warm-50">Story not found</h1>
        <button
          onClick={() => navigate('/')}
          className="text-warm-700 dark:text-warm-300 hover:opacity-70 transition-opacity underline underline-offset-2"
        >
          Return to homepage
        </button>
      </div>
    )
  }

  return (
    <>
      <GenreModal
        isOpen={showGenreModal}
        onClose={() => setShowGenreModal(false)}
        onApply={handleGenresApply}
        selectedGenreIds={formData.genres}
      />
      <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">Edit Story</h1>
        <p className="text-warm-600 dark:text-warm-400 text-sm">
          Modify story details and metadata
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
              Story Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter title here"
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
              required
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
              Author Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author"
              value={formData.author}
              onChange={(e) => handleInputChange('author', e.target.value)}
              placeholder="Enter author name"
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
              required
            />
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
              Summary
            </label>
            <textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              placeholder="Enter story summary"
              rows="4"
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rating" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="rating"
                  value={formData.rating}
                  onChange={(e) => handleInputChange('rating', e.target.value)}
                  className="w-full px-4 pr-10 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600 appearance-none"
                  required
                >
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                  <option value="M">M</option>
                </select>
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-warm-600 dark:text-warm-400 pointer-events-none flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div>
              <label htmlFor="genres" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
                Genres
              </label>
              <Tooltip text="Select genres" position="bottom" className="w-full">
                <button
                  type="button"
                  id="genres"
                  onClick={() => setShowGenreModal(true)}
                  className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600 text-left hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors flex items-center justify-between"
                >
                  <span className={formData.genres.length === 0 ? 'text-warm-400 dark:text-warm-500' : ''}>
                    {formData.genres.length > 0
                      ? `${formData.genres.length} ${formData.genres.length === 1 ? 'genre' : 'genres'} selected`
                      : 'No Genres Selected'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-warm-600 dark:text-warm-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </Tooltip>
            </div>
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
              URL Slug (read-only)
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              readOnly
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-warm-50 dark:bg-warm-900 text-warm-500 dark:text-warm-400 font-mono text-sm cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-warm-500 dark:text-warm-400">Slug cannot be changed. To change it, delete and recreate the story.</p>
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
              onClick={() => navigate(`/story/${slug}`)}
              className="px-6 py-2.5 bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md font-medium hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
    </>
  )
}

export default EditStoryPage
