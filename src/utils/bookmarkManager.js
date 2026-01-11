const BOOKMARKS_STORAGE_KEY = 'storyBookmarks'

/**
 * Get all bookmarks
 * @returns {Object} Bookmarks object with story slugs as keys
 */
export function getBookmarks() {
  try {
    const bookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY)
    return bookmarks ? JSON.parse(bookmarks) : {}
  } catch (error) {
    console.error('Error reading bookmarks:', error)
    return {}
  }
}

/**
 * Get bookmark for a specific story
 * @param {string} slug - Story slug
 * @returns {Object|null} Bookmark object or null
 */
export function getBookmark(slug) {
  const bookmarks = getBookmarks()
  return bookmarks[slug] || null
}

/**
 * Set bookmark for a story
 * @param {string} slug - Story slug
 * @param {number} chapterNum - Chapter number
 * @param {number} progress - Optional scroll progress (0-100)
 */
export function setBookmark(slug, chapterNum, progress = null) {
  try {
    const bookmarks = getBookmarks()
    bookmarks[slug] = {
      chapterNum,
      timestamp: Date.now(),
      ...(progress !== null && { progress })
    }
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks))
  } catch (error) {
    console.error('Error saving bookmark:', error)
  }
}

/**
 * Remove bookmark for a story
 * @param {string} slug - Story slug
 */
export function removeBookmark(slug) {
  try {
    const bookmarks = getBookmarks()
    delete bookmarks[slug]
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks))
  } catch (error) {
    console.error('Error removing bookmark:', error)
  }
}

/**
 * Get all bookmarked story slugs
 * @returns {string[]} Array of story slugs
 */
export function getBookmarkedSlugs() {
  return Object.keys(getBookmarks())
}
