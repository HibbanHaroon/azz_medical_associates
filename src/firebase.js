// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVIc6KtXvujdr7aWYzq8Tg6cXLg5mHMPw",
  authDomain: "hauto-8891a.firebaseapp.com",
  projectId: "hauto-8891a",
  storageBucket: "hauto-8891a.appspot.com",
  messagingSenderId: "582775501587",
  appId: "1:582775501587:web:3255ff53490dce89f4e0e6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
