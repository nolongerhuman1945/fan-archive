import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { uploadStory, getStoryMetadataFromGitHub } from '../utils/githubApi'
import { loadStoryMetadata } from '../utils/storyLoader'
import GenreModal from './GenreModal'
import AO3UploadModal from './AO3UploadModal'
import { getGenreIdsFromNames } from '../utils/genreData'
import Tooltip from './Tooltip'
import { SkeletonForm } from './Skeleton'

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
    genres: [],
    slug: '',
    chapters: [{ title: '', content: '' }]
  })
  const [existingChapterCount, setExistingChapterCount] = useState(0)
  const [showGenreModal, setShowGenreModal] = useState(false)
  const [showAO3Modal, setShowAO3Modal] = useState(false)

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
        // Support both genres and tags for backward compatibility
        const genres = metadata.genres || (metadata.tags ? getGenreIdsFromNames(Array.isArray(metadata.tags) ? metadata.tags : [metadata.tags]) : [])
        setFormData({
          title: metadata.title || '',
          author: metadata.author || '',
          summary: metadata.summary || '',
          rating: metadata.rating || 'PG',
          genres: genres,
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
      // Explicitly specify UTF-8 encoding to ensure proper handling of em dashes and other UTF-8 characters
      reader.readAsText(file, 'UTF-8')
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      slug: field === 'title' && !prev.slug ? generateSlug(value) : prev.slug
    }))
  }

  const handleGenresApply = (genreIds) => {
    setFormData(prev => ({
      ...prev,
      genres: genreIds
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

  const insertChapterAtIndex = (index) => {
    setFormData(prev => ({
      ...prev,
      chapters: [
        ...prev.chapters.slice(0, index + 1),
        { title: '', content: '' },
        ...prev.chapters.slice(index + 1)
      ]
    }))
    // Scroll to the newly inserted chapter after a brief delay
    setTimeout(() => {
      const chapterElements = document.querySelectorAll('[data-chapter-index]')
      if (chapterElements[index + 1]) {
        chapterElements[index + 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 100)
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
        genres: formData.genres,
        isExistingStory: isExistingStory
      })

      if (result.success) {
        setLoading(false)
        const targetSlug = formData.slug || storySlug || generateSlug(formData.title)
        // Wait a moment for GitHub to propagate the commit before navigating
        // Use window.location.href to force a full page reload with fresh data
        setTimeout(() => {
          window.location.href = `/story/${targetSlug}?refresh=true`
        }, 2000)
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
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-warm-200 dark:bg-warm-700 rounded-md animate-pulse w-48 mb-2" />
          <div className="h-4 bg-warm-200 dark:bg-warm-700 rounded-md animate-pulse w-96" />
        </div>
        <SkeletonForm showChapters={true} />
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
      <AO3UploadModal
        isOpen={showAO3Modal}
        onClose={() => setShowAO3Modal(false)}
      />
      <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">
          {isExistingStory ? 'Add Chapters to Story' : 'Upload New Story'}
        </h1>
        <p className="text-warm-600 dark:text-warm-400 text-sm">
          {isExistingStory
            ? 'Add new chapters to an existing story. Story details cannot be modified.'
            : 'Submit a new story to the archive. All fields are required.'}
        </p>
        {!isExistingStory && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setShowAO3Modal(true)}
              className="px-4 py-2 text-sm bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 rounded-md hover:opacity-80 transition-opacity font-medium flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Import from AO3
            </button>
          </div>
        )}
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
                  Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                  placeholder="Enter story summary"
                  rows="4"
                  className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
                  required
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
                {formData.genres && formData.genres.length > 0 && (
                  <p><span className="font-medium text-warm-700 dark:text-warm-300">Genres:</span> <span className="text-warm-900 dark:text-warm-50">{formData.genres.length} selected</span></p>
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
                  Browse To Upload
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
                <div key={index} data-chapter-index={index} className="p-4 border border-warm-200 dark:border-warm-700 rounded-md">
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
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Remove chapter"
                        aria-label="Remove chapter"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
                      placeholder="Enter chapter title"
                      className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-2 text-warm-900 dark:text-warm-50">
                      Chapter Content (Markdown) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={chapter.content}
                      onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                      placeholder="Enter chapter content"
                      rows="12"
                      className="w-full px-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600 font-mono text-sm"
                      required
                    />
                  </div>

                  <div className="pt-2 border-t border-warm-200 dark:border-warm-700">
                    <button
                      type="button"
                      onClick={() => insertChapterAtIndex(index)}
                      className="w-full px-4 py-2 text-sm bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
                    >
                      + Add Chapter Below
                    </button>
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
    </>
  )
}

export default UploadStory
