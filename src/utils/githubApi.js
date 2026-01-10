import { Octokit } from '@octokit/rest'

const GITHUB_OWNER = 'nolongerhuman1945'
const GITHUB_REPO = 'fan-archive'
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''

if (!GITHUB_TOKEN) {
  console.warn('VITE_GITHUB_TOKEN is not set. GitHub integration will not work.')
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN
})

export async function getFileContent(path, retryCount = 0) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: path,
      ref: 'main' // Explicitly use main branch to avoid caching issues
    })
    
    if (data.type === 'file' && data.encoding === 'base64') {
      return atob(data.content.replace(/\s/g, ''))
    }
    return null
  } catch (error) {
    // Retry once if we get 404 and haven't retried yet (might be propagation delay)
    if (error.status === 404 && retryCount === 0) {
      // Wait a bit for GitHub to propagate the commit
      await new Promise(resolve => setTimeout(resolve, 1500))
      return getFileContent(path, 1)
    }
    if (error.status === 404) {
      return null
    }
    throw error
  }
}

export async function getStoriesIndex() {
  try {
    const content = await getFileContent('public/stories-index.json')
    if (!content) {
      return []
    }
    const parsed = JSON.parse(content)
    return parsed.stories || []
  } catch (error) {
    if (error.status === 404) {
      return []
    }
    console.error('Error fetching stories index:', error)
    return []
  }
}

async function getFileSha(path) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: path
    })
    return data.sha
  } catch (error) {
    if (error.status === 404) {
      return null
    }
    throw error
  }
}

async function deleteFile(path, commitMessage) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.')
  }

  try {
    const sha = await getFileSha(path)
    if (!sha) {
      return { success: true, message: 'File does not exist' }
    }

    const { data: refData } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: 'heads/main'
    })

    await octokit.repos.deleteFile({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: path,
      message: commitMessage,
      sha: sha,
      branch: 'main'
    })

    return { success: true }
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

export async function commitFiles(files, commitMessage, deletePaths = []) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.')
  }

  try {
    const { data: refData } = await octokit.git.getRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: 'heads/main'
    })

    const { data: latestCommit } = await octokit.repos.getCommit({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: 'main'
    })

    const baseTreeSha = latestCommit.commit.tree.sha

    const treeItems = []

    for (const file of files) {
      const content = typeof file.content === 'string' 
        ? btoa(unescape(encodeURIComponent(file.content)))
        : file.content

      const { data: blob } = await octokit.git.createBlob({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        content: content,
        encoding: 'base64'
      })

      treeItems.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blob.sha
      })
    }

    for (const deletePath of deletePaths) {
      const sha = await getFileSha(deletePath)
      if (sha) {
        treeItems.push({
          path: deletePath,
          mode: '100644',
          type: 'blob',
          sha: null
        })
      }
    }

    const { data: treeData } = await octokit.git.createTree({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      base_tree: baseTreeSha,
      tree: treeItems
    })

    const { data: commitData } = await octokit.git.createCommit({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      message: commitMessage,
      tree: treeData.sha,
      parents: [refData.object.sha]
    })

    await octokit.git.updateRef({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      ref: 'heads/main',
      sha: commitData.sha
    })

    return { success: true, commitSha: commitData.sha }
  } catch (error) {
    console.error('Error committing files:', error)
    throw error
  }
}

export async function getStoryMetadataFromGitHub(slug, forceFresh = false) {
  try {
    // If forcing fresh, wait a bit for GitHub to propagate
    if (forceFresh) {
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    const metadataContent = await getFileContent(`public/stories/${slug}/metadata.json`)
    if (!metadataContent) {
      // Retry once if we get null and are forcing fresh (might be propagation delay)
      if (forceFresh) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const retryContent = await getFileContent(`public/stories/${slug}/metadata.json`)
        if (!retryContent) {
          return null
        }
        return JSON.parse(retryContent)
      }
      return null
    }
    return JSON.parse(metadataContent)
  } catch (error) {
    // Retry once if we get an error and are forcing fresh (might be propagation delay)
    if (forceFresh && error.status !== 404) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      try {
        const retryContent = await getFileContent(`public/stories/${slug}/metadata.json`)
        if (!retryContent) {
          return null
        }
        return JSON.parse(retryContent)
      } catch (retryError) {
        if (retryError.status === 404) {
          return null
        }
        console.error('Error fetching story metadata from GitHub (retry failed):', retryError)
        throw retryError
      }
    }
    if (error.status === 404) {
      return null
    }
    console.error('Error fetching story metadata from GitHub:', error)
    throw error
  }
}

export async function uploadStory(storyData) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.')
  }

  const slug = storyData.slug || generateSlug(storyData.title)
  const storyPath = `public/stories/${slug}`
  const isExistingStory = storyData.isExistingStory || false
  
  const files = []
  let existingMetadata = null
  let existingChapters = []
  let nextChapterNumber = 1

  if (isExistingStory) {
    existingMetadata = await getStoryMetadataFromGitHub(slug)
    if (!existingMetadata) {
      throw new Error(`Story with slug "${slug}" not found. Cannot add chapters to non-existent story.`)
    }
    existingChapters = existingMetadata.chapters || []
    nextChapterNumber = existingChapters.length + 1
  }

  const newChapters = storyData.chapters || []
  const allChapters = isExistingStory 
    ? [
        ...existingChapters,
        ...newChapters.map((chapter, index) => ({
          title: chapter.title,
          file: `chapter-${nextChapterNumber + index}.md`
        }))
      ]
    : newChapters.map((chapter, index) => ({
        title: chapter.title,
        file: `chapter-${index + 1}.md`
      }))

  const metadata = isExistingStory ? {
    ...existingMetadata,
    chapters: allChapters
  } : {
    title: storyData.title,
    author: storyData.author,
    summary: storyData.summary,
    rating: storyData.rating || 'PG',
    tags: capitalizeTags(storyData.tags),
    slug: slug,
    chapters: allChapters
  }

  files.push({
    path: `${storyPath}/metadata.json`,
    content: JSON.stringify(metadata, null, 2)
  })

  newChapters.forEach((chapter, index) => {
    const chapterNumber = isExistingStory ? nextChapterNumber + index : index + 1
    files.push({
      path: `${storyPath}/chapter-${chapterNumber}.md`,
      content: chapter.content
    })
  })

  const currentIndex = await getStoriesIndex()
  const storyIndexEntry = {
    title: metadata.title,
    author: metadata.author,
    summary: metadata.summary,
    rating: metadata.rating,
    tags: capitalizeTags(metadata.tags),
    slug: slug,
    chapters: allChapters
  }

  const updatedIndex = [
    ...currentIndex.filter(s => s.slug !== slug),
    storyIndexEntry
  ]

  files.push({
    path: 'public/stories-index.json',
    content: JSON.stringify({ stories: updatedIndex }, null, 2)
  })

  const commitMessage = isExistingStory 
    ? `Add ${newChapters.length} chapter(s) to story: ${metadata.title}`
    : `Add story: ${storyData.title}`
  
  return await commitFiles(files, commitMessage)
}

function capitalizeTag(tag) {
  if (!tag) return tag
  return tag
    .toString()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function capitalizeTags(tags) {
  if (!tags) return []
  if (Array.isArray(tags)) {
    return tags.map(tag => capitalizeTag(tag)).filter(Boolean)
  }
  if (typeof tags === 'string') {
    return tags.split(',').map(t => capitalizeTag(t.trim())).filter(Boolean)
  }
  return []
}

export async function capitalizeAllStoryTags() {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.')
  }

  try {
    const storiesIndex = await getStoriesIndex()
    const files = []
    
    for (const story of storiesIndex) {
      const slug = story.slug
      let metadata = null
      
      try {
        metadata = await getStoryMetadataFromGitHub(slug)
      } catch (err) {
        console.warn(`Could not load metadata for story ${slug}:`, err)
        continue
      }

      if (!metadata) {
        console.warn(`Metadata not found for story ${slug}`)
        continue
      }

      const originalTags = metadata.tags || []
      const capitalizedTags = capitalizeTags(originalTags)
      
      if (JSON.stringify(originalTags) !== JSON.stringify(capitalizedTags)) {
        const updatedMetadata = {
          ...metadata,
          tags: capitalizedTags
        }
        
        files.push({
          path: `public/stories/${slug}/metadata.json`,
          content: JSON.stringify(updatedMetadata, null, 2)
        })
      }
    }

    if (files.length === 0) {
      return { success: true, message: 'No tags needed capitalization', updatedCount: 0 }
    }

    const updatedIndex = storiesIndex.map(story => {
      const slug = story.slug
      const file = files.find(f => f.path === `public/stories/${slug}/metadata.json`)
      if (file) {
        const updatedMetadata = JSON.parse(file.content)
        return {
          ...story,
          tags: updatedMetadata.tags
        }
      }
      return story
    })

    files.push({
      path: 'public/stories-index.json',
      content: JSON.stringify({ stories: updatedIndex }, null, 2)
    })

    const commitMessage = `Capitalize tags in ${files.length - 1} story/stories`
    const result = await commitFiles(files, commitMessage)

    return {
      success: true,
      message: `Successfully capitalized tags in ${files.length - 1} story/stories`,
      updatedCount: files.length - 1,
      commitSha: result.commitSha
    }
  } catch (error) {
    console.error('Error capitalizing story tags:', error)
    throw error
  }
}

export async function updateStory(slug, storyData) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.')
  }

  try {
    const existingMetadata = await getStoryMetadataFromGitHub(slug)
    if (!existingMetadata) {
      throw new Error(`Story with slug "${slug}" not found.`)
    }

    const updatedMetadata = {
      ...existingMetadata,
      title: storyData.title || existingMetadata.title,
      author: storyData.author || existingMetadata.author,
      summary: storyData.summary !== undefined ? storyData.summary : existingMetadata.summary,
      rating: storyData.rating || existingMetadata.rating,
      tags: storyData.tags !== undefined ? capitalizeTags(storyData.tags) : existingMetadata.tags,
      slug: slug,
      chapters: existingMetadata.chapters
    }

    const files = [{
      path: `public/stories/${slug}/metadata.json`,
      content: JSON.stringify(updatedMetadata, null, 2)
    }]

    const currentIndex = await getStoriesIndex()
    const storyIndexEntry = {
      title: updatedMetadata.title,
      author: updatedMetadata.author,
      summary: updatedMetadata.summary,
      rating: updatedMetadata.rating,
      tags: updatedMetadata.tags,
      slug: slug,
      chapters: updatedMetadata.chapters
    }

    const updatedIndex = [
      ...currentIndex.filter(s => s.slug !== slug),
      storyIndexEntry
    ]

    files.push({
      path: 'public/stories-index.json',
      content: JSON.stringify({ stories: updatedIndex }, null, 2)
    })

    const commitMessage = `Update story: ${updatedMetadata.title}`
    return await commitFiles(files, commitMessage)
  } catch (error) {
    console.error('Error updating story:', error)
    throw error
  }
}

export async function deleteStory(slug) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.')
  }

  try {
    const metadata = await getStoryMetadataFromGitHub(slug)
    if (!metadata) {
      throw new Error(`Story with slug "${slug}" not found.`)
    }

    const storyPath = `public/stories/${slug}`
    const deletePaths = []

    deletePaths.push(`${storyPath}/metadata.json`)

    if (metadata.chapters && metadata.chapters.length > 0) {
      metadata.chapters.forEach(chapter => {
        if (chapter.file) {
          deletePaths.push(`${storyPath}/${chapter.file}`)
        }
      })
    }

    const currentIndex = await getStoriesIndex()
    const updatedIndex = currentIndex.filter(s => s.slug !== slug)

    const files = [{
      path: 'public/stories-index.json',
      content: JSON.stringify({ stories: updatedIndex }, null, 2)
    }]

    const commitMessage = `Delete story: ${metadata.title}`
    return await commitFiles(files, commitMessage, deletePaths)
  } catch (error) {
    console.error('Error deleting story:', error)
    throw error
  }
}

export async function updateChapter(slug, chapterNum, chapterData) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.')
  }

  try {
    const metadata = await getStoryMetadataFromGitHub(slug)
    if (!metadata) {
      throw new Error(`Story with slug "${slug}" not found.`)
    }

    const chapters = metadata.chapters || []
    const chapterIndex = chapterNum - 1

    if (chapterIndex < 0 || chapterIndex >= chapters.length) {
      throw new Error(`Chapter ${chapterNum} not found.`)
    }

    const updatedChapters = [...chapters]
    updatedChapters[chapterIndex] = {
      ...updatedChapters[chapterIndex],
      title: chapterData.title || updatedChapters[chapterIndex].title
    }

    const chapterFile = updatedChapters[chapterIndex].file || `chapter-${chapterNum}.md`
    const storyPath = `public/stories/${slug}`

    const files = [
      {
        path: `${storyPath}/${chapterFile}`,
        content: chapterData.content
      },
      {
        path: `${storyPath}/metadata.json`,
        content: JSON.stringify({
          ...metadata,
          chapters: updatedChapters
        }, null, 2)
      }
    ]

    const currentIndex = await getStoriesIndex()
    const storyIndex = currentIndex.findIndex(s => s.slug === slug)
    if (storyIndex >= 0) {
      const updatedStory = {
        ...currentIndex[storyIndex],
        chapters: updatedChapters
      }
      const updatedIndex = [
        ...currentIndex.slice(0, storyIndex),
        updatedStory,
        ...currentIndex.slice(storyIndex + 1)
      ]

      files.push({
        path: 'public/stories-index.json',
        content: JSON.stringify({ stories: updatedIndex }, null, 2)
      })
    }

    const commitMessage = `Update chapter ${chapterNum} of ${metadata.title}`
    return await commitFiles(files, commitMessage)
  } catch (error) {
    console.error('Error updating chapter:', error)
    throw error
  }
}

export async function deleteChapter(slug, chapterNum) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.')
  }

  try {
    const metadata = await getStoryMetadataFromGitHub(slug)
    if (!metadata) {
      throw new Error(`Story with slug "${slug}" not found.`)
    }

    const chapters = metadata.chapters || []
    const chapterIndex = chapterNum - 1

    if (chapterIndex < 0 || chapterIndex >= chapters.length) {
      throw new Error(`Chapter ${chapterNum} not found.`)
    }

    if (chapters.length === 1) {
      throw new Error('Cannot delete the only chapter. Delete the story instead.')
    }

    const chapterToDelete = chapters[chapterIndex]
    const chapterFile = chapterToDelete.file || `chapter-${chapterNum}.md`
    const storyPath = `public/stories/${slug}`

    const remainingChapters = chapters.filter((_, index) => index !== chapterIndex)
    
    const files = []
    const deletePaths = [`${storyPath}/${chapterFile}`]

    for (let i = 0; i < remainingChapters.length; i++) {
      const originalIndex = i < chapterIndex ? i : i + 1
      const originalChapter = chapters[originalIndex]
      const oldFile = originalChapter.file || `chapter-${originalIndex + 1}.md`
      const newNum = i + 1
      const newFile = `chapter-${newNum}.md`

      try {
        const content = await getFileContent(`${storyPath}/${oldFile}`)
        if (content) {
          files.push({
            path: `${storyPath}/${newFile}`,
            content: content
          })
          if (oldFile !== newFile) {
            deletePaths.push(`${storyPath}/${oldFile}`)
          }
        }
      } catch (err) {
        console.warn(`Could not read chapter file ${oldFile}:`, err)
      }
    }

    const renumberedChapters = remainingChapters.map((chapter, index) => ({
      ...chapter,
      file: `chapter-${index + 1}.md`
    }))

    const updatedMetadata = {
      ...metadata,
      chapters: renumberedChapters
    }

    files.push({
      path: `${storyPath}/metadata.json`,
      content: JSON.stringify(updatedMetadata, null, 2)
    })

    const currentIndex = await getStoriesIndex()
    const storyIndex = currentIndex.findIndex(s => s.slug === slug)
    if (storyIndex >= 0) {
      const updatedStory = {
        ...currentIndex[storyIndex],
        chapters: renumberedChapters
      }
      const updatedIndex = [
        ...currentIndex.slice(0, storyIndex),
        updatedStory,
        ...currentIndex.slice(storyIndex + 1)
      ]

      files.push({
        path: 'public/stories-index.json',
        content: JSON.stringify({ stories: updatedIndex }, null, 2)
      })
    }

    const commitMessage = `Delete chapter ${chapterNum} from ${metadata.title}`
    return await commitFiles(files, commitMessage, deletePaths)
  } catch (error) {
    console.error('Error deleting chapter:', error)
    throw error
  }
}

export async function getChapterContent(slug, chapterNum) {
  try {
    const metadata = await getStoryMetadataFromGitHub(slug)
    if (!metadata) {
      return null
    }

    const chapters = metadata.chapters || []
    const chapterIndex = chapterNum - 1

    if (chapterIndex < 0 || chapterIndex >= chapters.length) {
      return null
    }

    const chapter = chapters[chapterIndex]
    const chapterFile = chapter.file || `chapter-${chapterNum}.md`
    const content = await getFileContent(`public/stories/${slug}/${chapterFile}`)
    return content
  } catch (error) {
    console.error('Error getting chapter content:', error)
    return null
  }
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
