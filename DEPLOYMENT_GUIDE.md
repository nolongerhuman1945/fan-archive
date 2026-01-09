# Deployment Guide - Fanfic Archive

This guide will walk you through previewing your site locally and deploying it to GitHub Pages.

## Part 1: Preview the Site Locally

### Step 1: Start the Development Server

Open your terminal in the project directory and run:

```bash
npm run dev
```

This will start a development server (usually at `http://localhost:3000`). The browser should open automatically. You can:
- Test all features
- See changes in real-time as you edit files
- Check if everything works correctly

**To stop the server:** Press `Ctrl + C` in the terminal.

### Step 2: Preview Production Build (Optional but Recommended)

This simulates how the site will work on GitHub Pages:

```bash
# Build the production version
npm run build

# Preview the production build
npm run preview
```

This will show you the site exactly as it will appear on GitHub Pages. Test navigation, routing, and all features.

**Note:** The preview server might use a different port (check the terminal output).

---

## Part 2: Transfer Project to GitHub

### Step 1: Initialize Git (if not already done)

```bash
# Check if git is already initialized
git status

# If you get an error, initialize git:
git init
```

### Step 2: Create .gitignore (Already Done)

The `.gitignore` file is already set up to exclude:
- `node_modules/`
- `dist/`
- `.env` (your GitHub token - important for security!)

### Step 3: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository settings:
   - **Name:** `fan-archive` (must match exactly for GitHub Pages)
   - **Description:** (optional) "Fanfiction Archive Site"
   - **Visibility:** Public (required for free GitHub Pages)
   - **DO NOT** check "Initialize with README" (you already have files)
4. Click **"Create repository"**

### Step 4: Connect Local Project to GitHub

After creating the repo, GitHub will show you commands. Use these:

```bash
# Add all files to git
git add .

# Create first commit
git commit -m "Initial commit: Fanfic archive site"

# Add GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/fan-archive.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**If you get authentication errors:**
- Use a Personal Access Token instead of password
- Or use GitHub CLI: `gh auth login`

---

## Part 3: Set Up GitHub Pages

### Step 1: Configure GitHub Pages Settings

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/fan-archive`
2. Click **"Settings"** tab (top menu)
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**:
   - Select: **"Deploy from a branch"**
   - Branch: **"main"**
   - Folder: **"/ (root)"** or **"/dist"** (see Step 2 below)
   - Click **"Save"**

### Step 2: Configure Build Output Location

You have two options:

#### Option A: Deploy from `/dist` folder (Recommended)

1. In GitHub Pages settings, set folder to **"/dist"**
2. Update `vite.config.js` to output to `dist` (already done)
3. After pushing, GitHub Pages will serve from the `dist` folder

#### Option B: Deploy from root (Alternative)

1. In GitHub Pages settings, set folder to **"/ (root)"**
2. Update `vite.config.js`:
   ```js
   build: {
     outDir: 'docs'  // Change from 'dist' to 'docs'
   }
   ```
3. Rebuild and push

**I recommend Option A** - keep using `dist` folder.

### Step 3: Push Your Code

Make sure you've built the production version:

```bash
# Build for production
npm run build

# Add the dist folder to git (if using Option A)
# Note: Usually dist is in .gitignore, but for GitHub Pages you might need it
# Actually, better to use GitHub Actions (see Step 4)
```

### Step 4: Set Up GitHub Actions for Auto-Deploy (Recommended)

This automatically builds and deploys when you push code:

1. Create `.github/workflows/deploy.yml` in your project:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. Update GitHub Pages settings:
   - Go to Settings → Pages
   - Source: Change to **"GitHub Actions"** (instead of "Deploy from a branch")
   - Save

3. Commit and push:

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment"
git push
```

### Step 5: Access Your Site

After deployment (takes 1-2 minutes), your site will be available at:

```
https://YOUR_USERNAME.github.io/fan-archive/
```

**Important:** The first deployment might take a few minutes. Check the "Actions" tab in your GitHub repo to see the deployment progress.

---

## Part 4: Set Up GitHub Token for Upload Feature

The upload feature requires a GitHub Personal Access Token:

### Step 1: Create GitHub Personal Access Token

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click **"Generate new token (classic)"**
3. Settings:
   - **Note:** "Fan Archive Upload"
   - **Expiration:** Choose your preference (90 days, 1 year, or no expiration)
   - **Scopes:** Check **"repo"** (gives full repository access)
4. Click **"Generate token"**
5. **IMPORTANT:** Copy the token immediately (you won't see it again!)

### Step 2: Add Token to Your Project

1. Create a `.env` file in the project root (same folder as `package.json`)
2. Add this line:

```
VITE_GITHUB_TOKEN=your_token_here
```

Replace `your_token_here` with the token you copied.

3. **Never commit this file!** (It's already in `.gitignore`)

### Step 3: For GitHub Pages (Production)

Since `.env` files don't work on GitHub Pages, you need to add the token as a GitHub Secret:

1. Go to your repo → Settings → Secrets and variables → Actions
2. Click **"New repository secret"**
3. Name: `VITE_GITHUB_TOKEN`
4. Value: Paste your token
5. Click **"Add secret"**

6. Update `.github/workflows/deploy.yml` to include the secret in the build step:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_GITHUB_TOKEN: ${{ secrets.VITE_GITHUB_TOKEN }}
```

**Note:** For client-side GitHub API calls, you might need to use a different approach since environment variables in GitHub Actions won't be available in the browser. Consider using GitHub's API from a serverless function or accepting that the token will be visible in the built JavaScript (which is a security risk for public repos).

**Alternative:** For a truly secure solution, consider:
- Using GitHub OAuth for user authentication
- Creating a serverless function (Vercel, Netlify Functions) to handle uploads
- Using GitHub's API with a server-side proxy

---

## Troubleshooting

### Site shows 404 or blank page
- Check that the base path in `vite.config.js` matches your repo name: `/fan-archive/`
- Verify GitHub Pages is set to deploy from the correct folder
- Check browser console for errors

### Routing doesn't work
- Make sure `public/404.html` exists (already created)
- Verify React Router basename is set to `/fan-archive`

### Upload feature doesn't work
- Check that `VITE_GITHUB_TOKEN` is set in `.env` (for local dev)
- For production, the token needs to be accessible client-side (see security note above)
- Check browser console for errors

### Build fails
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (should be 18+)
- Review error messages in terminal

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Git
git add .               # Stage all changes
git commit -m "message" # Commit changes
git push                # Push to GitHub

# Full workflow
npm run build && git add . && git commit -m "Update site" && git push
```

---

## Next Steps After Deployment

1. Test all features on the live site
2. Share your site URL: `https://YOUR_USERNAME.github.io/fan-archive/`
3. Monitor the "Actions" tab for deployment status
4. Update content by editing files and pushing to GitHub

Good luck with your deployment! 🚀
