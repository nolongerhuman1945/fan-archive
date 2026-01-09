export async function loadAllStories() {
  try {
    const response = await fetch('/stories-index.json')
    if (!response.ok) {
      return []
    }
    const data = await response.json()
    return data.stories || []
  } catch (error) {
    console.error('Error loading stories:', error)
    return []
  }
}

export async function loadStoryMetadata(slug) {
  try {
    const response = await fetch(`/stories/${slug}/metadata.json`)
    if (!response.ok) {
      return null
    }
    return await response.json()
  } catch (error) {
    console.error(`Error loading story metadata for ${slug}:`, error)
    return null
  }
}

export async function loadChapter(slug, chapterNum) {
  try {
    const response = await fetch(`/stories/${slug}/chapter-${chapterNum}.md`)
    if (!response.ok) {
      return null
    }
    return await response.text()
  } catch (error) {
    console.error(`Error loading chapter ${chapterNum} of ${slug}:`, error)
    return null
  }
}
