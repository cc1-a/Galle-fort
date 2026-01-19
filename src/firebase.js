import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // MUST HAVE THIS

const firebaseConfig = {
  apiKey: "AIzaSyBxOimxbNOoyvyIDzoOjXAz9rYKSA_1YHk",
  authDomain: "galle-website-mama.firebaseapp.com",
  projectId: "galle-website-mama",
  storageBucket: "galle-website-mama.firebasestorage.app",
  messagingSenderId: "426302406833",
  appId: "1:426302406833:web:ca3516f9c4e5d8f5fe6290",
  measurementId: "G-4LE9TEW19X"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // MUST HAVE THIS