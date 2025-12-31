// frontend/src/services/firebase/config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCC-AANZlzXMlfHPHGcN11LBa6zBCDLb8s",
  authDomain: "zodiacai-4d885.firebaseapp.com",
  projectId: "zodiacai-4d885",
  storageBucket: "zodiacai-4d885.firebasestorage.app",
  messagingSenderId: "702888334450",
  appId: "1:702888334450:web:2bdc17662afe63e2401eeb",
  measurementId: "G-H3P7QDLTDV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;