import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

const AUTH_STORAGE_KEY = 'authToken'
const AUTH_TOKEN_VALUE = 'authenticated'

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check sessionStorage on mount
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === AUTH_TOKEN_VALUE
  })

  useEffect(() => {
    // Sync state with sessionStorage changes (e.g., from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === AUTH_STORAGE_KEY) {
        setIsAuthenticated(e.newValue === AUTH_TOKEN_VALUE)
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const login = (username, password) => {
    // Hardcoded credentials as specified
    if (username === '12345' && password === 'qwerty') {
      sessionStorage.setItem(AUTH_STORAGE_KEY, AUTH_TOKEN_VALUE)
      setIsAuthenticated(true)
      return { success: true }
    }
    return { success: false, error: 'Invalid username or password' }
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
