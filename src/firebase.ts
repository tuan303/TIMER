import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, doc, getDoc, getDocFromServer, Timestamp, serverTimestamp, deleteDoc, updateDoc, where, setDoc, terminate } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  projectId: "gen-lang-client-0539925303",
  appId: "1:710291063517:web:26bc35d945da69ef625134",
  apiKey: "AIzaSyCckj44YuRvRNwW0BAHKhjftNuzR4chSDw",
  authDomain: "gen-lang-client-0539925303.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-1ce303b2-fa64-4b6f-885c-2dc2cef3dde7",
  storageBucket: "gen-lang-client-0539925303.firebasestorage.app",
  messagingSenderId: "710291063517",
  measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  signInWithPopup,
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  doc, 
  getDoc, 
  getDocFromServer, 
  Timestamp, 
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteDoc,
  updateDoc,
  where,
  setDoc,
  terminate
};
export type { User };
