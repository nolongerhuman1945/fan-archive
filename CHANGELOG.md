# Changelog

All notable changes to the Fanfic Archive project.

## Phase 4 - Documentation & Cleanup (Current)

### Added
- Comprehensive README.md with full feature documentation
- KNOWN_ISSUES.md documenting browser extension console errors
- CHANGELOG.md (this file)

### Updated
- `.gitignore` to exclude internal documentation files:
  - `plan.md` - Internal planning document
  - `issues.md` - Internal issue tracking
  - `/icons/` - Unused root-level icons folder (icons are React components)
  - `/site-icon.png` - Duplicate root-level icon (using public/site-icon.png)

### Notes
- `plan.md` is already tracked in git. To remove it from tracking while keeping it locally, run: `git rm --cached plan.md`
- Browser extension console errors (jQuery CSP, message channel) are documented but not bugs in the application

---

## Phase 3 - Feature Enhancements

### Added
- **Story Management**: Full CRUD operations for stories
  - Create new stories
  - Edit story details (title, author, summary, rating, tags)
  - Delete stories (with confirmation)
  
- **Chapter Management**: Full CRUD operations for chapters
  - Add chapters to existing stories
  - Edit chapter content and titles
  - Delete chapters (with automatic renumbering)
  - Smart chapter numbering display
  
- **Drag & Drop Upload**: 
  - Upload markdown files by dragging and dropping
  - Automatic title extraction from frontmatter, H1 headers, or filenames
  - Multiple file support
  
- **Admin Utilities**:
  - Tag capitalization tool for all stories
  - Admin page at `/admin`

### Updated
- `UploadStory` component to support existing stories
- Chapter numbering to show correct numbers when adding to existing stories
- All uploads now automatically capitalize tags

---

## Previous Phases

### Phase 1 & 2
- Bug fixes for grid/list icons
- UI/UX improvements
- Site logo integration
- Search and filter enhancements
