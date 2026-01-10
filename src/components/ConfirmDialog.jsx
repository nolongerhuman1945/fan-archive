function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-warm-800 rounded-md border border-warm-200 dark:border-warm-700 p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-warm-900 dark:text-warm-50 mb-2">
          {title}
        </h3>
        <p className="text-sm text-warm-600 dark:text-warm-400 mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-warm-100 dark:bg-warm-700 text-warm-700 dark:text-warm-300 rounded-md hover:bg-warm-200 dark:hover:bg-warm-600 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              danger
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-warm-900 dark:bg-warm-100 text-warm-50 dark:text-warm-900 hover:opacity-80'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
