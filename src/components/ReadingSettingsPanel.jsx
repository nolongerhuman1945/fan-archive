import { useState, useEffect } from 'react'
import { getReadingSettings, saveReadingSettings, getReadingStyles } from '../utils/readingSettings'

function ReadingSettingsPanel({ onSettingsChange }) {
  const [settings, setSettings] = useState(getReadingSettings())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const savedSettings = getReadingSettings()
    setSettings(savedSettings)
    if (onSettingsChange) {
      onSettingsChange(getReadingStyles(savedSettings))
    }
  }, [])

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveReadingSettings(newSettings)
    if (onSettingsChange) {
      onSettingsChange(getReadingStyles(newSettings))
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-warm-600 dark:text-warm-400 hover:text-warm-900 dark:hover:text-warm-100 hover:bg-warm-100 dark:hover:bg-warm-800 rounded transition-colors"
        title="Reading settings"
        aria-label="Toggle reading settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-md shadow-lg p-4 z-20 min-w-[280px]">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-warm-700 dark:text-warm-300 mb-1.5">
                  Font Family
                </label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
                >
                  <option value="sans-serif">Sans-serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-700 dark:text-warm-300 mb-1.5">
                  Font Size
                </label>
                <select
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="extra-large">Extra Large</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-700 dark:text-warm-300 mb-1.5">
                  Background
                </label>
                <select
                  value={settings.backgroundColor}
                  onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
                >
                  <option value="transparent">Transparent</option>
                  <option value="white">White</option>
                  <option value="light">Light Gray</option>
                  <option value="sepia">Sepia</option>
                  <option value="dark">Dark</option>
                  <option value="black">Black</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-warm-700 dark:text-warm-300 mb-1.5">
                  Text Color
                </label>
                <select
                  value={settings.fontColor}
                  onChange={(e) => handleSettingChange('fontColor', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-sm border border-warm-300 dark:border-warm-700 rounded-md bg-white dark:bg-warm-900 text-warm-900 dark:text-warm-100 focus:outline-none focus:ring-1 focus:ring-warm-400 dark:focus:ring-warm-600"
                >
                  <option value="inherit">Inherit</option>
                  <option value="black">Black</option>
                  <option value="dark-gray">Dark Gray</option>
                  <option value="gray">Gray</option>
                  <option value="white">White</option>
                  <option value="sepia">Sepia</option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ReadingSettingsPanel
