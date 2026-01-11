const READING_SETTINGS_STORAGE_KEY = 'readingSettings'

const DEFAULT_SETTINGS = {
  fontFamily: 'sans-serif',
  fontSize: 'medium',
  backgroundColor: 'transparent',
  fontColor: 'inherit'
}

/**
 * Get reading settings from localStorage
 * @returns {Object} Reading settings object
 */
export function getReadingSettings() {
  try {
    const settings = localStorage.getItem(READING_SETTINGS_STORAGE_KEY)
    return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS
  } catch (error) {
    console.error('Error reading settings:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * Save reading settings to localStorage
 * @param {Object} settings - Settings object to save
 */
export function saveReadingSettings(settings) {
  try {
    localStorage.setItem(READING_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

/**
 * Get CSS styles object from settings
 * @param {Object} settings - Settings object
 * @returns {Object} CSS style object
 */
export function getReadingStyles(settings) {
  const fontFamilies = {
    'sans-serif': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    'serif': 'Georgia, "Times New Roman", Times, serif',
    'monospace': '"Courier New", Courier, monospace'
  }

  const fontSizes = {
    'small': '0.875rem',
    'medium': '1rem',
    'large': '1.125rem',
    'extra-large': '1.25rem'
  }

  const backgroundColors = {
    'transparent': 'transparent',
    'light': '#fafafa',
    'sepia': '#f4f1e8',
    'dark': '#1a1a1a',
    'white': '#ffffff',
    'black': '#000000'
  }

  const fontColors = {
    'inherit': 'inherit',
    'black': '#000000',
    'dark-gray': '#333333',
    'gray': '#666666',
    'white': '#ffffff',
    'sepia': '#5c4b37'
  }

  return {
    fontFamily: fontFamilies[settings.fontFamily] || fontFamilies['sans-serif'],
    fontSize: fontSizes[settings.fontSize] || fontSizes['medium'],
    backgroundColor: backgroundColors[settings.backgroundColor] || backgroundColors['transparent'],
    color: fontColors[settings.fontColor] || fontColors['inherit']
  }
}
