import { Link } from 'react-router-dom'

function StoryCard({ story, viewMode }) {
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
        to={`/story/${story.slug}`}
        className="block p-6 bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 hover:border-warm-400 dark:hover:border-warm-600 transition-all hover:shadow-soft-lg group"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-medium mb-2 text-warm-900 dark:text-warm-50 group-hover:opacity-80 transition-opacity tracking-tight">{story.title}</h2>
            <p className="text-sm text-warm-600 dark:text-warm-400 mb-2">by {story.author}</p>
            <p className="text-warm-700 dark:text-warm-300 mb-3 line-clamp-2 leading-relaxed text-sm">{story.summary}</p>
            <div className="flex flex-wrap gap-2">
              {story.tags?.map(tag => (
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
      to={`/story/${story.slug}`}
      className="block bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 hover:border-warm-400 dark:hover:border-warm-600 transition-all hover:shadow-soft-lg overflow-hidden group h-full"
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-base font-medium text-warm-900 dark:text-warm-50 line-clamp-2 flex-1 group-hover:opacity-80 transition-opacity tracking-tight">{story.title}</h2>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ml-2 flex-shrink-0 ${
            ratingColors[story.rating] || ratingColors['PG']
          }`}>
            {story.rating}
          </span>
        </div>
        <p className="text-xs text-warm-600 dark:text-warm-400 mb-2">by {story.author}</p>
        <p className="text-warm-700 dark:text-warm-300 text-sm mb-3 line-clamp-3 leading-relaxed flex-1">{story.summary}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {story.tags?.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-sm font-medium"
            >
              {tag}
            </span>
          ))}
          {story.tags?.length > 3 && (
            <span className="px-2.5 py-1 text-xs text-warm-500 dark:text-warm-400">+{story.tags.length - 3}</span>
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
