# How to Deploy the Backend (Simple Guide)

Your backend server needs to be online for the download feature to work on your deployed site.

## Option 1: Railway (Free Tier - 500 hours/month)

1. Go to https://railway.app and sign up (free with GitHub)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `fan-archive` repository
4. Railway will auto-detect it's a Node.js app
5. Click on your service → "Variables" tab
6. Add environment variable:
   - Key: `ALLOWED_ORIGINS`
   - Value: `https://nolongerhuman1945.github.io,http://localhost:3000,http://localhost:5173`
7. Railway will auto-deploy. Wait 2-3 minutes
8. Click "Settings" → copy the URL (looks like `https://your-app.up.railway.app`)
9. Go to your GitHub repo → Settings → Secrets and variables → Actions
10. Add a new secret:
    - Name: `VITE_API_BASE_URL`
    - Value: The URL from step 8
11. Push any change to trigger a new frontend deployment

**Note:** Railway free tier gives 500 hours/month. If you exceed it, the service pauses but you can restart it.

## Option 2: Fly.io (Free Tier - 3 shared CPU instances)

1. Go to https://fly.io and sign up (free)
2. Install Fly CLI: `npm install -g @fly/cli` or download from fly.io/docs
3. In your project folder, run: `fly launch`
4. Follow the prompts (select your region, app name)
5. Add environment variable: `fly secrets set ALLOWED_ORIGINS="https://nolongerhuman1945.github.io,http://localhost:3000,http://localhost:5173"`
6. Deploy: `fly deploy`
7. Get your URL: `fly status` (looks like `https://your-app.fly.dev`)
8. Follow steps 9-11 from Option 1 above

## Option 3: Cyclic (Free Tier - AWS-based)

1. Go to https://cyclic.sh and sign up (free)
2. Click "Deploy Now" → Connect GitHub
3. Select your repository
4. Cyclic will auto-detect Node.js
5. Add environment variable in dashboard:
   - `ALLOWED_ORIGINS` = `https://nolongerhuman1945.github.io,http://localhost:3000,http://localhost:5173`
6. Wait for deployment (2-3 minutes)
7. Copy the URL from dashboard
8. Follow steps 9-11 from Option 1 above

## After Deployment

Once your backend is deployed:
- The download feature will work on your live site
- You can test it by visiting your GitHub Pages site and trying to download a story
