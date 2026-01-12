import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'
import { useSearch } from '../contexts/SearchContext'
import { useNotification } from '../contexts/NotificationContext'

function Layout({ children }) {
  const { searchTerm, setSearchTerm } = useSearch()
  const { notifications } = useNotification()
  const location = useLocation()
  const [headerVisible, setHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)
  const scrollTimeout = useRef(null)

  // Check if there are any loading notifications
  const hasLoadingNotifications = notifications.some(n => n.type === 'loading')

  // Handle scroll behavior - hide/show header on scroll
  useEffect(() => {

    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Always show header at top of page
      if (currentScrollY < 10) {
        setHeaderVisible(true)
        lastScrollY.current = currentScrollY
        return
      }

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }

      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down - hide header
        setHeaderVisible(false)
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up - show header
        setHeaderVisible(true)
      }

      lastScrollY.current = currentScrollY

      // Debounce: show header after scrolling stops (optional)
      scrollTimeout.current = setTimeout(() => {
        // Optionally show header after scroll stops
        // setHeaderVisible(true)
      }, 150)
    }

    // Throttle scroll events for performance
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', throttledHandleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-[#14191A]">
      <nav 
        className={`border-b border-warm-200 dark:border-warm-800 bg-warm-50/95 dark:bg-[#14191A]/95 backdrop-blur-sm sticky top-0 z-50 transition-transform duration-300 ease-in-out ${
          !headerVisible ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4 py-4">
            <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-medium text-warm-600 dark:text-warm-400 hover:opacity-70 transition-opacity tracking-tight shrink-0">
              <img 
                src="/site-icon.png"
                alt="Fan-Archive" 
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain flex-shrink-0" 
                style={{ display: 'block', minWidth: '28px', minHeight: '28px' }}
                onLoad={() => console.log('Site icon loaded successfully')}
                onError={(e) => {
                  console.error('Site icon failed to load, trying alternative path');
                  if (!e.target.dataset.retried) {
                    e.target.dataset.retried = 'true';
                    e.target.src = `${import.meta.env.BASE_URL}site-icon.png`;
                  }
                }}
              />
              <span className="hidden sm:inline">Fan-Archive</span>
              <span className="sm:hidden">Fan-Archive</span>
            </Link>
            {location.pathname !== '/upload' && (
              <div className="flex-1 flex justify-center max-w-2xl mx-auto hidden sm:flex">
                <div className="relative w-full">
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
              </div>
            )}
            <div className="ml-auto shrink-0 flex items-center gap-3">
              {hasLoadingNotifications && (
                <div className="flex items-center gap-2 text-warm-600 dark:text-warm-400 text-xs">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Processing...</span>
                </div>
              )}
              <ThemeToggle />
            </div>
          </div>
          {location.pathname !== '/upload' && (
            <div className="pb-3 sm:hidden">
              <div className="relative">
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
            </div>
          )}
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout
