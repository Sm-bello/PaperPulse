import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  type User,
  type Auth
} from "firebase/auth";
import type { UserProfile } from "../types";

// Firebase Configuration from environment or defaults
// The user can connect their project via .env or Vercel Environment Variables
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
 * Sign in with Google (supports popup with mobile fallback)
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  if (!auth || !googleProvider) {
    // Development fallback mock user if no Firebase credentials provided yet
    const demoUser: UserProfile = {
      uid: "demo-aerospace-user",
      email: "bellosani2drescue@gmail.com",
      displayName: "Mohammed Bello Sani",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    };
    localStorage.setItem("paperpulse_user", JSON.stringify(demoUser));
    return demoUser;
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
    localStorage.setItem("paperpulse_user", JSON.stringify(profile));
    return profile;
  } catch (error: any) {
    // If popup is blocked on mobile, try redirect or fallback
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr) {
        console.error("Redirect auth error:", redirectErr);
      }
    }
    
    // Graceful offline/local fallback
    console.warn("Using offline user session:", error.message);
    const cached = localStorage.getItem("paperpulse_user");
    if (cached) return JSON.parse(cached);

    const fallbackUser: UserProfile = {
      uid: "user-" + Date.now(),
      email: "bellosani2drescue@gmail.com",
      displayName: "Mohammed Bello Sani",
      photoURL: null,
    };
    localStorage.setItem("paperpulse_user", JSON.stringify(fallbackUser));
    return fallbackUser;
  }
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
  localStorage.removeItem("paperpulse_user");
}

/**
 * Listen to auth state
 */
export function subscribeToAuth(callback: (user: UserProfile | null) => void) {
  // Check localStorage first for immediate UI responsiveness
  const saved = localStorage.getItem("paperpulse_user");
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
      localStorage.setItem("paperpulse_user", JSON.stringify(profile));
      callback(profile);
    } else {
      if (!saved) {
        callback(null);
      }
    }
  });
}
