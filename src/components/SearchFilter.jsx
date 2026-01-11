import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import GridIcon from './icons/GridIcon'
import ListIcon from './icons/ListIcon'
import UploadIcon from './icons/UploadIcon'
import Tooltip from './Tooltip'

function SearchFilter({
  allTags,
  selectedTags,
  onTagsChange,
  viewMode,
  onViewModeChange,
  resultCount
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const tagsContainerRef = useRef(null)

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  const checkScrollButtons = () => {
    if (!tagsContainerRef.current) return
    
    const container = tagsContainerRef.current
    const scrollLeft = container.scrollLeft
    const scrollWidth = container.scrollWidth
    const clientWidth = container.clientWidth

    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1)
  }

  useEffect(() => {
    checkScrollButtons()
    
    const container = tagsContainerRef.current
    if (!container) return

    container.addEventListener('scroll', checkScrollButtons)
    window.addEventListener('resize', checkScrollButtons)

    return () => {
      container.removeEventListener('scroll', checkScrollButtons)
      window.removeEventListener('resize', checkScrollButtons)
    }
  }, [allTags, isExpanded])

  const scrollLeft = () => {
    if (tagsContainerRef.current) {
      tagsContainerRef.current.scrollBy({
        left: -250,
        behavior: 'smooth'
      })
      setTimeout(checkScrollButtons, 300)
    }
  }

  const scrollRight = () => {
    if (tagsContainerRef.current) {
      tagsContainerRef.current.scrollBy({
        left: 250,
        behavior: 'smooth'
      })
      setTimeout(checkScrollButtons, 300)
    }
  }

  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleCollapse = () => {
    setIsExpanded(false)
    if (tagsContainerRef.current) {
      tagsContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="mb-8 space-y-4">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-warm-600 dark:text-warm-400 font-medium">Active filters:</span>
          {selectedTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-3 py-1.5 bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 text-sm rounded-md hover:opacity-80 transition-opacity flex items-center gap-1.5 font-medium"
            >
              {tag}
              <span className="text-xs">×</span>
            </button>
          ))}
          <button
            onClick={() => onTagsChange([])}
            className="px-3 py-1.5 text-sm text-warm-600 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 underline underline-offset-2 rounded-md"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-2 flex-shrink-0">
            <Tooltip text="Switch to grid view" position="bottom">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`px-3 py-1.5 rounded-md border transition-colors flex items-center justify-center ${
                  viewMode === 'grid'
                    ? 'bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 border-warm-900 dark:border-warm-100'
                    : 'bg-white dark:bg-warm-800 border-warm-300 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700'
                }`}
                aria-label="Grid view"
              >
                <GridIcon className="w-5 h-5 block" />
              </button>
            </Tooltip>
            <Tooltip text="Switch to list view" position="bottom">
              <button
                onClick={() => onViewModeChange('list')}
                className={`px-3 py-1.5 rounded-md border transition-colors flex items-center justify-center ${
                  viewMode === 'list'
                    ? 'bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 border-warm-900 dark:border-warm-100'
                    : 'bg-white dark:bg-warm-800 border-warm-300 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700'
                }`}
                aria-label="List view"
              >
                <ListIcon className="w-5 h-5 block" />
              </button>
            </Tooltip>
            <Tooltip text="Upload new story" position="bottom">
              <Link
                to="/upload"
                className="px-3 py-1.5 rounded-md border transition-colors bg-white dark:bg-warm-800 border-warm-300 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700 flex items-center justify-center"
                aria-label="Upload story"
              >
                <UploadIcon className="w-5 h-5 block" />
              </Link>
            </Tooltip>
          </div>

          {allTags.length > 0 && (
            <div className={`flex items-center gap-2 flex-1 min-w-0 ${isExpanded ? 'invisible pointer-events-none' : ''}`}>
              {canScrollLeft ? (
                <Tooltip text="Scroll left for more tags" position="bottom">
                  <button
                    onClick={scrollLeft}
                    className="flex-shrink-0 px-3 py-1.5 rounded-md border transition-colors flex items-center justify-center bg-white dark:bg-warm-800 border-warm-300 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700"
                    aria-label="Scroll left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                </Tooltip>
              ) : (
                <button
                  disabled
                  className="flex-shrink-0 px-3 py-1.5 rounded-md border bg-warm-100 dark:bg-warm-900 border-warm-200 dark:border-warm-800 text-warm-400 dark:text-warm-600 cursor-not-allowed opacity-50"
                  aria-label="Scroll left"
                  tabIndex={-1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
              )}

              <div className="relative flex-1 min-w-0">
                {canScrollLeft && (
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-warm-50/80 via-warm-50/40 to-transparent dark:from-[#14191A]/80 dark:via-[#14191A]/40 pointer-events-none z-10" />
                )}
                {canScrollRight && (
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-warm-50/80 via-warm-50/40 to-transparent dark:from-[#14191A]/80 dark:via-[#14191A]/40 pointer-events-none z-10" />
                )}
                <div
                  ref={tagsContainerRef}
                  className="flex gap-2 overflow-x-auto scrollbar-hide"
                >
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium flex-shrink-0 ${
                        selectedTags.includes(tag)
                          ? 'bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900'
                          : 'bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 border border-warm-200 dark:border-warm-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {canScrollRight ? (
                <Tooltip text="Scroll right for more tags" position="bottom">
                  <button
                    onClick={scrollRight}
                    className="flex-shrink-0 px-3 py-1.5 rounded-md border transition-colors flex items-center justify-center bg-white dark:bg-warm-800 border-warm-300 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700"
                    aria-label="Scroll right"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </Tooltip>
              ) : (
                <button
                  disabled
                  className="flex-shrink-0 px-3 py-1.5 rounded-md border bg-warm-100 dark:bg-warm-900 border-warm-200 dark:border-warm-800 text-warm-400 dark:text-warm-600 cursor-not-allowed opacity-50"
                  aria-label="Scroll right"
                  tabIndex={-1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              )}

              <Tooltip text="View all tags" position="bottom">
                <button
                  onClick={handleExpand}
                  className="px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-white dark:bg-warm-800 border border-warm-300 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700 flex-shrink-0"
                  aria-label="View all tags"
                >
                  View all tags
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700">
            <div className="flex items-center justify-between p-4 pb-3 border-b border-warm-200 dark:border-warm-700">
              <span className="text-sm font-medium text-warm-700 dark:text-warm-300">All Tags</span>
              <Tooltip text="Collapse tags" position="bottom">
                <button
                  onClick={handleCollapse}
                  className="px-3 py-1.5 text-sm rounded-md transition-colors font-medium bg-white dark:bg-warm-800 border border-warm-300 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700"
                  aria-label="Collapse tags"
                >
                  Collapse
                </button>
              </Tooltip>
            </div>
            <div className="p-4 pt-3">
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors font-medium ${
                      selectedTags.includes(tag)
                        ? 'bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900'
                        : 'bg-warm-100 dark:bg-warm-800 text-warm-700 dark:text-warm-300 hover:bg-warm-200 dark:hover:bg-warm-700 border border-warm-200 dark:border-warm-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="text-sm text-warm-600 dark:text-warm-400">
        Showing {resultCount} {resultCount === 1 ? 'story' : 'stories'}
      </div>
    </div>
  )
}

export default SearchFilter
