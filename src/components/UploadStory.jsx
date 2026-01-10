import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { uploadStory, getStoryMetadataFromGitHub } from '../utils/githubApi'
import { loadStoryMetadata } from '../utils/storyLoader'

function UploadStory() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const storySlug = searchParams.get('story')
  const isExistingStory = !!storySlug

  const [loading, setLoading] = useState(false)
  const [loadingStory, setLoadingStory] = useState(isExistingStory)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    summary: '',
    rating: 'PG',
    tags: '',
    slug: '',
    chapters: [{ title: '', content: '' }]
  })
  const [existingChapterCount, setExistingChapterCount] = useState(0)

  useEffect(() => {
    if (isExistingStory && storySlug) {
      loadExistingStory(storySlug)
    }
  }, [isExistingStory, storySlug])

  const loadExistingStory = async (slug) => {
    setLoadingStory(true)
    setError(null)
    try {
      let metadata = null
      try {
        metadata = await getStoryMetadataFromGitHub(slug)
      } catch (err) {
        metadata = await loadStoryMetadata(slug)
      }

      if (metadata) {
        const chapters = metadata.chapters || []
        setExistingChapterCount(chapters.length)
        setFormData({
          title: metadata.title || '',
          author: metadata.author || '',
          summary: metadata.summary || '',
          rating: metadata.rating || 'PG',
          tags: Array.isArray(metadata.tags) ? metadata.tags.join(', ') : (metadata.tags || ''),
          slug: metadata.slug || slug,
          chapters: [{ title: '', content: '' }]
        })
      } else {
        setError(`Story with slug "${slug}" not found.`)
      }
    } catch (err) {
      setError(err.message || 'Failed to load existing story.')
    } finally {
      setLoadingStory(false)
    }
  }

  const parseMarkdownFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target.result
          const lines = content.split('\n')
          
          let title = ''
          let chapterContent = content

          if (lines[0].trim().startsWith('# ')) {
            title = lines[0].replace(/^#\s+/, '').trim()
            chapterContent = lines.slice(1).join('\n').trim()
          } else if (lines[0].trim().startsWith('---')) {
            const frontmatterEnd = lines.findIndex((line, idx) => idx > 0 && line.trim() === '---')
            if (frontmatterEnd > 0) {
              const frontmatter = lines.slice(1, frontmatterEnd).join('\n')
              const titleMatch = frontmatter.match(/title:\s*["']?(.+?)["']?$/m)
              if (titleMatch) {
                title = titleMatch[1].trim()
              }
              chapterContent = lines.slice(frontmatterEnd + 1).join('\n').trim()
            }
          }

          if (!title) {
            title = file.name.replace(/\.(md|markdown|txt)$/i, '').replace(/[-_]/g, ' ')
          }

          resolve({ title, content: chapterContent })
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  const handleFiles = async (files) => {
    const fileArray = Array.from(files).filter(file => {
      const validExtensions = ['.md', '.markdown', '.txt']
      const fileName = file.name.toLowerCase()
      return validExtensions.some(ext => fileName.endsWith(ext))
    })

    if (fileArray.length === 0) {
      setError('Please upload valid markdown files (.md, .markdown, or .txt)')
      return
    }

    try {
      const parsedChapters = await Promise.all(
        fileArray.map(file => parseMarkdownFile(file))
      )

      setFormData(prev => ({
        ...prev,
        chapters: parsedChapters
      }))

      setError(null)
    } catch (err) {
      setError(`Error parsing files: ${err.message}`)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      if (e.currentTarget === dropZoneRef.current) {
        setDragActive(false)
      }
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const capitalizeTags = (tagString) => {
    if (!tagString) return ''
    return tagString
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
      .map(tag => {
        return tag.split(' ').map(word => {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        }).join(' ')
      })
      .join(', ')
  }

  const handleInputChange = (field, value) => {
    if (field === 'tags') {
      const capitalized = capitalizeTags(value)
      setFormData(prev => ({
        ...prev,
        [field]: capitalized,
        slug: field === 'title' && !prev.slug ? generateSlug(value) : prev.slug
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        slug: field === 'title' && !prev.slug ? generateSlug(value) : prev.slug
      }))
    }
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

    if (!isExistingStory && (!formData.title.trim() || !formData.author.trim() || !formData.summary.trim())) {
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
        slug: formData.slug || (isExistingStory ? storySlug : generateSlug(formData.title)),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        isExistingStory: isExistingStory
      })

      if (result.success) {
        setLoading(false)
        navigate(`/story/${formData.slug || storySlug || generateSlug(formData.title)}`)
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

  if (loadingStory) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-warm-600 dark:text-warm-400">Loading story...</div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">
          {isExistingStory ? 'Add Chapters to Story' : 'Upload New Story'}
        </h1>
        <p className="text-warm-600 dark:text-warm-400 text-sm">
          {isExistingStory
            ? 'Add new chapters to an existing story. Story details cannot be modified.'
            : 'Submit a new fanfiction story to the archive. All fields are required.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 p-6 md:p-8">
        <div className="space-y-6">
          {!isExistingStory && (
            <>
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
                    placeholder="Adventure, Romance, Fantasy"
                    className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
                  />
                  <p className="mt-1 text-xs text-warm-500 dark:text-warm-400">Tags will be automatically capitalized</p>
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
            </>
          )}

          {isExistingStory && (
            <div className="p-4 bg-warm-50 dark:bg-warm-900 rounded-md border border-warm-200 dark:border-warm-700">
              <h3 className="text-sm font-medium text-warm-900 dark:text-warm-50 mb-2">Story Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-warm-700 dark:text-warm-300">Title:</span> <span className="text-warm-900 dark:text-warm-50">{formData.title}</span></p>
                <p><span className="font-medium text-warm-700 dark:text-warm-300">Author:</span> <span className="text-warm-900 dark:text-warm-50">{formData.author}</span></p>
                <p><span className="font-medium text-warm-700 dark:text-warm-300">Rating:</span> <span className="text-warm-900 dark:text-warm-50">{formData.rating}</span></p>
                {formData.tags && (
                  <p><span className="font-medium text-warm-700 dark:text-warm-300">Tags:</span> <span className="text-warm-900 dark:text-warm-50">{formData.tags}</span></p>
                )}
              </div>
            </div>
          )}

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

            <div
              ref={dropZoneRef}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`mb-6 p-8 border-2 border-dashed rounded-md transition-colors ${
                dragActive
                  ? 'border-warm-500 dark:border-warm-400 bg-warm-50 dark:bg-warm-900'
                  : 'border-warm-300 dark:border-warm-600 bg-warm-50/50 dark:bg-warm-900/50'
              }`}
            >
              <div className="text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-12 h-12 mx-auto mb-4 text-warm-400 dark:text-warm-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm font-medium text-warm-900 dark:text-warm-50 mb-2">
                  Drag and drop markdown files here, or
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-warm-700 dark:text-warm-300 hover:text-warm-900 dark:hover:text-warm-50 underline underline-offset-2"
                >
                  browse to upload
                </button>
                <p className="text-xs text-warm-500 dark:text-warm-400 mt-2">
                  Supports .md, .markdown, and .txt files
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.markdown,.txt"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            <div className="space-y-6">
              {formData.chapters.map((chapter, index) => (
                <div key={index} className="p-4 border border-warm-200 dark:border-warm-700 rounded-md">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-warm-900 dark:text-warm-50">
                      {isExistingStory 
                        ? `Chapter ${existingChapterCount + index + 1}`
                        : `Chapter ${index + 1}`}
                    </h3>
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
              {loading
                ? (isExistingStory ? 'Adding Chapters...' : 'Uploading...')
                : (isExistingStory ? 'Add Chapters' : 'Upload Story')}
            </button>
            <button
              type="button"
              onClick={() => navigate(isExistingStory ? `/story/${storySlug}` : '/')}
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
