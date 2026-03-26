# Authentication Configuration Guide

This guide explains how to set up and configure **Google** and **Apple** account logins for the Travel Tracker application.

## 1. Google Login Configuration

Google login is implemented using OAuth 2.0.

### Prerequisites
- A Google Cloud account.
- Access to the [Google Cloud Console](https://console.cloud.google.com/).

### Setup Steps
1.  **Create a Project**:
    - Go to the [Google Cloud Console](https://console.cloud.google.com/).
    - Create a new project or select an existing one.
2.  **Configure OAuth Consent Screen**:
    - Navigate to **APIs & Services** > **OAuth consent screen**.
    - Select **External** and fill in the required app information.
    - Add the `.../auth/userinfo.email` and `.../auth/userinfo.profile` scopes.
3.  **Create Credentials**:
    - Navigate to **APIs & Services** > **Credentials**.
    - Click **Create Credentials** > **OAuth client ID**.
    - Select **Web application** as the application type.
4.  **Authorized Origins & Redirects**:
    - **Authorized JavaScript origins**:
        - `http://localhost:5173` (for local development)
        - `https://your-domain.com` (for production)
    - **Authorized redirect URIs**:
        - Generally handled by the library, but you can add your production domain if required.
5.  **Environment Variables**:
    - Copy the **Client ID**.
    - Update your root `.env` file: `VITE_GOOGLE_CLIENT_ID=your-client-id`.
    - Update your `server/.env` file: `GOOGLE_CLIENT_ID=your-client-id`.

## 2. Troubleshooting Release Issues

### Google Sign-In Fails in Release Build
If Google Sign-In works in your simulator but fails after releasing the app, it is likely due to a **SHA-1 Fingerprint Mismatch**.

1.  **Release SHA-1**: Get the SHA-1 of your production keystore:
    ```bash
    keytool -list -v -keystore /path/to/your/release-key.jks -alias your_alias_name
    ```
2.  **Google Play SHA-1**: If you are using "Google Play App Signing" (recommended), you must also add the SHA-1 provided by Google. Go to the **Google Play Console** > **Setup** > **App Integrity** and copy the **SHA-1 certificate fingerprint** from the "App signing certificate" section.
3.  **Update Google Cloud Console**:
    *   Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   Navigate to **APIs & Services** > **Credentials**.
    *   Find the **OAuth 2.0 Client ID** that corresponds to your Android app (or create a new one).
    *   Add **both** SHA-1 fingerprints (Release and Play Store) to the allowed certificate fingerprints.
4.  **Support Email**: Ensure a "Support email" is configured in the **OAuth consent screen** settings. Google Sign-In will fail if this is empty.
5.  **OAuth Consent Screen**: Ensure your project is set to **"Production"** status (not "Testing"), or ensure your production users are added as test users.


---

## 2. Apple Login Configuration

Apple login is implemented via Sign In with Apple (JS).

### Prerequisites
- An active [Apple Developer Program](https://developer.apple.com/programs/) enrollment ($99/year).
- Access to the [Apple Developer Portal](https://developer.apple.com/account/).

### Setup Steps
1.  **Create an App ID**:
    - Go to **Certificates, Identifiers & Profiles** > **Identifiers**.
    - Click **(+)** and select **App IDs**.
    - Select **App**, give it a description and a unique **Bundle ID** (e.g., `com.yourname.traveltracker`).
    - Enable the **Sign In with Apple** capability.
2.  **Create a Service ID**:
    - Go to **Identifiers** and click **(+)**.
    - Select **Services IDs**.
    - Provide a description and an **Identifier** (this will be your `VITE_APPLE_CLIENT_ID`, e.g., `com.yourname.traveltracker.sid`).
3.  **Configure the Service ID**:
    - Select your new Service ID and click **Configure** next to Sign In with Apple.
    - **Primary App ID**: Select the App ID created in Step 1.
    - **Domains and Subdomains**: Enter your domain (e.g., `travel-tracker.org`). *Note: Do not include `https://` here.*
    - **Return URLs**: Enter your full callback URL (e.g., `https://travel-tracker.org/api/apple-callback`). *Note: Apple requires `https`.*
4.  **Domain Verification**:
    - Download the verification file provided by Apple.
    - Upload it to your server at: `https://your-domain.com/.well-known/apple-developer-domain-association.txt`.
5.  **Environment Variables**:
    - Update your root `.env` file:
        - `VITE_APPLE_CLIENT_ID=your-service-identifier`
        - `VITE_APPLE_REDIRECT_URI=https://your-domain.com/api/apple-callback`
    - Update your `server/.env` file:
        - `APPLE_CLIENT_ID=your-service-identifier`

### Testing Locally
Apple Sign In does **not** allow `http://localhost`. To test locally:
1.  Use a tool like **ngrok** to create an `https` tunnel to your local machine (`http://localhost:5173`).
2.  Add the ngrok URL (e.g., `https://random-id.ngrok-free.app`) to your Service ID's **Domains** and **Return URLs** in the Apple Developer Portal.
