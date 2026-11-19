/**
 * js/firebase-config.js
 * Official Firebase Client SDK Configuration for ClubHub / ClubClash.
 * Project: club-hub-9c2de (https://console.firebase.google.com/project/club-hub-9c2de/)
 * App: ClubHub Web (1:827177564707:web:22cfb774615a6b18c38f96)
 */

const firebaseConfig = {
  apiKey: "AIzaSyCE0zg2--ey-2v6UyF7zjbM9qFZb4DDsak",
  authDomain: "club-hub-9c2de.firebaseapp.com",
  projectId: "club-hub-9c2de",
  storageBucket: "club-hub-9c2de.firebasestorage.app",
  messagingSenderId: "827177564707",
  appId: "1:827177564707:web:22cfb774615a6b18c38f96",
  measurementId: "G-BDHN7YT0J5"
};

// Global Firebase initialization helper
let firebaseApp = null;
let firebaseAuth = null;
let firebaseStorage = null;

function initFirebaseClient() {
  if (typeof firebase !== "undefined" && !firebaseApp) {
    try {
      firebaseApp = firebase.initializeApp(firebaseConfig);
      firebaseAuth = firebase.auth();
      if (firebase.storage) {
        firebaseStorage = firebase.storage();
      }
      console.log("[Firebase] Successfully connected to project: club-hub-9c2de");
    } catch (e) {
      console.warn("[Firebase] Init warning:", e);
    }
  }
}

/**
 * Sign in using Google Provider (Firebase Auth)
 * Authenticates campus students with Google (@tint.edu.in)
 */
async function signInWithFirebaseGoogle() {
  if (!firebaseAuth) {
    initFirebaseClient();
  }
  if (!firebaseAuth) {
    alert("Firebase Auth SDK is initializing. Please verify your connection.");
    return null;
  }

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await firebaseAuth.signInWithPopup(provider);
    const idToken = await result.user.getIdToken();
    const user = result.user;

    console.log("[Firebase Auth] Signed in successfully as:", user.email);

    // Save session locally
    localStorage.setItem("clubhub_firebase_token", idToken);
    localStorage.setItem("clubhub_firebase_user", JSON.stringify({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    }));

    // Optional: Synchronize with FastAPI backend
    try {
      const apiHost = (typeof API !== "undefined" && API.baseUrl) ? API.baseUrl : "http://127.0.0.1:8000";
      const backendSync = await fetch(`${apiHost}/api/auth/me`, {
        headers: { "Authorization": `Bearer ${idToken}` }
      });
      if (backendSync.ok) {
        const backendUser = await backendSync.json();
        localStorage.setItem("clubclash_user", JSON.stringify(backendUser));
      }
    } catch (e) {
      // Backend sync is optional when running standalone
    }

    return { user, idToken };
  } catch (error) {
    console.error("[Firebase Auth Error]:", error);
    alert("Google Sign-In failed: " + error.message);
    return null;
  }
}

// Auto-initialize when document loads
document.addEventListener("DOMContentLoaded", initFirebaseClient);
