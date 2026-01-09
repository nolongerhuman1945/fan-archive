# Fanfic Archive

A static fanfiction archive website built with Vite, React, and Tailwind CSS. Stories are stored as markdown files with metadata, making it easy to add new content without code changes.

## Features

- 📚 **Browse Stories**: Grid and list view modes for browsing all stories
- 🔍 **Search & Filter**: Search by title, author, or summary; filter by tags
- 📖 **Chapter Reader**: Full markdown rendering with GitHub Flavored Markdown support
- 📱 **Responsive Design**: Mobile-first design that works on all devices
- 🌓 **Dark Mode**: Toggle between light and dark themes (saves preference)
- 📊 **Reading Progress**: Visual progress indicator and automatic scroll position saving
- 🎨 **Beautiful UI**: Modern, clean interface with smooth transitions

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **react-markdown** - Markdown rendering
- **remark-gfm** - GitHub Flavored Markdown support

## Project Structure

```
archive-site/
├── public/
│   ├── stories/
│   │   ├── story-slug/
│   │   │   ├── metadata.json
│   │   │   ├── chapter-1.md
│   │   │   ├── chapter-2.md
│   │   │   └── ...
│   └── stories-index.json
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── ThemeToggle.jsx
│   │   ├── StoryCard.jsx
│   │   └── SearchFilter.jsx
│   ├── contexts/
│   │   └── ThemeContext.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── StoryPage.jsx
│   │   └── ChapterPage.jsx
│   ├── utils/
│   │   └── storyLoader.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Adding Stories

### 1. Create Story Folder

Create a new folder in `public/stories/` with a URL-friendly slug name:

```
public/stories/my-awesome-story/
```

### 2. Add Metadata

Create `metadata.json` in the story folder:

```json
{
  "title": "My Awesome Story",
  "author": "Author Name",
  "summary": "A brief summary of the story...",
  "rating": "PG-13",
  "tags": ["Fantasy", "Adventure", "Romance"],
  "chapters": [
    { "title": "Chapter One" },
    { "title": "Chapter Two" },
    { "title": "Chapter Three" }
  ]
}
```

**Rating Options**: `G`, `PG`, `PG-13`, `R`, `M`

### 3. Add Chapters

Create markdown files for each chapter:

- `chapter-1.md`
- `chapter-2.md`
- `chapter-3.md`
- etc.

Chapters support full Markdown syntax including:
- Headings
- Paragraphs
- Lists (ordered and unordered)
- Links
- Code blocks
- Blockquotes
- And more via GitHub Flavored Markdown

### 4. Update Index

Add the story to `public/stories-index.json`:

```json
{
  "stories": [
    {
      "slug": "my-awesome-story",
      "title": "My Awesome Story",
      "author": "Author Name",
      "summary": "A brief summary...",
      "rating": "PG-13",
      "tags": ["Fantasy", "Adventure", "Romance"]
    }
  ]
}
```

The slug must match the folder name, and the chapters array length should match the number of chapter files.

## Features in Detail

### Reading Progress

Reading progress is automatically saved to localStorage. When you return to a chapter, it will scroll to your last reading position.

### Dark Mode

Theme preference is saved to localStorage and persists across sessions. The default theme matches your system preference.

### Search & Filter

- **Search**: Searches across title, author, and summary
- **Filter**: Click tags to filter stories. Multiple tags can be selected (stories must match all selected tags)
- **View Modes**: Toggle between grid and list views

## License

MIT
