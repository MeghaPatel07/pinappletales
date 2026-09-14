/**
 * Admin session state.
 *
 * Being signed in is not the same as being an admin: Firebase Auth proves who
 * you are, and a document under `admins/{uid}` is what grants access. The same
 * pair is enforced server-side by firestore.rules, so this check is for the UI,
 * not the security boundary.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from '@/lib/firebase/client'
import { setUploadTokenProvider } from '@/lib/cloudinary'
import { COLLECTIONS } from '@/types/content'

export type AdminSession = {
  uid: string
  email: string
  name: string
}

type AuthState = {
  /** Null once resolved and nobody is signed in. */
  session: AdminSession | null
  /** True until the first auth state callback lands — render nothing before. */
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  configured: boolean
}

const AuthContext = createContext<AuthState | null>(null)

/** Message shown when credentials are valid but the account is not an admin. */
const NOT_AN_ADMIN =
  'That account does not have admin access. Ask an existing admin to add you.'

function messageForAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? ''

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/invalid-email':
      return 'That does not look like a valid email address.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a minute and try again.'
    case 'auth/network-request-failed':
      return 'Could not reach the server. Check your connection.'
    default:
      return (error as Error)?.message ?? 'Sign in failed. Please try again.'
  }
}

export class AuthError extends Error { }

/** Reads the allow-list entry. Absent document means "not an admin". */
async function loadAdmin(user: User): Promise<AdminSession | null> {
  const snapshot = await getDoc(doc(db(), COLLECTIONS.admins, user.uid))
  console.log(snapshot)
  if (!snapshot.exists()) return null

  const data = snapshot.data() as { name?: string; email?: string }
  return {
    uid: user.uid,
    email: user.email ?? data.email ?? '',
    name: data.name || (user.email ?? '').split('@')[0] || 'Admin',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth(), async (user) => {
      if (!user) {
        setSession(null)
        setLoading(false)
        return
      }

      try {
        const admin = await loadAdmin(user)
        if (admin) {
          setSession(admin)
        } else {
          // Authenticated but not authorised — don't leave a half-session open.
          setSession(null)
          await firebaseSignOut(auth())
        }
      } catch (error) {
        console.error('[admin] could not verify admin access:', error)
        setSession(null)
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  // Lets the signed-upload path attach a fresh ID token to signature requests.
  // getIdToken() refreshes automatically when the current one has expired.
  useEffect(() => {
    if (!isFirebaseConfigured) return

    setUploadTokenProvider(async () => {
      const user = auth().currentUser
      return user ? user.getIdToken() : null
    })

    return () => setUploadTokenProvider(null)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      throw new AuthError(
        'Firebase is not configured. Add VITE_FIREBASE_API_KEY and VITE_FIREBASE_APP_ID to .env, then restart the dev server.',
      )
    }

    let credential
    try {
      // Survives a page reload and a closed tab; the admin should not have to
      // sign in again mid-edit.
      await setPersistence(auth(), browserLocalPersistence)
      credential = await signInWithEmailAndPassword(auth(), email.trim(), password)
    } catch (error) {
      throw new AuthError(messageForAuthError(error))
    }

    const admin = await loadAdmin(credential.user).catch(() => null)
    console.log(admin)
    if (!admin) {
      await firebaseSignOut(auth())
      throw new AuthError(NOT_AN_ADMIN)
    }

    setSession(admin)
  }, [])

  const signOut = useCallback(async () => {
    if (isFirebaseConfigured) await firebaseSignOut(auth())
    setSession(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({ session, loading, signIn, signOut, configured: isFirebaseConfigured }),
    [session, loading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.')
  }
  return context
}
