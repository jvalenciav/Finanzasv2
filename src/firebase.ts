// src/firebase.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Tu configuración que ya proporcionaste:
const firebaseConfig = {
  apiKey: "AIzaSyAVw-z61Cmxza8-iclW9-SvensbtJdh6tE",
  authDomain: "finanzasv2.firebaseapp.com",
  projectId: "finanzasv2",
  storageBucket: "finanzasv2.firebasestorage.app",
  messagingSenderId: "554465269404",
  appId: "1:554465269404:web:d8df18a9967016ab7eff59",
  measurementId: "G-ZP4K7KYDCQ"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Firestore
const db = getFirestore(app);

// Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, googleProvider };
