// Reusable skeleton components for loading states

// Basic rectangular skeleton
export function SkeletonBox({ className = '', width = 'w-full', height = 'h-4' }) {
  return (
    <div className={`bg-warm-200 dark:bg-warm-700 rounded-md animate-pulse ${width} ${height} ${className}`} />
  )
}

// Text line skeleton with varying widths
export function SkeletonText({ className = '', width = 'w-full', lines = 1 }) {
  const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-3/4', 'w-2/3', 'w-1/2']
  
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          width={widths[i % widths.length]}
          height="h-4"
          className={i === lines - 1 ? 'w-3/4' : ''}
        />
      ))}
    </div>
  )
}

// Story card skeleton (matches StoryCard layout)
export function SkeletonCard({ viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="p-6 bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1">
            {/* Title */}
            <div className="flex items-start gap-2 mb-2">
              <SkeletonBox width="w-3/4" height="h-6" />
              <SkeletonBox width="w-5" height="h-5" className="rounded-sm" />
            </div>
            {/* Author */}
            <div className="mb-2">
              <SkeletonBox width="w-1/3" height="h-4" />
            </div>
            {/* Summary - 2 lines */}
            <div className="mb-3 space-y-2">
              <SkeletonBox width="w-full" height="h-4" />
              <SkeletonBox width="w-5/6" height="h-4" />
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <SkeletonBox width="w-16" height="h-6" className="rounded-sm" />
              <SkeletonBox width="w-20" height="h-6" className="rounded-sm" />
              <SkeletonBox width="w-14" height="h-6" className="rounded-sm" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            {/* Rating badge */}
            <SkeletonBox width="w-12" height="h-7" className="rounded-sm" />
            {/* Chapter count */}
            <SkeletonBox width="w-20" height="h-4" />
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 overflow-hidden h-full">
      <div className="p-5 flex flex-col h-full space-y-2">
        {/* Title and rating */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 flex items-start gap-2">
            <SkeletonBox width="w-3/4" height="h-5" />
            <SkeletonBox width="w-4" height="h-4" className="rounded-sm" />
          </div>
          <SkeletonBox width="w-10" height="h-5" className="rounded-sm" />
        </div>
        {/* Author */}
        <SkeletonBox width="w-1/2" height="h-3" />
        {/* Summary - 3 lines */}
        <div className="flex-1 space-y-2">
          <SkeletonBox width="w-full" height="h-3" />
          <SkeletonBox width="w-5/6" height="h-3" />
          <SkeletonBox width="w-4/5" height="h-3" />
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <SkeletonBox width="w-14" height="h-5" className="rounded-sm" />
          <SkeletonBox width="w-16" height="h-5" className="rounded-sm" />
          <SkeletonBox width="w-12" height="h-5" className="rounded-sm" />
        </div>
        {/* Chapter count */}
        <SkeletonBox width="w-24" height="h-3" />
      </div>
    </div>
  )
}

// Story metadata skeleton (matches StoryPage layout)
export function SkeletonStoryMetadata() {
  return (
    <div className="bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div className="flex-1 space-y-3">
          {/* Title */}
          <SkeletonBox width="w-3/4" height="h-8 md:h-9" />
          {/* Author */}
          <SkeletonBox width="w-1/4" height="h-5" />
        </div>
        <div className="flex items-center gap-3">
          {/* Rating badge */}
          <SkeletonBox width="w-16" height="h-9" className="rounded-sm" />
          {/* Action buttons */}
          <div className="flex gap-2">
            <SkeletonBox width="w-9" height="h-9" className="rounded-md" />
            <SkeletonBox width="w-9" height="h-9" className="rounded-md" />
          </div>
        </div>
      </div>

      {/* Summary section */}
      <div className="mb-6 space-y-2">
        <SkeletonBox width="w-24" height="h-5" />
        <SkeletonText lines={4} />
      </div>

      {/* Genres/Tags section */}
      <div className="mb-6 space-y-2">
        <SkeletonBox width="w-20" height="h-5" />
        <div className="flex flex-wrap gap-2">
          <SkeletonBox width="w-20" height="h-7" className="rounded-sm" />
          <SkeletonBox width="w-24" height="h-7" className="rounded-sm" />
          <SkeletonBox width="w-18" height="h-7" className="rounded-sm" />
          <SkeletonBox width="w-22" height="h-7" className="rounded-sm" />
        </div>
      </div>

      {/* Chapters section */}
      <div className="pt-6 border-t border-warm-200 dark:border-warm-700">
        <div className="flex items-center justify-between mb-4">
          <SkeletonBox width="w-32" height="h-6" />
          <SkeletonBox width="w-28" height="h-8" className="rounded-md" />
        </div>
        {/* Chapter grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-2.5 bg-warm-50 dark:bg-warm-700 rounded-md border border-warm-200 dark:border-warm-600 space-y-1">
              <SkeletonBox width="w-20" height="h-4" />
              <SkeletonBox width="w-full" height="h-3" />
              <SkeletonBox width="w-4/5" height="h-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Chapter content skeleton (matches ChapterPage layout)
export function SkeletonChapterContent() {
  return (
    <article className="max-w-4xl mx-auto px-4">
      <header className="mb-8 text-center pb-6 border-b border-warm-200 dark:border-warm-700 space-y-3">
        {/* Chapter title */}
        <SkeletonBox width="w-2/3" height="h-8 md:h-9" className="mx-auto" />
        {/* Subtitle */}
        <SkeletonBox width="w-1/2" height="h-5" className="mx-auto" />
      </header>

      {/* Content - multiple lines */}
      <div className="mb-12 space-y-4">
        <SkeletonText lines={12} />
      </div>

      {/* Navigation */}
      <nav className="border-t border-warm-200 dark:border-warm-700 pt-8 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <SkeletonBox width="w-32" height="h-11" className="rounded-md" />
          <SkeletonBox width="w-28" height="h-11" className="rounded-md" />
          <SkeletonBox width="w-32" height="h-11" className="rounded-md" />
        </div>
      </nav>
    </article>
  )
}

// Form skeleton (matches form layouts)
export function SkeletonForm({ showChapters = false }) {
  return (
    <div className="bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 p-6 md:p-8">
      <div className="space-y-6">
        {/* Title field */}
        <div className="space-y-2">
          <SkeletonBox width="w-24" height="h-5" />
          <SkeletonBox width="w-full" height="h-10" className="rounded-md" />
        </div>

        {/* Author field */}
        <div className="space-y-2">
          <SkeletonBox width="w-28" height="h-5" />
          <SkeletonBox width="w-full" height="h-10" className="rounded-md" />
        </div>

        {/* Summary field */}
        <div className="space-y-2">
          <SkeletonBox width="w-20" height="h-5" />
          <SkeletonBox width="w-full" height="h-24" className="rounded-md" />
        </div>

        {/* Rating and Genres */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <SkeletonBox width="w-16" height="h-5" />
            <SkeletonBox width="w-full" height="h-10" className="rounded-md" />
          </div>
          <div className="space-y-2">
            <SkeletonBox width="w-20" height="h-5" />
            <SkeletonBox width="w-full" height="h-10" className="rounded-md" />
          </div>
        </div>

        {/* Slug field */}
        <div className="space-y-2">
          <SkeletonBox width="w-32" height="h-5" />
          <SkeletonBox width="w-full" height="h-10" className="rounded-md" />
        </div>

        {/* Chapters section */}
        {showChapters && (
          <div className="border-t border-warm-200 dark:border-warm-700 pt-6 space-y-6">
            <div className="flex justify-between items-center">
              <SkeletonBox width="w-24" height="h-5" />
              <SkeletonBox width="w-28" height="h-9" className="rounded-md" />
            </div>
            {/* Chapter fields */}
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-4 border border-warm-200 dark:border-warm-700 rounded-md space-y-3">
                <div className="flex justify-between items-center">
                  <SkeletonBox width="w-20" height="h-4" />
                  <SkeletonBox width="w-6" height="h-6" className="rounded-md" />
                </div>
                <div className="space-y-2">
                  <SkeletonBox width="w-28" height="h-4" />
                  <SkeletonBox width="w-full" height="h-10" className="rounded-md" />
                </div>
                <div className="space-y-2">
                  <SkeletonBox width="w-40" height="h-4" />
                  <SkeletonBox width="w-full" height="h-48" className="rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit buttons */}
        <div className="flex gap-4 pt-4 border-t border-warm-200 dark:border-warm-700">
          <SkeletonBox width="w-32" height="h-11" className="rounded-md" />
          <SkeletonBox width="w-24" height="h-11" className="rounded-md" />
        </div>
      </div>
    </div>
  )
}
