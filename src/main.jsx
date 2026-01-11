import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Handle GitHub Pages 404 redirect before React Router initializes
// This fixes Issue #2: URL appends '/index.html#' on refresh
if (window.location.pathname.includes('/index.html')) {
  const urlParams = new URLSearchParams(window.location.search)
  const redirectPath = urlParams.get('redirect')
  
  if (redirectPath) {
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '') || '/fan-archive'
    const newPath = basePath + redirectPath
    const newSearch = urlParams.toString().replace(/redirect=[^&]*&?/, '').replace(/&$/, '')
    const newUrl = newPath + (newSearch ? '?' + newSearch : '') + window.location.hash
    
    // Replace the URL without reloading - React Router will handle the routing
    window.history.replaceState({}, '', newUrl)
  } else {
    // If we're on index.html but no redirect, just remove index.html from path
    const basePath = import.meta.env.BASE_URL.replace(/\/$/, '') || '/fan-archive'
    const newPath = basePath + '/'
    const newUrl = newPath + window.location.search + window.location.hash
    window.history.replaceState({}, '', newUrl)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
