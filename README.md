# Travel Tracker

An interactive world map application built with React, TypeScript, and D3.js for tracking visited countries and US states.

## Features

- 🌍 **World Map View** - Track countries you've visited
- 🇺🇸 **USA Map View** - Track US states you've visited
- 🎯 **Interactive Selection** - Click on map or list to select locations
- 🔍 **Search Functionality** - Quickly find countries/states
- 🏷️ **Labels** - Show labels for selected locations
- 🔍 **Zoom & Pan** - Interactive map navigation
- 💾 **Export** - Save high-quality PNG images
- 📊 **Statistics** - View count and percentage of visited locations

## Tech Stack

- React 19
- TypeScript
- D3.js
- Tailwind CSS
- Vite

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Deployment to GitHub Pages

This project is configured for GitHub Pages deployment.

### Automatic Deployment (Recommended)

1. Push your code to a GitHub repository
2. Go to repository Settings → Pages
3. Under "Source", select "GitHub Actions"
4. The workflow will automatically deploy on every push to `main` branch

### Manual Deployment

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Update the `homepage` field in `package.json` with your GitHub username
3. Run: `npm run deploy`

## Live Demo

Visit the deployed app at: `https://YOUR_USERNAME.github.io/travel-tracker`

## License

MIT
