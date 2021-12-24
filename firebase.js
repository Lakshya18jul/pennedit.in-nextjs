import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAXqfHPfM5A-971QN8vbDSKiZinZJXeu4I",
  authDomain: "pennedit-nextjs.firebaseapp.com",
  projectId: "pennedit-nextjs",
  storageBucket: "pennedit-nextjs.appspot.com",
  messagingSenderId: "303399857792",
  appId: "1:303399857792:web:d9909d4517881cc1d28065",
  measurementId: "G-1QG8NMXFMT",
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

export { db, auth, provider, storage };
