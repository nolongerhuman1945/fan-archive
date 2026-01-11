import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

function ContextMenu({ items, position, onClose, triggerElement }) {
  const menuRef = useRef(null)
  const [menuPosition, setMenuPosition] = useState(position)

  useEffect(() => {
    if (!menuRef.current || !triggerElement) return

    const menuRect = menuRef.current.getBoundingClientRect()
    const triggerRect = triggerElement.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const padding = 8

    let top = triggerRect.bottom + padding
    let left = triggerRect.right - menuRect.width

    if (left < padding) {
      left = triggerRect.left
    }
    if (left + menuRect.width > viewportWidth - padding) {
      left = viewportWidth - menuRect.width - padding
    }
    if (top + menuRect.height > viewportHeight - padding) {
      top = triggerRect.top - menuRect.height - padding
    }
    if (top < padding) {
      top = padding
    }

    setMenuPosition({ top, left })
  }, [triggerElement])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          triggerElement && !triggerElement.contains(event.target)) {
        onClose()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose, triggerElement])

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick()
    }
    onClose()
  }

  if (!items || items.length === 0) return null

  const menu = (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-md shadow-lg py-1"
      style={{
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`
      }}
      role="menu"
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => handleItemClick(item)}
          className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
            item.danger
              ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
              : 'text-warm-700 dark:text-warm-300 hover:bg-warm-100 dark:hover:bg-warm-700'
          }`}
          role="menuitem"
        >
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )

  return createPortal(menu, document.body)
}

export default ContextMenu
