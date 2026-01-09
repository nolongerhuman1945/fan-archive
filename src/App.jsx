import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { SearchProvider } from './contexts/SearchContext'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import StoryPage from './pages/StoryPage'
import ChapterPage from './pages/ChapterPage'
import UploadStory from './components/UploadStory'

function App() {
  return (
    <ThemeProvider>
      <SearchProvider>
        <Router basename="/fan-archive">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/story/:slug" element={<StoryPage />} />
              <Route path="/story/:slug/chapter/:chapterNum" element={<ChapterPage />} />
              <Route path="/upload" element={<UploadStory />} />
            </Routes>
          </Layout>
        </Router>
      </SearchProvider>
    </ThemeProvider>
  )
}

export default App
