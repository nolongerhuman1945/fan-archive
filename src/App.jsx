import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { SearchProvider } from './contexts/SearchContext'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout'
import NotificationContainer from './components/Notification'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import StoryPage from './pages/StoryPage'
import ChapterPage from './pages/ChapterPage'
import EditStoryPage from './pages/EditStoryPage'
import EditChapterPage from './pages/EditChapterPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import UploadStory from './components/UploadStory'

// Get base path from Vite environment (removes trailing slash for Router basename)
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SearchProvider>
          <NotificationProvider>
            <Router basename={basePath || "/fan-archive"}>
              <NotificationContainer />
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/*"
                  element={
                    <Layout>
                      <Routes>
                      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                      <Route path="/story/:slug" element={<ProtectedRoute><StoryPage /></ProtectedRoute>} />
                      <Route path="/story/:slug/chapter/:chapterNum" element={<ProtectedRoute><ChapterPage /></ProtectedRoute>} />
                      <Route path="/edit-story/:slug" element={<ProtectedRoute><EditStoryPage /></ProtectedRoute>} />
                      <Route path="/edit-chapter/:slug/:chapterNum" element={<ProtectedRoute><EditChapterPage /></ProtectedRoute>} />
                      <Route path="/upload" element={<ProtectedRoute><UploadStory /></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                    </Routes>
                    </Layout>
                  }
                />
              </Routes>
            </Router>
          </NotificationProvider>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
