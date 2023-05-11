import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA1b3Yj7w8l9o9LS_ZsuEVs00heTT8y7fU",
  authDomain: "pennedit2-e807d.firebaseapp.com",
  projectId: "pennedit2-e807d",
  storageBucket: "pennedit2-e807d.appspot.com",
  messagingSenderId: "685433256265",
  appId: "1:685433256265:web:d17797774aa647a325c298",
  measurementId: "G-Q0F7SV2CS5"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

export { db, auth, provider, storage };
