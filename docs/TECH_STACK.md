# Tech Stack - Travel Tracker

This document outlines the technologies, frameworks, and libraries used to build the Travel Tracker application.

## 🚀 Overview

Travel Tracker is a cross-platform application (Web, Android, and iOS) designed to help users document and visualize their travels. It uses a modern JavaScript/TypeScript stack for efficient development and high performance.

## 💻 Frontend

The frontend is built as a single-page application (SPA) using React and Vite, with a focus on high-quality visualizations and a responsive design.

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [PostCSS](https://postcss.org/)
- **Visualization**:
  - [D3.js 7](https://d3js.org/) (Data-driven documents for maps and charts)
  - [TopoJSON Client](https://github.com/topojson/topojson-client) (Manipulation of TopoJSON data)
  - [Turf.js 7](https://turfjs.org/) (Advanced geospatial analysis)
- **Utilities**:
  - [jsPDF](https://github.com/parallax/jsPDF) (Client-side PDF generation)
  - [JSZip](https://stuk.github.io/jszip/) (Client-side ZIP creation)
  - [React QR Code](https://github.com/rosskhanas/react-qr-code) (QR code generation)

## 🛠 Backend

The backend is a Node.js-based REST API that manages data persistence, authentication, and communication.

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express 5](https://expressjs.com/)
- **Database**: [SQLite 3](https://sqlite.org/) (via `sqlite3` driver)
- **Authentication**:
  - [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (Password hashing)
  - [UUID](https://github.com/uuidjs/uuid) (Unique ID generation)
  - [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs) & [apple-signin-auth](https://github.com/arian/apple-signin-auth) (Social login validation)
- **Email**: [Nodemailer](https://nodemailer.com/) (For system notifications and password resets)
- **Environment**: [dotenv](https://github.com/motdotla/dotenv) (Configuration management)

## 📱 Mobile

The mobile application is built using Capacitor, allowing for a shared codebase across Web, Android, and iOS.

- **Platform**: [Capacitor 8](https://capacitorjs.com/)
- **Plugins**:
  - `@capacitor/android` & `@capacitor/ios` (Platform support)
  - `@capgo/capacitor-social-login` (Native social login integration)
  - `@capacitor/keyboard`, `@capacitor/screen-orientation`, `@capacitor/status-bar` (Native UI control)

## 🏗 Infrastructure & DevOps

- **Version Control**: [Git](https://git-scm.com/)
- **Deployment**: [AWS](https://aws.amazon.com/) (EC2 for backend), [GitHub Pages](https://pages.github.com/) (Web frontend host)
- **Static Analysis**: [ESLint 9](https://eslint.org/)
- **Containerization**: [Dockerfile](https://www.docker.com/) (Infrastructure as Code support)
