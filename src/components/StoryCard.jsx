import { Link } from 'react-router-dom'
import { getBookmark } from '../utils/bookmarkManager'
import { getGenreName } from '../utils/genreData'

function StoryCard({ story, viewMode }) {
  const bookmark = getBookmark(story.slug)
  const storyPath = `/story/${story.slug}`
  
  const ratingColors = {
    'G': 'bg-warm-100 text-warm-700 dark:bg-warm-800 dark:text-warm-300',
    'PG': 'bg-warm-200 text-warm-800 dark:bg-warm-700 dark:text-warm-200',
    'PG-13': 'bg-warm-300 text-warm-900 dark:bg-warm-600 dark:text-warm-100',
    'R': 'bg-warm-400 text-warm-900 dark:bg-warm-500 dark:text-warm-50',
    'M': 'bg-warm-500 text-white dark:bg-warm-400 dark:text-warm-900',
  }

  if (viewMode === 'list') {
    return (
      <Link
        to={storyPath}
        className="block p-6 bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 hover:border-warm-400 dark:hover:border-warm-600 transition-all hover:shadow-soft-lg group"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <h2 className="text-xl font-medium text-warm-900 dark:text-warm-50 group-hover:opacity-80 transition-opacity tracking-tight flex-1">{story.title}</h2>
              {bookmark && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-warm-600 dark:text-warm-400 flex-shrink-0 mt-0.5" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} title={`Last read: Chapter ${bookmark.chapterNum}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </div>
            <p className="text-sm text-warm-600 dark:text-warm-400 mb-2">by {story.author}</p>
            <p className="text-warm-700 dark:text-warm-300 mb-3 line-clamp-2 leading-relaxed text-sm">{story.summary}</p>
            <div className="flex flex-wrap gap-2">
              {story.genres && story.genres.length > 0
                ? story.genres.map(genreId => (
                    <span
                      key={genreId}
                      className="px-2.5 py-1 text-xs bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-sm font-medium"
                    >
                      {getGenreName(genreId)}
                    </span>
                  ))
                : story.tags?.map(tag => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 text-xs bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <span className={`px-3 py-1.5 text-xs font-medium rounded-sm ${
              ratingColors[story.rating] || ratingColors['PG']
            }`}>
              {story.rating}
            </span>
            <span className="text-xs text-warm-500 dark:text-warm-400 uppercase tracking-wide">
              {story.chapters?.length || 0} chapters
            </span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={storyPath}
      className="block bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 hover:border-warm-400 dark:hover:border-warm-600 transition-all hover:shadow-soft-lg overflow-hidden group h-full"
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 flex items-start gap-2">
            <h2 className="text-base font-medium text-warm-900 dark:text-warm-50 line-clamp-2 flex-1 group-hover:opacity-80 transition-opacity tracking-tight">{story.title}</h2>
            {bookmark && (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-warm-600 dark:text-warm-400 flex-shrink-0 mt-0.5" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} title={`Last read: Chapter ${bookmark.chapterNum}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
          </div>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ml-2 flex-shrink-0 ${
            ratingColors[story.rating] || ratingColors['PG']
          }`}>
            {story.rating}
          </span>
        </div>
        <p className="text-xs text-warm-600 dark:text-warm-400 mb-2">by {story.author}</p>
        <p className="text-warm-700 dark:text-warm-300 text-sm mb-3 line-clamp-3 leading-relaxed flex-1">{story.summary}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(story.genres && story.genres.length > 0
            ? story.genres.slice(0, 3).map(genreId => (
                <span
                  key={genreId}
                  className="px-2.5 py-1 text-xs bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-sm font-medium"
                >
                  {getGenreName(genreId)}
                </span>
              ))
            : story.tags?.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-sm font-medium"
                >
                  {tag}
                </span>
              )))}
          {((story.genres && story.genres.length > 3) || (story.tags && story.tags.length > 3)) && (
            <span className="px-2.5 py-1 text-xs text-warm-500 dark:text-warm-400">
              +{story.genres ? story.genres.length - 3 : story.tags.length - 3}
            </span>
          )}
        </div>
        <p className="text-xs text-warm-500 dark:text-warm-400 uppercase tracking-wide">
          {story.chapters?.length || 0} chapters
        </p>
      </div>
    </Link>
  )
}

export default StoryCard
