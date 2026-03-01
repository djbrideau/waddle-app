# Waddle — Firebase Setup Guide

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add Project** → name it (e.g., `waddle-study`)
3. Disable Google Analytics (optional for dev) → **Create Project**

## 2. Enable Authentication

1. In your project, go to **Build → Authentication → Get started**
2. Click **Sign-in method** tab
3. Enable **Google** provider
4. Set a support email → **Save**

## 3. Create Firestore Database

1. Go to **Build → Firestore Database → Create database**
2. Choose **Start in test mode** (we'll add rules later)
3. Select a region close to your users → **Enable**

## 4. Add a Web App

1. Go to **Project Settings** (gear icon) → **General** → scroll to **Your apps**
2. Click the web icon (`</>`) → Register app name (e.g., `waddle-web`)
3. Copy the Firebase config values

## 5. Configure Environment

1. Copy `.env.example` to `.env` in the project root:
   ```
   cp .env.example .env
   ```
2. Fill in the values from step 4:
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123:web:abc123
   ```

## 6. Deploy Firestore Rules

Copy the rules from `firestore.rules` into **Firestore → Rules** tab in the Firebase Console, then click **Publish**.

## 7. Initialize the Whitelist (Required for Admin/Teacher Features)

In the Firebase Console, go to **Firestore → Data** and manually create:

- Collection: `globalState`
- Document ID: `whitelist`
- Fields:
  - `adminUids` (array): Add your Firebase UID here
  - `teacherDojoAccess` (array): Add teacher UIDs who can create Dojos
  - `verifiedSets` (array): Leave empty initially

**To find your UID:** Log into Waddle, go to Settings — your UID is displayed there.

## 8. Run the App

```bash
cd Waddle.Study
npm install
npm run dev
```

Open http://localhost:8080
