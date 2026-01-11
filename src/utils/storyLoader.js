import { getStoriesIndex, getStoryMetadataFromGitHub, getFileContent } from './githubApi'

// Fix encoding issues with em dashes and other UTF-8 characters
// Replaces common mis-encoded characters with their correct equivalents
// These occur when UTF-8 text is incorrectly interpreted as Windows-1252/Latin-1
function fixEncoding(content) {
  if (!content || typeof content !== 'string') return content
  
  return content
    // Fix broken em dash — UTF-8 bytes E2 80 94 misinterpreted as Windows-1252
    // Common variations: "â—"", "â€"", "â€"", or individual bytes
    .replace(/â—"/g, '—')      // Common Windows-1252 interpretation
    .replace(/â€"/g, '—')       // Alternative interpretation
    .replace(/\u00E2\u0080\u0094/g, '—') // Unicode escape sequences
    .replace(/\u2014/g, '—')    // Direct Unicode em dash (if somehow present)
    // Fix other common UTF-8 encoding issues
    .replace(/â€™/g, "'")       // Right single quotation mark
    .replace(/â€œ/g, '"')       // Left double quotation mark
    .replace(/â€/g, '"')        // Right double quotation mark
    .replace(/â€"/g, '–')       // En dash
    .replace(/â€¦/g, '…')       // Ellipsis
    .replace(/â€"/g, '—')       // Another em dash variant
}

export async function loadAllStories() {
  try {
    // Try loading from GitHub API first (for fresh data)
    const githubStories = await getStoriesIndex()
    if (githubStories && githubStories.length > 0) {
      return githubStories
    }
  } catch (error) {
    console.warn('Could not load stories from GitHub API, falling back to static files:', error)
  }

  // Fallback to static files
  try {
    const base = import.meta.env.BASE_URL || '/'
    const cacheBuster = `?t=${Date.now()}`
    const response = await fetch(`${base}stories-index.json${cacheBuster}`)
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    // Handle both formats: { stories: [...] } or [...]
    if (Array.isArray(data)) {
      return data
    }
    return data.stories || []
  } catch (error) {
    console.error('Error loading stories:', error)
    return []
  }
}

export async function loadStoryMetadata(slug, forceFresh = false) {
  try {
    // Try loading from GitHub API first (for fresh data)
    const metadata = await getStoryMetadataFromGitHub(slug, forceFresh)
    if (metadata) {
      return metadata
    }
  } catch (error) {
    console.warn(`Could not load story metadata from GitHub API for ${slug}, falling back to static files:`, error)
  }

  // Fallback to static files
  try {
    const base = import.meta.env.BASE_URL || '/'
    const cacheBuster = `?t=${Date.now()}`
    const response = await fetch(`${base}stories/${slug}/metadata.json${cacheBuster}`)
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    console.error(`Error loading story metadata for ${slug}:`, error)
    return null
  }
}

export async function loadChapter(slug, chapterNum, forceFresh = false) {
  try {
    // Try loading from GitHub API first (for fresh data)
    const metadata = await getStoryMetadataFromGitHub(slug, forceFresh)
    if (metadata) {
      const chapters = metadata.chapters || []
      const chapterIndex = chapterNum - 1
      if (chapterIndex >= 0 && chapterIndex < chapters.length) {
        const chapter = chapters[chapterIndex]
        const chapterFile = chapter.file || `chapter-${chapterNum}.md`
        const content = await getFileContent(`public/stories/${slug}/${chapterFile}`)
        if (content) {
          return fixEncoding(content)
        }
        // If content is null and we're forcing fresh, wait and retry once
        if (forceFresh) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          const retryContent = await getFileContent(`public/stories/${slug}/${chapterFile}`)
          if (retryContent) {
            return fixEncoding(retryContent)
          }
        }
      }
    }
  } catch (error) {
    console.warn(`Could not load chapter from GitHub API for ${slug}/${chapterNum}, falling back to static files:`, error)
  }

  // Fallback to static files
  try {
    const base = import.meta.env.BASE_URL || '/'
    const cacheBuster = `?t=${Date.now()}`
    const response = await fetch(`${base}stories/${slug}/chapter-${chapterNum}.md${cacheBuster}`)
    if (!response.ok) {
      return null
    }
    const text = await response.text()
    return fixEncoding(text)
  } catch (error) {
    console.error(`Error loading chapter ${chapterNum} of ${slug}:`, error)
    return null
  }
}
