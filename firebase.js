import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAhGP3DQ9ltFMIt4OOEcTVprF06EXmB1YA",
  authDomain: "pennedit.in",
  projectId: "pennedit-d53c8",
  storageBucket: "pennedit-d53c8.appspot.com",
  messagingSenderId: "702892846292",
  appId: "1:702892846292:web:58acdac7d50e9cb962df41",
  measurementId: "G-XSDF9RTHB9",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

export { db, auth, provider, storage };