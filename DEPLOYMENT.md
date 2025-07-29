# Deployment Guide

This guide covers deploying the Crypto Fundamentals Dashboard to Vercel and Render.

## Prerequisites

- Node.js 18+ installed locally
- Git repository with your code
- Dune Analytics API key

## Environment Variables

The following environment variables are required:

- `REACT_APP_DUNE_API_KEY`: Your Dune Analytics API key

## Option 1: Deploy to Vercel (Recommended)

### Step 1: Prepare Your Repository

1. Make sure all changes are committed to Git
2. Push your code to GitHub/GitLab/Bitbucket

### Step 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? crypto-dashboard (or your preferred name)
# - Directory? ./
# - Override settings? No
```

### Step 3: Set Environment Variables

1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to Settings → Environment Variables
3. Add: `REACT_APP_DUNE_API_KEY` with your API key value
4. Redeploy for changes to take effect

### Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Create React App
   - Root Directory: ./
   - Build Command: `npm run build` (default)
   - Output Directory: `build` (default)
5. Add environment variables before deploying
6. Click "Deploy"

## Option 2: Deploy to Render

### Using Docker (Recommended)

1. Push your code to GitHub
2. Go to [render.com](https://render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: crypto-dashboard
   - Runtime: Docker
   - Branch: main (or your default branch)
   - Root Directory: leave blank
6. Add environment variables:
   - Key: `REACT_APP_DUNE_API_KEY`
   - Value: Your Dune API key
7. Click "Create Web Service"

### Using Static Site

1. In Render dashboard, choose "New" → "Static Site"
2. Connect your repository
3. Configure:
   - Name: crypto-dashboard-static
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. Add environment variables
5. Add redirect rule for React Router:
   - Source: /*
   - Destination: /index.html
   - Type: Rewrite

## Post-Deployment Steps

### 1. Test Your Deployment
- Visit your deployed URL
- Check all pages load correctly
- Verify API data is loading
- Test navigation between pages

### 2. Custom Domain (Optional)
Both Vercel and Render support custom domains:
- Vercel: Settings → Domains
- Render: Settings → Custom Domains

### 3. Monitor Performance
- Check build logs for any warnings
- Monitor API rate limits
- Set up error tracking (optional)

## Local Testing Before Deployment

```bash
# Test production build locally
npm run build
npx serve -s build

# Test with production environment variables
REACT_APP_DUNE_API_KEY=your_key npm run build
```

## Troubleshooting

### Build Failures
- Check Node version compatibility (18+)
- Verify all dependencies are in package.json
- Check for case-sensitive file imports

### API Issues
- Verify environment variables are set correctly
- Check API key validity
- Monitor rate limits

### Routing Issues
- Ensure vercel.json or render.yaml redirect rules are configured
- Test deep links after deployment

## Security Notes

- Never commit `.env` files to Git
- Rotate API keys regularly
- Use environment-specific keys for production
- Consider implementing a backend proxy for API calls in the future