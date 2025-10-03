// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA1RDK-oEdHjJjgnsskq_kRo-qgTQRluek",
  authDomain: "beliefs-survey.firebaseapp.com",
  projectId: "beliefs-survey",
  storageBucket: "beliefs-survey.firebasestorage.app",
  messagingSenderId: "899877335103",
  appId: "1:899877335103:web:50b63e52a56afa9076488a",
  measurementId: "G-6DR7HX6S86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestore database
export const db = getFirestore(app);
