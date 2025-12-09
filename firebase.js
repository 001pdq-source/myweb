// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-analytics.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAbWJ_75F3RLUIBVRz2NpgpgLJKm0o1Jm8",
    authDomain: "my-web-6111b.firebaseapp.com",
    projectId: "my-web-6111b",
    storageBucket: "my-web-6111b.firebasestorage.app",
    messagingSenderId: "540400864980",
    appId: "1:540400864980:web:df73e331638a07b2977541",
    measurementId: "G-7729MX6D3Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Set persistence to LOCAL so user stays logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Persistence error:", error);
});

// Export Firebase services
export { auth, app, onAuthStateChanged, signOut };
