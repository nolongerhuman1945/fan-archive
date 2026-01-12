# How to Deploy the Backend (Simple Guide)

Your backend server needs to be online for the download feature to work on your deployed site.

## Option 1: Render (Easiest - Free)

1. Go to https://render.com and sign up (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect the `render.yaml` file
5. Click "Create Web Service"
6. Wait for it to deploy (takes 2-3 minutes)
7. Copy the URL it gives you (looks like `https://fan-archive-backend.onrender.com`)
8. Go to your GitHub repo → Settings → Secrets → Actions
9. Add a new secret:
   - Name: `VITE_API_BASE_URL`
   - Value: The URL from step 7 (e.g., `https://fan-archive-backend.onrender.com`)
10. Push any change to trigger a new frontend deployment

That's it! The backend will now work.

## Option 2: Railway (Also Free)

1. Go to https://railway.app and sign up
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect it's a Node.js app
5. Add environment variable: `ALLOWED_ORIGINS` = `https://nolongerhuman1945.github.io,http://localhost:3000,http://localhost:5173`
6. Deploy
7. Copy the URL Railway gives you
8. Follow steps 8-10 from Option 1 above

## After Deployment

Once your backend is deployed:
- The download feature will work on your live site
- You can test it by visiting your GitHub Pages site and trying to download a story
