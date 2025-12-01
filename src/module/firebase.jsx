// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCFoP9rpchGyQuqs_pjcrxACXG8QFPfzzQ",
  authDomain: "cursohub-fd8e2.firebaseapp.com",
  projectId: "cursohub-fd8e2",
  storageBucket: "cursohub-fd8e2.firebasestorage.app",
  messagingSenderId: "35144650804",
  appId: "1:35144650804:web:c602d0f929f0e15cd33a61",
  measurementId: "G-7VGRRTMJXT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line no-unused-vars
const analytics = getAnalytics(app);
export const storage = getStorage(app);