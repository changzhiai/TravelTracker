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
