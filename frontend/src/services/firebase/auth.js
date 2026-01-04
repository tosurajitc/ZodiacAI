// frontend/src/services/firebase/auth.js
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './config';
import { API_BASE_URL } from '../../constants/config';

// Google Sign-In with Backend Integration
export const signInWithGoogle = async () => {
  try {
    // Step 1: Sign in with Firebase
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseToken = await result.user.getIdToken();
    
    // Step 2: Send token to backend
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: firebaseToken })
    });
    
    if (!response.ok) {
      throw new Error('Backend authentication failed');
    }
    
    const data = await response.json();
    
    // Step 3: Return backend user data and token
    return {
      success: true,
      user: data.data.user,        // ✅ Fixed: data.user → data.data.user
      token: data.data.token,       // ✅ Fixed: data.token → data.data.token
      firebaseUser: result.user
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Facebook Sign-In with Backend Integration
export const signInWithFacebook = async () => {
  try {
    // Step 1: Sign in with Firebase
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseToken = await result.user.getIdToken();
    
    // Step 2: Send token to backend
    const response = await fetch(`${API_BASE_URL}/auth/facebook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: firebaseToken })
    });
    
    if (!response.ok) {
      throw new Error('Backend authentication failed');
    }
    
    const data = await response.json();
    
    // Step 3: Return backend user data and token
    return {
      success: true,
      user: data.data.user,        // ✅ Fixed: data.user → data.data.user
      token: data.data.token,       // ✅ Fixed: data.token → data.data.token
      firebaseUser: result.user
    };
  } catch (error) {
    console.error('Facebook sign-in error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Sign Out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Auth State Listener
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
