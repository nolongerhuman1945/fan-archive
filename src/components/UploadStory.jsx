import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadStory } from '../utils/githubApi'

function UploadStory() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    summary: '',
    rating: 'PG',
    tags: '',
    slug: '',
    chapters: [{ title: '', content: '' }]
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      slug: field === 'title' && !prev.slug ? generateSlug(value) : prev.slug
    }))
  }

  const handleChapterChange = (index, field, value) => {
    const updatedChapters = [...formData.chapters]
    updatedChapters[index] = { ...updatedChapters[index], [field]: value }
    setFormData(prev => ({ ...prev, chapters: updatedChapters }))
  }

  const addChapter = () => {
    setFormData(prev => ({
      ...prev,
      chapters: [...prev.chapters, { title: '', content: '' }]
    }))
  }

  const removeChapter = (index) => {
    if (formData.chapters.length > 1) {
      setFormData(prev => ({
        ...prev,
        chapters: prev.chapters.filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.title.trim() || !formData.author.trim() || !formData.summary.trim()) {
      setError('Please fill in all required fields (title, author, summary)')
      setLoading(false)
      return
    }

    if (formData.chapters.some(ch => !ch.title.trim() || !ch.content.trim())) {
      setError('All chapters must have a title and content')
      setLoading(false)
      return
    }

    try {
      const result = await uploadStory({
        ...formData,
        slug: formData.slug || generateSlug(formData.title),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      })

      if (result.success) {
        setLoading(false)
        navigate(`/story/${formData.slug || generateSlug(formData.title)}`)
      } else {
        setError('Failed to upload story. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      setError(err.message || 'Failed to upload story. Please check your GitHub token configuration.')
      setLoading(false)
    }
  }

  function generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">Upload New Story</h1>
        <p className="text-warm-600 dark:text-warm-400 text-sm">
          Submit a new fanfiction story to the archive. All fields are required.
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
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
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
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
              required
            />
          </div>

          <div>
            <label htmlFor="summary" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleInputChange('summary', e.target.value)}
              rows="4"
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rating" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
                Rating <span className="text-red-500">*</span>
              </label>
              <select
                id="rating"
                value={formData.rating}
                onChange={(e) => handleInputChange('rating', e.target.value)}
                className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
                required
              >
                <option value="G">G</option>
                <option value="PG">PG</option>
                <option value="PG-13">PG-13</option>
                <option value="R">R</option>
                <option value="M">M</option>
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                placeholder="adventure, romance, fantasy"
                className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
              URL Slug (auto-generated from title)
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600 font-mono text-sm"
            />
          </div>

          <div className="border-t border-warm-200 dark:border-warm-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-warm-900 dark:text-warm-50">Chapters</h2>
              <button
                type="button"
                onClick={addChapter}
                className="px-4 py-2 text-sm bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
              >
                + Add Chapter
              </button>
            </div>

            <div className="space-y-6">
              {formData.chapters.map((chapter, index) => (
                <div key={index} className="p-4 border border-warm-200 dark:border-warm-700 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-warm-900 dark:text-warm-50">Chapter {index + 1}</h3>
                    {formData.chapters.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChapter(index)}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
                      Chapter Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                      className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
                      Chapter Content (Markdown) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={chapter.content}
                      onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                      rows="12"
                      className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600 font-mono text-sm"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-warm-200 dark:border-warm-700">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 rounded-md font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Uploading...' : 'Upload Story'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
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

export default UploadStory
