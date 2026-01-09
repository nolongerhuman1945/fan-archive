import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { loadAllStories } from '../utils/storyLoader'
import StoryCard from '../components/StoryCard'
import SearchFilter from '../components/SearchFilter'
import { useSearch } from '../contexts/SearchContext'

function HomePage() {
  const [stories, setStories] = useState([])
  const [filteredStories, setFilteredStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const { searchTerm, selectedTags, setSelectedTags } = useSearch()
  const [allTags, setAllTags] = useState([])

  useEffect(() => {
    async function fetchStories() {
      setLoading(true)
      const data = await loadAllStories()
      setStories(data)
      setFilteredStories(data)
      
      const tags = [...new Set(data.flatMap(story => story.tags || []))]
      setAllTags(tags.sort())
      setLoading(false)
    }
    fetchStories()
  }, [])

  useEffect(() => {
    let filtered = stories

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(term) ||
        story.author.toLowerCase().includes(term) ||
        story.summary?.toLowerCase().includes(term)
      )
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(story =>
        selectedTags.every(tag => story.tags?.includes(tag))
      )
    }

    setFilteredStories(filtered)
  }, [searchTerm, selectedTags, stories])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg text-warm-600 dark:text-warm-400">Loading stories...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-medium mb-2 text-warm-900 dark:text-warm-50 tracking-tight">Story Archive</h1>
        <p className="text-warm-600 dark:text-warm-400">Browse our collection of fanfiction stories</p>
      </div>

      <SearchFilter
        allTags={allTags}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        resultCount={filteredStories.length}
      />

      {filteredStories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-warm-600 dark:text-warm-400 text-lg">No stories found matching your criteria.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-6'
        }>
          {filteredStories.map(story => (
            <StoryCard key={story.slug} story={story} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage
