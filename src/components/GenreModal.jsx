import { useState, useEffect, useMemo } from 'react'
import { genreHierarchy, getAllGenres, getGenreName } from '../utils/genreData'

function GenreModal({ isOpen, onClose, onApply, selectedGenreIds = [] }) {
  const [selectedIds, setSelectedIds] = useState(new Set(selectedGenreIds))
  const [expandedCategories, setExpandedCategories] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')

  // Initialize with selected genres
  useEffect(() => {
    setSelectedIds(new Set(selectedGenreIds))
  }, [selectedGenreIds, isOpen])

  // Expand all categories when modal opens
  useEffect(() => {
    if (isOpen) {
      const allCategoryIds = new Set()
      genreHierarchy.forEach(category => {
        allCategoryIds.add(category.id)
        if (category.children) {
          category.children.forEach(subcategory => {
            allCategoryIds.add(subcategory.id)
          })
        }
      })
      setExpandedCategories(allCategoryIds)
    }
  }, [isOpen])

  // Get all genre IDs (leaf nodes only)
  const getAllGenreIds = (categories) => {
    const ids = []
    categories.forEach(category => {
      if (category.children) {
        category.children.forEach(subcategory => {
          if (subcategory.children) {
            subcategory.children.forEach(genre => {
              ids.push(genre.id)
            })
          } else {
            ids.push(subcategory.id)
          }
        })
      } else {
        ids.push(category.id)
      }
    })
    return ids
  }

  // Get child genre IDs for a category/subcategory
  const getChildGenreIds = (item) => {
    if (!item.children) return []
    const ids = []
    item.children.forEach(child => {
      if (child.children) {
        child.children.forEach(genre => {
          ids.push(genre.id)
        })
      } else {
        ids.push(child.id)
      }
    })
    return ids
  }

  // Check if all children are selected
  const areAllChildrenSelected = (item) => {
    const childIds = getChildGenreIds(item)
    if (childIds.length === 0) return false
    return childIds.every(id => selectedIds.has(id))
  }

  // Check if some children are selected
  const areSomeChildrenSelected = (item) => {
    const childIds = getChildGenreIds(item)
    if (childIds.length === 0) return false
    const selectedCount = childIds.filter(id => selectedIds.has(id)).length
    return selectedCount > 0 && selectedCount < childIds.length
  }

  // Toggle category selection (select/deselect all children)
  const toggleCategory = (item) => {
    const childIds = getChildGenreIds(item)
    if (childIds.length === 0) return

    const newSelected = new Set(selectedIds)
    const allSelected = areAllChildrenSelected(item)

    if (allSelected) {
      // Deselect all children
      childIds.forEach(id => newSelected.delete(id))
    } else {
      // Select all children
      childIds.forEach(id => newSelected.add(id))
    }

    setSelectedIds(newSelected)
  }

  // Toggle individual genre selection
  const toggleGenre = (genreId) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(genreId)) {
      newSelected.delete(genreId)
    } else {
      newSelected.add(genreId)
    }
    setSelectedIds(newSelected)
  }

  // Toggle category expansion
  const toggleExpanded = (categoryId) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Select all genres
  const handleSelectAll = () => {
    const allIds = getAllGenreIds(genreHierarchy)
    setSelectedIds(new Set(allIds))
  }

  // Clear all selections
  const handleClearAll = () => {
    setSelectedIds(new Set())
  }

  // Filter categories based on search
  const filteredHierarchy = useMemo(() => {
    if (!searchTerm.trim()) return genreHierarchy

    const searchLower = searchTerm.toLowerCase()
    const allGenres = getAllGenres()
    const matchingGenreIds = allGenres
      .filter(genre => genre.name.toLowerCase().includes(searchLower))
      .map(genre => genre.id)
    const matchingIdsSet = new Set(matchingGenreIds)

    return genreHierarchy
      .map(category => {
        if (category.children) {
          const filteredChildren = category.children
            .map(subcategory => {
              if (subcategory.children) {
                const filteredGenres = subcategory.children.filter(
                  genre => matchingIdsSet.has(genre.id)
                )
                if (filteredGenres.length > 0) {
                  return { ...subcategory, children: filteredGenres }
                }
                return null
              } else if (matchingIdsSet.has(subcategory.id)) {
                return subcategory
              }
              return null
            })
            .filter(Boolean)

          if (filteredChildren.length > 0) {
            return { ...category, children: filteredChildren }
          }
          return null
        } else if (matchingIdsSet.has(category.id)) {
          return category
        }
        return null
      })
      .filter(Boolean)
  }, [searchTerm])

  // Count selected genres
  const selectedCount = selectedIds.size

  // Handle apply
  const handleApply = () => {
    onApply(Array.from(selectedIds))
    onClose()
  }

  // Render checkbox with indeterminate state
  const renderCheckbox = (item, isIndeterminate) => {
    const checked = areAllChildrenSelected(item)
    return (
      <input
        type="checkbox"
        checked={checked}
        ref={(el) => {
          if (el) el.indeterminate = isIndeterminate && !checked
        }}
        onChange={() => toggleCategory(item)}
        className="w-4 h-4 text-warm-900 dark:text-warm-100 bg-white dark:bg-warm-700 border-warm-300 dark:border-warm-600 rounded focus:ring-warm-400 dark:focus:ring-warm-600 cursor-pointer"
      />
    )
  }

  // Render category/subcategory
  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)
    const isIndeterminate = areSomeChildrenSelected(category)

    return (
      <div key={category.id} className={level > 0 ? 'ml-4' : ''}>
        <div className="flex items-center gap-2 py-1.5">
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(category.id)}
              className="text-warm-600 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 transition-colors p-0.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          {hasChildren && renderCheckbox(category, isIndeterminate)}
          {!hasChildren && (
            <input
              type="checkbox"
              checked={selectedIds.has(category.id)}
              onChange={() => toggleGenre(category.id)}
              className="w-4 h-4 text-warm-900 dark:text-warm-100 bg-white dark:bg-warm-700 border-warm-300 dark:border-warm-600 rounded focus:ring-warm-400 dark:focus:ring-warm-600 cursor-pointer"
            />
          )}
          <label
            className="flex-1 text-sm text-warm-900 dark:text-warm-50 cursor-pointer select-none"
            onClick={() => hasChildren ? toggleCategory(category) : toggleGenre(category.id)}
          >
            {category.name}
          </label>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-6">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-warm-200 dark:border-warm-700">
          <h3 className="text-lg font-medium text-warm-900 dark:text-warm-50 mb-3">
            Select Genres
          </h3>
          <input
            type="text"
            placeholder="Search genres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-700 text-warm-900 dark:text-warm-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600 focus:border-warm-400 dark:focus:border-warm-600 text-sm"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-warm-600 dark:text-warm-400">
              {selectedCount} {selectedCount === 1 ? 'genre' : 'genres'} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 text-xs bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
              >
                Select All
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-xs bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredHierarchy.length === 0 ? (
            <div className="text-center py-8 text-warm-600 dark:text-warm-400">
              No genres found matching "{searchTerm}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredHierarchy.map(category => renderCategory(category))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-warm-200 dark:border-warm-700 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 rounded-md hover:opacity-80 transition-opacity font-medium"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default GenreModal
