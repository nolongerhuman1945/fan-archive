import { getStoriesIndex, commitFiles } from './githubApi'

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

/**
 * Extract work ID from AO3 URL
 * @param {string} url - AO3 work URL
 * @returns {string|null} - Work ID or null if invalid
 */
export function extractWorkId(url) {
  try {
    const urlObj = new URL(url)
    if (!urlObj.hostname.includes('archiveofourown.org')) {
      return null
    }
    
    // Match patterns like:
    // /works/123456
    // /works/123456/chapters/789012
    const match = urlObj.pathname.match(/\/works\/(\d+)/)
    return match ? match[1] : null
  } catch (error) {
    return null
  }
}

/**
 * Download entire AO3 work from backend
 * @param {string} url - AO3 work URL
 * @returns {Promise<Object>} - { metadata, chapters: [...] }
 */
export async function downloadAO3Work(url) {
  // Check if we're on deployed site without backend configured
  const isDeployed = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  const hasBackendUrl = import.meta.env.VITE_API_BASE_URL
  
  if (isDeployed && !hasBackendUrl) {
    throw new Error('Download feature requires a backend server. Please run the site locally (npm run dev) or configure VITE_API_BASE_URL to point to a deployed backend.')
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/ao3/download-work`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      let errorMessage = `Failed to download work: ${response.status} ${response.statusText}`
      
      try {
        const errorData = await response.json()
        if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch (parseError) {
        // If JSON parsing fails, use default message
      }

      if (response.status === 404) {
        throw new Error('This work could not be found. Please check the URL and try again.')
      }
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.')
      }
      if (response.status === 403) {
        throw new Error('This work is locked and requires authentication. Please ensure AO3 credentials are configured.')
      }
      if (response.status === 503) {
        throw new Error(errorMessage)
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    return data
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error
    }
    
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      if (apiUrl.includes('localhost')) {
        throw new Error('Unable to connect to the server. Please ensure the backend server is running on http://localhost:3001')
      } else {
        throw new Error(`Unable to connect to the backend server at ${apiUrl}. Please check if the server is deployed and running.`)
      }
    }
    
    throw new Error(error.message || 'Failed to download work. Please try again.')
  }
}

/**
 * Save AO3 work (metadata + all chapters) to repository via GitHub API
 * @param {Object} metadata - Parsed AO3 metadata from backend
 * @param {Array} chapters - Array of chapter objects with { title, content }
 * @param {string} originalUrl - Original AO3 URL
 * @returns {Promise<Object>} - { success: boolean, workId: string }
 */
export async function saveAO3WorkToRepo(metadata, chapters, originalUrl) {
  const workId = metadata.workId || extractWorkId(originalUrl)
  
  if (!workId) {
    throw new Error('Could not extract work ID from URL or metadata.')
  }

  const slug = `ao3-${workId}`
  const storyPath = `public/stories/${slug}`
  const files = []

  // Prepare metadata.json
  const metadataFile = {
    title: metadata.title,
    author: metadata.author,
    summary: metadata.summary || '',
    rating: metadata.rating || 'Not Rated',
    tags: metadata.tags || [],
    wordCount: metadata.wordCount || 0,
    isComplete: metadata.isComplete || false,
    slug: slug,
    source: 'ao3',
    ao3WorkId: workId,
    ao3Url: `https://archiveofourown.org/works/${workId}`,
    chapters: chapters.map((ch, i) => ({
      title: ch.title || `Chapter ${i + 1}`,
      file: `chapter-${i + 1}.md`
    }))
  }

  files.push({
    path: `${storyPath}/metadata.json`,
    content: JSON.stringify(metadataFile, null, 2)
  })

  // Prepare chapter files
  chapters.forEach((chapter, index) => {
    files.push({
      path: `${storyPath}/chapter-${index + 1}.md`,
      content: chapter.content || ''
    })
  })

  // Get current stories index
  const currentStories = await getStoriesIndex()
  
  // Check if story already exists
  const existingIndex = currentStories.findIndex(
    story => story.ao3WorkId === workId || story.slug === slug
  )
  
  // Create story entry for index
  const storyEntry = {
    slug: slug,
    source: 'ao3',
    ao3WorkId: workId,
    ao3Url: `https://archiveofourown.org/works/${workId}`,
    title: metadata.title,
    author: metadata.author,
    summary: metadata.summary || '',
    rating: metadata.rating || 'Not Rated',
    tags: metadata.tags || [],
    chapters: metadataFile.chapters
  }

  // Update stories array
  const updatedStories = existingIndex >= 0
    ? [
        ...currentStories.slice(0, existingIndex),
        storyEntry,
        ...currentStories.slice(existingIndex + 1),
      ]
    : [...currentStories, storyEntry]

  // Add stories-index.json to files
  files.push({
    path: 'public/stories-index.json',
    content: JSON.stringify({ stories: updatedStories }, null, 2),
  })

  const commitMessage = existingIndex >= 0
    ? `Update AO3 story: ${metadata.title}`
    : `Add AO3 story: ${metadata.title}`

  await commitFiles(files, commitMessage)

  return {
    success: true,
    workId: workId,
  }
}
