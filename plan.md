# Fanfic Archive - Implementation Plan

## Issues to Address

### 1. Icon Display Issues
**Problem**: Icons (SVG) not showing in Brave browser but work in Cursor AI browser
**Issue Details**:
- Browser: Brave
- No console errors reported
- SVGs work in Cursor AI browser

**Possible Causes**:
- Browser compatibility with inline SVG rendering
- Missing SVG attributes (viewBox, fill, stroke)
- CSS conflicts preventing SVG display
- Brave's privacy/ad-blocking features interfering

**Solution**:
- Audit all SVG icons for proper attributes
- Ensure viewBox is set correctly
- Add explicit fill="currentColor" and stroke="currentColor" attributes
- Add explicit width/height attributes
- Test specifically in Brave browser
- Check for Brave's shield/ad-blocker interference
- Consider adding xmlns="http://www.w3.org/2000/svg" if missing

---

### 2. Reading Progress Bar - Too Intrusive
**Current State**: Prominent progress bar in sticky header
**Issue**: Gets in the way of reading experience

**Solution**:
- Make progress bar thinner (1px or 2px max)
- Reduce opacity when not actively scrolling
- Position it as a subtle top border or bottom border of sticky header
- Consider auto-hide behavior (show on scroll, fade after 2-3 seconds)
- Use more subtle color (current warm-900 may be too prominent)
- Optional: Move to bottom of viewport as a thin line

---

### 3. Whitespace & Visual Interest
**Current State**: Too barebones, excessive whitespace
**Issue**: Site feels empty and lacks visual engagement

**Solutions**:
- Reduce padding/margins across components (compact but readable)
- Add subtle background patterns/textures (optional)
- Enhance story cards with hover effects and visual depth
- Add cover image placeholders or gradient backgrounds
- Implement subtle animations/transitions
- Add visual indicators (read/unread status, favorites)
- Consider adding story thumbnails/cover art support
- Better use of typography hierarchy and spacing

---

### 4. Dark Mode - Background Color
**Current State**: Brownish warm tones in dark mode
**Issue**: Doesn't match Letterboxd aesthetic

**Solution**:
- Update dark mode background to exact Letterboxd color: **#14191A**
- Light mode: Off-white/cream (#fafafa or similar)
- Update Tailwind color palette to use this color
- Ensure text contrast meets WCAG standards
- Test readability in both modes

**Letterboxd Color Scheme** (confirmed):
- Dark BG: **#14191A** (verified with color picker)
- Light BG: #fafafa (off-white)
- Accent: Subtle blue/green tints
- Text: High contrast (white on dark, near-black on light)

---

### 5. Search Bar Location
**Current State**: Below page title on homepage
**Issue**: Should be in header for global access

**Solution**:
- Move search input to header/navbar
- Make it persistent across all pages
- Responsive: Full width on mobile, compact in header on desktop
- Consider collapsible/expandable search on mobile
- Add search icon for better UX
- Keep tag filters on homepage but make search always accessible

---

### 6. GitHub Integration - Upload & Commit Feature
**Requirements**:
- Allow users to upload markdown files
- Auto-generate metadata.json if not provided
- Commit files directly to GitHub repo
- Support GitHub Pages deployment workflow

**Technical Considerations**:
- **Approach**: Client-side only GitHub API integration
- Use GitHub REST API with Personal Access Token
- Token will be stored in environment variable or config (user aware of security implications)
- Direct commits to main branch (no PR workflow)

**Implementation**:
- Frontend: Upload form with metadata fields
- GitHub API Client: @octokit/rest
- Direct commit via GitHub API from client-side
- GitHub Pages: Auto-deploy on commit
- **Repository Info**:
  - Repo: `fan-archive`
  - Username: `nolongerhuman1945`
  - Token: Provided (to be stored in .env or config file)

**Form Fields Needed**:
- Story title (required)
- Author name (required)
- Summary/description (required)
- Rating (dropdown: G, PG, PG-13, R, M)
- Tags (multi-select or comma-separated)
- Chapter title(s) (required)
- Markdown content (textarea or file upload, required)
- Story slug (auto-generated from title, editable)

**Access Control**:
- Public uploads (anyone can submit)
- Direct commit to main branch (no approval needed)

**File Structure to Generate**:
```
public/stories/{slug}/
  - metadata.json
  - chapter-1.md
  - chapter-2.md (if multiple)
```

**Update Requirements**:
- Update `stories-index.json` with new story
- Create folder structure
- Commit all changes
- Trigger GitHub Pages rebuild

---

### 7. GitHub Pages Deployment Considerations

**Current Setup**:
- Static site built with Vite
- React Router (client-side routing)

**GitHub Pages Challenges**:
- Client-side routing requires 404.html fallback
- Base path configuration needed
- Build output location: `/docs` or root (user preference: doesn't matter)

**Actions Required**:
- Configure Vite base path for GitHub Pages (repo name: `fan-archive`)
- Set up 404.html for React Router
- Update all internal links to use base path
- Test deployment locally with base path
- Create GitHub Actions workflow for auto-deploy (optional, can be manual)
- Configure GitHub Pages (user preference: doesn't care)

---

### 8. UI/UX Streamlining

**General Improvements**:
- Simplify navigation structure
- Reduce visual clutter
- Improve information hierarchy
- Better mobile responsiveness
- Faster load times
- Clearer CTAs (Call to Actions)
- Better error states and loading indicators

**Specific Changes**:
- Consolidate header: Logo, Search, Theme Toggle, Upload (if authenticated)
- Streamlined story cards: Essential info only, expand on hover/click
- Better chapter navigation: Sticky prev/next buttons while reading
- Improved reading experience: Better font sizing, line height, column width
- Add keyboard shortcuts (arrow keys for prev/next chapter)

---

## Implementation Priority

### Phase 1: Critical Fixes (Before Deployment)
1. Fix icon display issues
2. Adjust dark mode colors (Letterboxd-accurate)
3. Make progress bar less intrusive
4. Move search to header
5. GitHub Pages deployment configuration

### Phase 2: UX Improvements
1. Compact whitespace / visual enhancements
2. UI streamlining
3. Better responsive design
4. Performance optimizations

### Phase 3: Advanced Features
1. GitHub integration (upload/commit)
2. User authentication (if needed for uploads)
3. Story thumbnails/covers
4. Advanced filtering and sorting
5. Reading history/bookmarks (localStorage)

---

## Decisions Made (Answered)

1. **GitHub Integration**: ✅ Client-side only (token in frontend, user aware of security)
2. **Upload Access**: ✅ Public (anyone can upload)
3. **Commit Method**: ✅ Direct commit to main branch (no PR)
4. **Icon Issues**: ✅ Brave browser, no console errors
5. **Dark Mode Color**: ✅ #14191A (Letterboxd verified)
6. **Deployment**: ✅ User preference: doesn't care

## Remaining Questions (If Needed)

1. **Upload Feature Scope**:
   - Single chapter or multiple chapters per upload?
   - Edit existing stories or only create new ones?
   - Validation requirements (min/max length, required fields)?

2. **Content Management**:
   - Will you manually manage stories or rely on upload feature?
   - Need admin panel for managing/editing/deleting stories?
   - Should there be limits on upload size/number of chapters?

---

## Technical Stack Additions (If Needed)

### For GitHub Integration:
- **Frontend Only**: Client-side GitHub API calls
- **GitHub API Client**: @octokit/rest (browser-compatible)
- **File Handling**: FormData or direct text input
- **Token Storage**: Environment variable (.env) or config file
- **Repository**: `nolongerhuman1945/fan-archive`

### For Deployment:
- **GitHub Actions**: Workflow for auto-build and deploy
- **Base Path Config**: vite.config.js adjustments

---

## Next Steps

1. **Get Answers**: Clarify questions above
2. **Research**: Inspect Letterboxd actual colors and design patterns
3. **Audit**: Review current codebase for icon issues
4. **Design**: Create detailed mockups for streamlined UI
5. **Implement**: Phase 1 fixes first, then Phase 2, then Phase 3

---

## Notes

- **Security**: Personal Access Token will be in frontend code (user aware and accepts this)
- **GitHub Pages**: Base path must be set correctly for React Router (repo name: `fan-archive`)
- **Performance**: Consider lazy loading for images and chapters
- **Accessibility**: Ensure all changes maintain WCAG compliance
- **Brave Browser**: Special attention needed for SVG icon rendering issues
- **Dark Mode**: Exact color #14191A must be used for authentic Letterboxd feel