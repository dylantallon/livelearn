import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9UJxoZ6QQWlP-HQa9nJ4tzJUB2QUGX1g",
  authDomain: "livelearn-fe28b.firebaseapp.com",
  projectId: "livelearn-fe28b",
  storageBucket: "livelearn-fe28b.firebasestorage.app",
  messagingSenderId: "903995544750",
  appId: "1:903995544750:web:03f1bf4cf713dff468c93f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);