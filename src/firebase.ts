import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { initializeFirestore, memoryLocalCache, collection, addDoc, onSnapshot, query, orderBy, limit, doc, getDoc, getDocFromServer, getDocs, getDocsFromServer, Timestamp, serverTimestamp, deleteDoc, updateDoc, where, setDoc, terminate } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBb0Agfp4mbUU3Nqf7iJkoiYdjv1LubfMo",
  authDomain: "chuong-9e8bb.firebaseapp.com",
  projectId: "chuong-9e8bb",
  storageBucket: "chuong-9e8bb.firebasestorage.app",
  messagingSenderId: "1002907086206",
  appId: "1:1002907086206:web:2d1a4d9d850203e273d72f",
  measurementId: "G-WX6SFTG1ZY",
  firestoreDatabaseId: "(default)"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
});
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
  getDocs,
  getDocsFromServer,
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
