// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCprMt1-FwEu3FcE5Wd58epcC238OYWZCM",
  authDomain: "vibetrail-e0a7f.firebaseapp.com",
  projectId: "vibetrail-e0a7f",
  storageBucket: "vibetrail-e0a7f.firebasestorage.app",
  messagingSenderId: "1079986136593",
  appId: "1:1079986136593:web:23e3167c8ce1fc4f35f3b0",
  measurementId: "G-H3SCMG2RP2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { db, auth, provider };