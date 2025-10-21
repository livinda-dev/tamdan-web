// src/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Read config from environment variables (Next.js exposes NEXT_PUBLIC_* to the client)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Basic sanity check to help during local setup
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.appId
) {
  if (typeof window !== "undefined") {
    // Client-side warning
    console.warn(
      "Firebase env vars are missing. Please set NEXT_PUBLIC_FIREBASE_* in your .env.local"
    );
  } else {
    // Server-side warning
    // eslint-disable-next-line no-console
    console.warn(
      "Firebase env vars are missing. Please set NEXT_PUBLIC_FIREBASE_* in your .env.local"
    );
  }
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
