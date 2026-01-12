import { getStoriesIndex, getStoryMetadataFromGitHub, getFileContent } from './githubApi'

// Fix encoding issues with em dashes and other UTF-8 characters
// Replaces common mis-encoded characters with their correct equivalents
// These occur when UTF-8 text is incorrectly interpreted as Windows-1252/Latin-1
function fixEncoding(content) {
  if (!content || typeof content !== 'string') return content
  
  // First, try to fix common multi-byte sequences
  let fixed = content
    // Fix smart quotes (curly quotes) - UTF-8 bytes E2 80 9C/9D misinterpreted as Windows-1252
    // Left double quotation mark " (U+201C, UTF-8: E2 80 9C)
    .replace(/â€œ/g, '"')       // Full sequence: E2 80 9C → â€œ
    .replace(/â€/g, '"')        // Partial: E2 80 → â€ (when 9C is missing/ignored)
    .replace(/\u201C/g, '"')    // Direct Unicode left double quote
    // Right double quotation mark " (U+201D, UTF-8: E2 80 9D)
    .replace(/â€/g, '"')         // Full sequence: E2 80 9D → â€
    .replace(/â€/g, '"')         // Partial: E2 80 → â€ (when 9D is missing/ignored)
    .replace(/\u201D/g, '"')    // Direct Unicode right double quote
    // Fix broken em dash — UTF-8 bytes E2 80 94 misinterpreted as Windows-1252
    .replace(/â—"/g, '—')        // Common Windows-1252 interpretation
    .replace(/â€"/g, '—')        // Alternative interpretation
    .replace(/\u00E2\u0080\u0094/g, '—') // Unicode escape sequences
    .replace(/\u2014/g, '—')     // Direct Unicode em dash
    // Fix other common UTF-8 encoding issues
    .replace(/â€™/g, "'")        // Right single quotation mark
    .replace(/â€"/g, '–')        // En dash
    .replace(/â€¦/g, '…')        // Ellipsis
    .replace(/â€"/g, '—')        // Another em dash variant
  
  // Then, fix standalone "â" characters that are likely smart quotes
  // Left quote: "â" before capital letters or at start of line
  fixed = fixed
    .replace(/â([A-Z])/g, '"$1')  // Before capital letter: âGod → "God
    .replace(/^â/gm, '"')         // At start of line/paragraph
    .replace(/(\s)â([A-Za-z])/g, '$1"$2')  // After whitespace before letter
  
  // Right quote: "â" after letters/punctuation
  fixed = fixed
    .replace(/([a-zA-Z.,!?;:])â([\s\n.,!?;:]|$)/g, '$1"$2')  // After punctuation/letter: child.â → child."
    .replace(/([a-zA-Z])â([\s\n]|$)/g, '$1"$2')  // After letter before whitespace/end: childâ → child"
  
  return fixed
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
