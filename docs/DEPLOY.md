# Deployment Guide for GitHub Pages

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it `travel-tracker` (or your preferred name)
3. **Don't** initialize with README, .gitignore, or license (we already have these)

## Step 2: Update Configuration

### If your repository name is NOT "travel-tracker":

1. Open `vite.config.ts`
2. Change the `base` path to match your repository name:
   ```typescript
   base: '/YOUR_REPO_NAME/',
   ```

### If deploying to root repository (username.github.io):

1. Open `vite.config.ts`
2. Change the `base` to:
   ```typescript
   base: '/',
   ```

## Step 3: Initialize Git and Push

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Travel Tracker app"

# Add your GitHub repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/travel-tracker.git

# Push to main branch
git branch -M main
git push -u origin main
```

## Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. The workflow will automatically deploy on every push to `main`

## Step 5: Update Homepage URL (Optional)

1. Open `package.json`
2. Update the `homepage` field with your actual GitHub username:
   ```json
   "homepage": "https://YOUR_USERNAME.github.io/travel-tracker"
   ```

## Your App Will Be Live At:

`https://YOUR_USERNAME.github.io/travel-tracker`

(Replace `YOUR_USERNAME` with your GitHub username)

## Troubleshooting

- If assets don't load, check that the `base` path in `vite.config.ts` matches your repository name
- If the page shows 404, wait a few minutes for GitHub Pages to build
- Check the Actions tab in your repository to see deployment status

