import { Link } from 'react-router-dom'
import GridIcon from './icons/GridIcon'
import ListIcon from './icons/ListIcon'
import UploadIcon from './icons/UploadIcon'

function SearchFilter({
  allTags,
  selectedTags,
  onTagsChange,
  viewMode,
  onViewModeChange,
  resultCount
}) {
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag))
    } else {
      onTagsChange([...selectedTags, tag])
    }
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-4 py-2.5 rounded-md border transition-colors flex items-center justify-center ${
              viewMode === 'grid'
                ? 'bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 border-warm-900 dark:border-warm-100'
                : 'bg-white dark:bg-warm-800 border-warm-300 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700'
            }`}
            aria-label="Grid view"
          >
            <GridIcon className="w-5 h-5 block" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-4 py-2.5 rounded-md border transition-colors flex items-center justify-center ${
              viewMode === 'list'
                ? 'bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 border-warm-900 dark:border-warm-100'
                : 'bg-white dark:bg-warm-800 border-warm-300 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700'
            }`}
            aria-label="List view"
          >
            <ListIcon className="w-5 h-5 block" />
          </button>
          <Link
            to="/upload"
            className="px-4 py-2.5 rounded-md border transition-colors bg-white dark:bg-warm-800 border-warm-300 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700 flex items-center justify-center"
            aria-label="Upload story"
          >
            <UploadIcon className="w-5 h-5 block" />
          </Link>
        </div>
        <div className="text-sm text-warm-600 dark:text-warm-400">
          Showing {resultCount} {resultCount === 1 ? 'story' : 'stories'}
        </div>
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-warm-600 dark:text-warm-400 font-medium">Active filters:</span>
          {selectedTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className="px-3 py-1.5 bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 text-sm rounded-sm hover:opacity-80 transition-opacity flex items-center gap-1.5 font-medium"
            >
              {tag}
              <span className="text-xs">×</span>
            </button>
          ))}
          <button
            onClick={() => onTagsChange([])}
            className="px-3 py-1.5 text-sm text-warm-600 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-3 py-1.5 text-sm rounded-sm transition-colors font-medium ${
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
  )
}

export default SearchFilter
