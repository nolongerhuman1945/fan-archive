import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { SearchProvider } from './contexts/SearchContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import StoryPage from './pages/StoryPage'
import ChapterPage from './pages/ChapterPage'
import EditStoryPage from './pages/EditStoryPage'
import EditChapterPage from './pages/EditChapterPage'
import AdminPage from './pages/AdminPage'
import UploadStory from './components/UploadStory'

// Get base path from Vite environment (removes trailing slash for Router basename)
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <Router basename={basePath || "/fan-archive"}>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/story/:slug" element={<StoryPage />} />
              <Route path="/story/:slug/chapter/:chapterNum" element={<ChapterPage />} />
              <Route path="/edit-story/:slug" element={<EditStoryPage />} />
              <Route path="/edit-chapter/:slug/:chapterNum" element={<EditChapterPage />} />
              <Route path="/upload" element={<UploadStory />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Layout>
        </Router>
      </SearchProvider>
    </ThemeProvider>
  )
}

export default App
