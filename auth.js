// Authentication Module
import { auth, onAuthStateChanged, signOut } from "./firebase.js";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// ============================================
// Check Authentication State
// ============================================

export function checkAuth() {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            resolve(user);
        });
    });
}

// ============================================
// Register User
// ============================================

export async function registerUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// Login User
// ============================================

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// Logout User
// ============================================

export async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// Get Current User
// ============================================

export function getCurrentUser() {
    return auth.currentUser;
}

// ============================================
// Auth State Listener
// ============================================

export function onAuthStateChange(callback) {
    onAuthStateChanged(auth, callback);
}
