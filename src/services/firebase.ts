import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  type User,
  type Auth
} from "firebase/auth";
import type { UserProfile } from "../types";

// Firebase Configuration from environment or defaults
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoDummyKeyForDevelopmentMode00",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "paperpulse-auth.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "paperpulse-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "paperpulse-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcdef123456",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (err) {
  console.warn("Firebase initialization notice:", err);
}

export { auth, googleProvider };

/**
 * Sign in with Google (triggers native Firebase popup if configured)
 */
export async function signInWithFirebaseGoogle(): Promise<UserProfile | null> {
  if (!auth || !googleProvider) {
    return null;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split("@")[0] || "Researcher",
      photoURL: user.photoURL,
    };
    saveUserSession(profile);
    return profile;
  } catch (error: any) {
    console.warn("Firebase popup closed or unauthorized domain:", error.message);
    return null;
  }
}

export function saveUserSession(user: UserProfile): void {
  try {
    localStorage.setItem("theschola_user", JSON.stringify(user));
    localStorage.setItem("paperpulse_user", JSON.stringify(user));
  } catch {}
}

/**
 * Sign out user
 */
export async function logOut(): Promise<void> {
  if (auth) {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Sign out err:", e);
    }
  }
  localStorage.removeItem("theschola_user");
  localStorage.removeItem("paperpulse_user");
}

/**
 * Listen to auth state
 */
export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  // Check localStorage first for immediate UI responsiveness
  const saved = localStorage.getItem("theschola_user") || localStorage.getItem("paperpulse_user");
  if (saved) {
    try {
      callback(JSON.parse(saved));
    } catch {}
  }

  if (!auth) {
    return () => {};
  }

  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0] || "Researcher",
        photoURL: user.photoURL,
      };
      saveUserSession(profile);
      callback(profile);
    } else {
      if (!saved) {
        callback(null);
      }
    }
  });
}
