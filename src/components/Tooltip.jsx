import { useState, useRef, useEffect } from 'react'

function Tooltip({ children, text, position = 'top', className = '' }) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef(null)
  const wrapperRef = useRef(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isVisible && tooltipRef.current && wrapperRef.current) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const scrollX = window.scrollX || window.pageXOffset
      const scrollY = window.scrollY || window.pageYOffset

      let top = 0
      let left = 0

      switch (position) {
        case 'top':
          top = wrapperRect.top + scrollY - tooltipRect.height - 8
          left = wrapperRect.left + scrollX + (wrapperRect.width / 2) - (tooltipRect.width / 2)
          break
        case 'bottom':
          top = wrapperRect.bottom + scrollY + 8
          left = wrapperRect.left + scrollX + (wrapperRect.width / 2) - (tooltipRect.width / 2)
          break
        case 'left':
          top = wrapperRect.top + scrollY + (wrapperRect.height / 2) - (tooltipRect.height / 2)
          left = wrapperRect.left + scrollX - tooltipRect.width - 8
          break
        case 'right':
          top = wrapperRect.top + scrollY + (wrapperRect.height / 2) - (tooltipRect.height / 2)
          left = wrapperRect.right + scrollX + 8
          break
        default:
          top = wrapperRect.top + scrollY - tooltipRect.height - 8
          left = wrapperRect.left + scrollX + (wrapperRect.width / 2) - (tooltipRect.width / 2)
      }

      // Ensure tooltip stays within viewport
      const padding = 8
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      if (left < padding) {
        left = padding
      } else if (left + tooltipRect.width > viewportWidth - padding) {
        left = viewportWidth - tooltipRect.width - padding
      }

      if (top < scrollY + padding) {
        top = scrollY + padding
      } else if (top + tooltipRect.height > scrollY + viewportHeight - padding) {
        top = scrollY + viewportHeight - tooltipRect.height - padding
      }

      setTooltipPosition({ top, left })
    }
  }, [isVisible, position])

  return (
    <>
      <div
        ref={wrapperRef}
        className={`relative inline-block ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[9999] px-3 py-1.5 text-xs font-medium text-warm-50 dark:text-warm-900 bg-warm-900 dark:bg-warm-100 rounded-md shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`
          }}
        >
          {text}
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-warm-900 dark:bg-warm-100 transform rotate-45 ${
              position === 'top'
                ? 'bottom-[-4px] left-1/2 -translate-x-1/2'
                : position === 'bottom'
                ? 'top-[-4px] left-1/2 -translate-x-1/2'
                : position === 'left'
                ? 'right-[-4px] top-1/2 -translate-y-1/2'
                : 'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </>
  )
}

export default Tooltip
