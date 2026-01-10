# Fanfic Archive

A modern, full-featured fanfiction archive website built with Vite, React, and Tailwind CSS. Features GitHub integration for seamless content management, allowing you to create, edit, and manage stories directly through the web interface.

## ✨ Features

### 📚 Content Management
- **Browse Stories**: Grid and list view modes for browsing all stories
- **Story Management**: Full CRUD operations - Create, Read, Update, Delete stories
- **Chapter Management**: Add, edit, delete, and reorder chapters
- **Drag & Drop Upload**: Upload markdown files by dragging and dropping
- **Smart File Parsing**: Automatically extracts chapter titles from markdown files (frontmatter, H1 headers, or filenames)

### 🔍 Discovery & Reading
- **Search & Filter**: Search by title, author, or summary; filter by tags
- **Chapter Reader**: Full markdown rendering with GitHub Flavored Markdown support
- **Reading Progress**: Visual progress indicator and automatic scroll position saving
- **Chapter Navigation**: Easy navigation between chapters with previous/next buttons

### 🎨 User Experience
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode**: Toggle between light and dark themes (preference saved)
- **Modern UI**: Clean interface with smooth transitions and intuitive controls
- **Confirmation Dialogs**: Safety checks for destructive operations

### 🔧 Admin Features
- **GitHub Integration**: Direct GitHub API integration for content management
- **Tag Capitalization**: Utility to automatically capitalize all story tags
- **Bulk Operations**: Efficient management of multiple stories and chapters

## 🛠 Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **react-markdown** - Markdown rendering
- **remark-gfm** - GitHub Flavored Markdown support
- **Octokit** - GitHub API client for content management

## 📁 Project Structure

```
archive-site/
├── public/
│   ├── stories/
│   │   ├── story-slug/
│   │   │   ├── metadata.json
│   │   │   ├── chapter-1.md
│   │   │   ├── chapter-2.md
│   │   │   └── ...
│   │   └── ...
│   ├── stories-index.json
│   └── site-icon.png
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── StoryCard.jsx
│   │   ├── SearchFilter.jsx
│   │   ├── UploadStory.jsx
│   │   └── ConfirmDialog.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── StoryPage.jsx
│   │   ├── ChapterPage.jsx
│   │   ├── EditStoryPage.jsx
│   │   ├── EditChapterPage.jsx
│   │   └── AdminPage.jsx
│   ├── contexts/
│   │   ├── ThemeContext.jsx
│   │   └── SearchContext.jsx
│   ├── utils/
│   │   ├── storyLoader.js
│   │   └── githubApi.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A GitHub repository to store your stories
- A GitHub Personal Access Token with repository write permissions

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd archive-site
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```env
VITE_GITHUB_TOKEN=your_github_personal_access_token
```

To create a GitHub token:
- Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token with `repo` scope
- Copy and paste it into your `.env` file

4. Update repository configuration:
Edit `src/utils/githubApi.js` and update:
```javascript
const GITHUB_OWNER = 'your-username'
const GITHUB_REPO = 'your-repo-name'
```

### Development

```bash
npm run dev
```

The site will be available at `http://localhost:5173` (or the port Vite assigns)

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📖 Usage Guide

### Creating a New Story

1. Navigate to the upload page (`/upload`)
2. Fill in story details:
   - **Title** (required): Story title
   - **Author** (required): Author name
   - **Summary** (required): Brief story description
   - **Rating**: G, PG, PG-13, R, or M
   - **Tags**: Comma-separated tags (automatically capitalized)
   - **Slug**: URL-friendly identifier (auto-generated from title)
3. Add chapters:
   - **Option A**: Drag and drop markdown files
   - **Option B**: Manual input with title and content
4. Click "Upload Story"

### Adding Chapters to Existing Story

1. Navigate to the story page
2. Click "Add Chapter" button
3. Add new chapters (same options as creating a story)
4. Chapters will be numbered sequentially

### Editing Story Details

1. Navigate to the story page
2. Click "Edit" button in the header
3. Modify any field (title, author, summary, rating, tags)
4. Note: Slug cannot be changed - delete and recreate if needed
5. Click "Save Changes"

### Editing Chapter Content

1. Navigate to the chapter page
2. Click "Edit" button in the header
3. Modify chapter title or content
4. Click "Save Changes"

### Deleting Stories or Chapters

1. Navigate to the story/chapter page
2. Click "Delete" button
3. Confirm deletion in the dialog
4. **Note**: Deleting a chapter will automatically renumber remaining chapters

### Admin Utilities

Navigate to `/admin` for administrative tools:
- **Tag Capitalization**: Automatically capitalize all tags in existing stories for consistency

## 📝 Story Format

### Metadata File (`metadata.json`)

```json
{
  "title": "Story Title",
  "author": "Author Name",
  "summary": "Story summary here...",
  "rating": "PG-13",
  "tags": ["Fantasy", "Adventure", "Romance"],
  "slug": "story-slug",
  "chapters": [
    {
      "title": "Chapter One",
      "file": "chapter-1.md"
    },
    {
      "title": "Chapter Two",
      "file": "chapter-2.md"
    }
  ]
}
```

**Rating Options**: `G`, `PG`, `PG-13`, `R`, `M`

### Chapter Files

Chapters are stored as markdown files (`chapter-1.md`, `chapter-2.md`, etc.) and support full Markdown syntax including:
- Headings
- Paragraphs
- Lists (ordered and unordered)
- Links
- Code blocks with syntax highlighting
- Blockquotes
- Tables (via GitHub Flavored Markdown)
- And more!

### Drag & Drop Format

When uploading markdown files via drag & drop, the system automatically extracts:
- **Title**: From frontmatter (`title: "..."`), H1 heading (`# Title`), or filename
- **Content**: Full markdown content

Example frontmatter format:
```markdown
---
title: "Chapter Title"
---

Chapter content here...
```

## 🎯 Features in Detail

### Search & Filter
- **Search**: Searches across title, author, and summary (case-insensitive)
- **Filter**: Click tags to filter stories. Multiple tags use AND logic (stories must match all selected tags)
- **View Modes**: Toggle between grid and list views for browsing

### Reading Progress
- Visual progress bar at the top of chapter pages
- Automatic scroll position saving to localStorage
- Restores position when returning to a chapter

### Dark Mode
- Theme preference saved to localStorage
- Persists across sessions
- Defaults to system preference on first visit

### GitHub Integration
- All content operations (create, update, delete) are committed directly to GitHub
- Changes are immediately reflected after successful commits
- Full error handling with user-friendly messages

## 🔐 Security Notes

- Never commit your `.env` file to version control
- Keep your GitHub token secure and rotate it regularly
- The token requires repository write access - use a token with minimal necessary permissions

## 🐛 Known Issues

See [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) for information about console errors from browser extensions and other non-critical issues.

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, feature requests, or questions, please open an issue on the repository.
