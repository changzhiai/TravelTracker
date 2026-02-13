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

## Backend & Authentication Configuration (Crucial!)

Before running the app on a device, you must configure the backend URL and authentication providers (Google/Apple). See the [Authentication Guide](AUTH_CONFIG.md) for detailed setup instructions.

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
    npm run build:mobile
    npx cap sync
    ```

## Development Workflow

When you make changes to your React code:
1.  **Build** the web app for mobile:
    ```bash
    npm run build:mobile
    ```
    *Note: This script sets `VITE_APP_TARGET=mobile` to ensure assets use relative paths (`./`) which is required for Capacitor apps to load correctly on devices.*

2.  **Sync** the changes to the native projects:
    ```bash
    npx cap sync
    ```
3.  Re-run from Xcode/Android Studio.

*Note: You can also use "Live Reload" for development. See [Capacitor Live Reload](https://capacitorjs.com/docs/guides/live-reload) documentation.*

## Mobile Features & Native Plugins

This app uses several native Capacitor plugins to enhance the user experience on mobile devices:

### Fullscreen Experience
- **Native Fullscreen**: The app implements a custom fullscreen behavior on iOS and Android to avoid system overlay messages (e.g., "Press ESC to exit").
- **Status Bar**: The system status bar is automatically hidden when entering fullscreen mode for a more immersive experience.
- **Orientation**: 
  - The app automatically detects screen rotation.
  - If you rotate your device to portrait mode while in fullscreen, the app will automatically exit fullscreen mode to maintain usability.

### plugins Used
- `@capacitor/status-bar`: Controls the visibility of the system status bar.
- `@capacitor/screen-orientation`: Handles screen orientation changes and locking (if needed).
- `@capacitor/app`: Handles app state (background/foreground).


## Deploy to App Store / Play Store

### Android (Generating a Signed APK/Bundle)

1.  **Open Android Studio**:
    ```bash
    npx cap open android
    ```
2.  **Generate Signed Bundle**:
    *   Go to **Build** > **Generate Signed Bundle / APK**.
    *   Choose **Android App Bundle** (for Play Store) or **APK** (for manual install/testing).
    *   Click **Next**.
3.  **Create Keystore** (if you don't have one):
    *   Click **Create new...** under "Key store path".
    *   Choose a safe location and set a password.
    *   Fill in the "Key" alias, password, and validity (e.g., 25 years).
    *   Fill in at least one certificate field (e.g., First and Last Name).
    *   Click **OK**.
4.  **Finish Build**:
    *   Select your new key alias.
    *   Click **Next**.
    *   Select **release**.
    *   Click **Create**.
5.  **Locate File**:
    *   Once done, a popup will appear. Click **locate** to find your `.aab` or `.apk` file.
    *   Upload the `.aab` to the Google Play Console for release.

### iOS (distributing via App Store / TestFlight)

1.  **Prerequisites**:
    *   An active [Apple Developer Program](https://developer.apple.com/programs/) enrollment ($99/year).
    *   A registered App ID in the Apple Developer Console (Xcode can often handle this automatically).

2.  **Prepare Assets**:
    *   Ensure your `resources` folder has your icon and splash screen source images.
    *   Generate the iOS assets:
        ```bash
        npx capacitor-assets generate --ios
        ```

3.  **Open Xcode**:
    ```bash
    npx cap open ios
    ```

4.  **Configure Project Settings**:
    *   In the project navigator (left sidebar), click on "App".
    *   Select the **App** target in the main view.
    *   Go to the **General** tab.
        *   **Identity**: Update the **Version** (e.g., `1.0.0`) and **Build** number (e.g., `1`).  *Note: Build number must be incremented for every upload.*
    *   Go to the **Signing & Capabilities** tab.
        *   **Team**: Select your Apple Developer Team. If none appears, add your account in Xcode Preferences > Accounts.
        *   **Bundle Identifier**: Ensure this matches what you intend to use on the App Store (e.g., `com.yourname.traveltracker`).

5.  **Archive the Build**:
    *   Select "Any iOS Device (arm64)" from the device selector at the top (do not select a simulator).
    *   Go to **Product** > **Archive** in the menu bar.
    *   Wait for the build to complete. The "Organizer" window will open automatically.

6.  **Upload to App Store Connect**:
    *   In the Organizer window, select your verified archive.
    *   Click **Distribute App**.
    *   Select **App Store Connect** (for TestFlight or Production).
    *   Follow the prompts using the default settings for "Upload".
    *   Once uploaded, you can manage the build (add testers, submit for review) at [appstoreconnect.apple.com](https://appstoreconnect.apple.com).

## Free Alternatives (Avoiding the $99/Year Fee)

If the Apple Developer Program fee is a barrier, consider these alternatives:

### 1. Progressive Web App (PWA) - **Highly Recommended**
Since you built this with web technologies, you can distribute it as a website that users can "install" to their home screen. It mimics a native app almost perfectly.

*   **Pros**: Completely free, instant updates (no app store review), works on iOS and Android.
*   **Cons**: Not listed in the App Store; Push notifications on iOS require iOS 16.4+.
*   **How to Deploy**:
    1.  Deploy your `dist` folder to a hosting provider like **Netlify**, **Vercel**, or **GitHub Pages**.
    2.  Instruct iOS users to:
        *   Open your website in **Safari**.
        *   Tap the **Share** button (box with arrow).
        *   Scroll down and tap **Add to Home Screen**.

### 2. Personal "Sideloading" (For your own device)
You can install the app on your own iPhone using a free Apple ID.

*   **Pros**: Runs as a real native app with full native capabilities.
*   **Cons**: The app **expires every 7 days**. You must reconnect your phone to your computer and re-run from Xcode to renew the certificate. You cannot send this to other people easily.
*   **Steps**:
    1.  In Xcode, go to **Signing & Capabilities**.
    2.  Add your personal Apple ID (Xcode > Preferences > Accounts).
    3.  Select your personal "Personal Team" in the **Team** dropdown.
    4.  Connect your iPhone via USB.
    5.  Run the app.
    6.  On your iPhone, you may need to go to **Settings > General > VPN & Device Management** to trust your own developer certificate.


