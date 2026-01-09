import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useSearch } from '../contexts/SearchContext'

function Layout({ children }) {
  const { searchTerm, setSearchTerm } = useSearch()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-[#14191A]">
      <nav className="border-b border-warm-200 dark:border-warm-800 bg-warm-50/95 dark:bg-[#14191A]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-medium text-warm-900 dark:text-warm-50 hover:opacity-70 transition-opacity tracking-tight">
                Fanfic Archive
              </Link>
              <div className="sm:hidden">
                <ThemeToggle />
              </div>
            </div>
            <div className="flex-1 flex items-center gap-3">
              {location.pathname !== '/upload' && (
                <div className="flex-1 relative max-w-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-warm-400 dark:text-warm-500" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search stories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-800 text-warm-900 dark:text-warm-100 placeholder-warm-400 dark:placeholder-warm-500 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600 focus:border-warm-400 dark:focus:border-warm-600 transition-colors text-sm"
                  />
                </div>
              )}
              <Link
                to="/upload"
                className="px-4 py-2 text-sm bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 rounded-md hover:opacity-80 transition-opacity font-medium"
              >
                Upload
              </Link>
              <div className="hidden sm:block">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-warm-200 dark:border-warm-800 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-warm-600 dark:text-warm-400 text-sm">
          <p>Fanfic Archive &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout
