// Import the functions you need from the SDKs you need
 
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNHAuNsVisApnZynx08hT6YVx_r6KniTQ",
  authDomain: "uzistore-ce655.firebaseapp.com",
  projectId: "uzistore-ce655",
  storageBucket: "uzistore-ce655.appspot.com",
  messagingSenderId: "116096193726",
  appId: "1:116096193726:web:47eae91162c511e3413aef",
  measurementId: "G-WFZQQNVFLT"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };