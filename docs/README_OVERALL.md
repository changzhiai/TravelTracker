# Travel Tracker
[![Live Website](https://img.shields.io/badge/Live-Website-brightgreen)](https://changzhiai.github.io/TravelTracker)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An interactive world map application built with React, TypeScript, and D3.js for tracking visited countries, US states, European countries, Chinese provinces, Indian states, and US national parks.

## 🎯 Live Maps

**👉 [View Live Application](https://changzhiai.github.io/TravelTracker)**

The application is automatically deployed via GitHub Actions on every push to the `main` branch.

Or you can check the dynamic version on: https://travel-tracker.org/

## 📸 Screenshots

### Map Views

<div align="center">

#### 🌍 World Map
![World Map](./figures/World.png)

#### 🇺🇸 USA Map
![USA Map](./figures/USA.png)

#### 🇪🇺 Europe Map
![Europe Map](./figures/Europe.png)

#### 🇨🇳 China Map
![China Map](./figures/China.png)

#### 🇮🇳 India Map
![India Map](./figures/India.png)

#### 🏞️ US National Parks Map
![US National Parks Map](./figures/US_NPs.png)

</div>



## Features

- 🌍 **World Map View** - Track countries you've visited (~177 countries)
- 🇺🇸 **USA Map View** - Track US states you've visited (50 states)
- 🏞️ **US National Parks View** - Explore and track 63 US national parks
- 🇪🇺 **Europe Map View** - Track European countries you've visited
- 🇨🇳 **China Map View** - Track Chinese provinces you've visited
- 🇮🇳 **India Map View** - Track Indian states and union territories (36 total)
- 🎯 **Interactive Selection** - Click on map or list to select locations
- 🔍 **Search Functionality** - Quickly find countries/states/provinces
- 🏷️ **Labels** - Show labels for selected locations
- 🔍 **Zoom & Pan** - Interactive map navigation with smooth controls
- 💾 **Export** - Save high-quality PNG images (3x resolution)
- 📊 **Statistics** - View count and percentage of visited locations
- 📱 **Responsive Design** - Works beautifully on desktop and mobile
- 🎨 **Modern UI** - Glassmorphism design with gradient effects

## � Languages

### 1. Frontend (Web App)
- **TypeScript** (`.tsx`, `.ts`): This is the main language we are writing in. It's just "JavaScript with Superpowers" (types) that makes it safer and easier to spot bugs.
- **HTML & CSS**: For structure and styling (via Tailwind).

### 2. Backend (Server)
- **JavaScript** (`.js`): Our Node.js server (`server/server.js`) and database logic are written in standard JavaScript.

### 3. Mobile (Native Wrappers)
*Note: We don't usually edit these files directly, but they exist in the project.*
- **iOS**: Swift and Objective-C (inside the `ios/` folder).
- **Android**: Java and Kotlin (inside the `android/` folder).

### 4. Configuration
- **Groovy**: Used for Android build scripts (`build.gradle`).

## �🛠️ Tech Stack

### Frontend (Web)
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Maps & Visualization**:
  - [D3.js](https://d3js.org/) (Data-Driven Documents)
  - [TopJSON Client](https://github.com/topojson/topojson-client)
  - [Turf.js](https://turfjs.org/) (Geospatial analysis)
- **Export**: [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)

### Backend (API & Database)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Server Framework**: [Express.js](https://expressjs.com/)
- **Database**: [SQLite3](https://www.sqlite.org/) (Lightweight, file-based relational DB)
- **Authentication**: `bcryptjs` (Password hashing)
- **Email**: [Nodemailer](https://nodemailer.com/) (Password reset & notifications)

### Mobile (iOS & Android)
- **Framework**: [Capacitor](https://capacitorjs.com/) (Cross-platform native runtime)
- **Plugins**:
  - `@capacitor/status-bar`: Native status bar control
  - `@capacitor/keyboard`: Native keyboard handling
  - `@capacitor/screen-orientation`: Screen orientation management
  - `@capacitor/splash-screen`: Launch screen management

### Tools & DevOps
- **Linting**: ESLint
- **Version Control**: Git & GitHub
- **Deployment**: GitHub Pages (Frontend), AWS EC2 (Backend)

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

### Mobile Build (iOS/Android)

To build the app for mobile devices (iOS/Android), use:

```bash
npm run build:mobile
npx cap sync
```

See the [Mobile Guide](./MOBILE_GUIDE.md) for detailed instructions on running in Xcode and Android Studio, and the [Authentication Guide](./AUTH_CONFIG.md) for setting up Google and Apple login.

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


## ⚠️ Data Accuracy Note

Some data may not be completely accurate. For example: there are generally recognized to be **195 countries** in the world (193 UN member states + 2 observer states), but this application includes **~176 countries/territories** based on the Natural Earth dataset used. The map data is sourced from publicly available GeoJSON/TopoJSON datasets, and the exact count may vary depending on the data source and how territories are classified. This is common across different mapping applications and datasets.


## 📧 Contact

For questions, suggestions, or feedback, please contact: **changzhiai@gmail.com**
