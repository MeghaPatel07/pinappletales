/**
 * The Firebase SDK, for the admin only.
 *
 * Nothing under src/pages or src/components may import this module. Keeping it
 * inside the lazily-loaded admin tree is what stops ~130 KB of SDK from landing
 * in the bundle every visitor downloads — public pages read Firestore over its
 * REST API instead (see lib/firestore/rest.ts).
 */

import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

/** False when .env has not been filled in — the login screen explains this. */
export const isFirebaseConfigured = Boolean(config.apiKey && config.appId)

/** Reused across hot reloads; initializeApp twice would throw. */
function app(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(config)
}

export const auth = (): Auth => getAuth(app())
export const db = (): Firestore => getFirestore(app())
