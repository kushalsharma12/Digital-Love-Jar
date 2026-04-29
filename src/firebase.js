import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBZrXetMNCBodGv1W_Bo2TrrdllRP0wWXg",
  authDomain: "digital-love-jar.firebaseapp.com",
  projectId: "digital-love-jar",
  storageBucket: "digital-love-jar.firebasestorage.app",
  messagingSenderId: "541723385031",
  appId: "1:541723385031:web:cb948e5da06adbdc6272e2",
  measurementId: "G-FELBT3D5KF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
