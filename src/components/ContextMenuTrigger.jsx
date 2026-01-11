import { useState, useRef } from 'react'
import ContextMenu from './ContextMenu'
import MoreIcon from './icons/MoreIcon'

function ContextMenuTrigger({ items, children, className = '' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showMoreIcon, setShowMoreIcon] = useState(false)
  const triggerRef = useRef(null)

  const handleRightClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(true)
  }

  const handleMouseEnter = () => {
    setShowMoreIcon(true)
  }

  const handleMouseLeave = () => {
    setShowMoreIcon(false)
  }

  const handleMoreIconClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(true)
  }

  const handleClose = () => {
    setIsMenuOpen(false)
  }

  return (
    <div
      ref={triggerRef}
      className={`relative ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleRightClick}
    >
      {children}
      {showMoreIcon && items && items.length > 0 && (
        <button
          onClick={handleMoreIconClick}
          className="absolute top-1 right-1 p-1 bg-white/90 dark:bg-warm-800/90 backdrop-blur-sm rounded-md border border-warm-200 dark:border-warm-700 text-warm-700 dark:text-warm-300 hover:bg-warm-50 dark:hover:bg-warm-700 transition-colors z-10"
          aria-label="More options"
        >
          <MoreIcon className="w-4 h-4" />
        </button>
      )}
      {isMenuOpen && (
        <ContextMenu
          items={items}
          position={{ top: 0, left: 0 }}
          onClose={handleClose}
          triggerElement={triggerRef.current}
        />
      )}
    </div>
  )
}

export default ContextMenuTrigger
