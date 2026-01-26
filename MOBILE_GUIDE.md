# Mobile App Setup Guide (Capacitor)

This project has been configured with [Capacitor](https://capacitorjs.com/) to package your web application as a native iOS and Android app.

## Prerequisites

1.  **Node.js** (you already have this)
2.  **Xcode** (for iOS) - Install from the Mac App Store.
3.  **Android Studio** (for Android) - Download from developer.android.com.

## How to Run

### iOS
1.  Run the following command to open the project in Xcode:
    ```bash
    npx cap open ios
    ```
2.  In Xcode, select your target device (Simulators or a real connected iPhone).
3.  Click the **Play** button (Run).

### Android
1.  Run the following command to open the project in Android Studio:
    ```bash
    npx cap open android
    ```
2.  Wait for Gradle sync to finish.
3.  Select a virtual device (emulator) or a connected phone.
4.  Click the **Run** button (green play icon).

## Backend Configuration (Crucial!)

Your application relies on a backend server (`server/server.js`). 
- **In a web browser**, the app can connect to `http://localhost:3001` easily.
- **On a mobile phone**, `localhost` refers to the phone itself, not your computer.

For the app to work properly on a device:
1.  **Deploy your backend** to a public URL (e.g., AWS EC2, Heroku, Vercel, etc.).
2.  Create a `.env` file (or `.env.production`) in the root of your project:
    ```env
    VITE_API_URL=https://your-public-api-domain.com
    ```
3.  Rebuild and sync the app:
    ```bash
    npm run build
    npx cap sync
    ```

## Development Workflow

When you make changes to your React code:
1.  **Build** the web app:
    ```bash
    npm run build
    ```
2.  **Sync** the changes to the native projects:
    ```bash
    npx cap sync
    ```
3.  Re-run from Xcode/Android Studio.

*Note: You can also use "Live Reload" for development. See [Capacitor Live Reload](https://capacitorjs.com/docs/guides/live-reload) documentation.*
