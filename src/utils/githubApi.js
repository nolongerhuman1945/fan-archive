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

export async function getFileContent(path) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: path
    })
    
    if (data.type === 'file' && data.encoding === 'base64') {
      return atob(data.content.replace(/\s/g, ''))
    }
    return null
  } catch (error) {
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
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    if (error.status === 404) {
      return []
    }
    console.error('Error fetching stories index:', error)
    return []
  }
}

export async function commitFiles(files, commitMessage) {
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

    const treeItems = await Promise.all(
      files.map(async (file) => {
        const content = typeof file.content === 'string' 
          ? btoa(unescape(encodeURIComponent(file.content)))
          : file.content

        const { data: blob } = await octokit.git.createBlob({
          owner: GITHUB_OWNER,
          repo: GITHUB_REPO,
          content: content,
          encoding: 'base64'
        })

        return {
          path: file.path,
          mode: '100644',
          type: 'blob',
          sha: blob.sha
        }
      })
    )

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

export async function uploadStory(storyData) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN in your .env file.')
  }

  const slug = storyData.slug || generateSlug(storyData.title)
  const storyPath = `public/stories/${slug}`
  
  const files = []
  const chapters = storyData.chapters || []

  const metadata = {
    title: storyData.title,
    author: storyData.author,
    summary: storyData.summary,
    rating: storyData.rating || 'PG',
    tags: Array.isArray(storyData.tags) ? storyData.tags : (storyData.tags || '').split(',').map(t => t.trim()).filter(Boolean),
    slug: slug,
    chapters: chapters.map((chapter, index) => ({
      title: chapter.title,
      file: `chapter-${index + 1}.md`
    }))
  }

  files.push({
    path: `${storyPath}/metadata.json`,
    content: JSON.stringify(metadata, null, 2)
  })

  chapters.forEach((chapter, index) => {
    files.push({
      path: `${storyPath}/chapter-${index + 1}.md`,
      content: chapter.content
    })
  })

  const currentIndex = await getStoriesIndex()
  const updatedIndex = [
    ...currentIndex.filter(s => s.slug !== slug),
    {
      title: metadata.title,
      author: metadata.author,
      summary: metadata.summary,
      rating: metadata.rating,
      tags: metadata.tags,
      slug: slug,
      chapters: metadata.chapters
    }
  ]

  files.push({
    path: 'public/stories-index.json',
    content: JSON.stringify(updatedIndex, null, 2)
  })

  const commitMessage = `Add story: ${storyData.title}`
  
  return await commitFiles(files, commitMessage)
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
