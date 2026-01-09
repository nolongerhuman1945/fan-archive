import { createContext, useContext, useState } from 'react'

const SearchContext = createContext()

export function SearchProvider({ children }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, selectedTags, setSelectedTags }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}
