import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, doc, getDoc, getDocFromServer, Timestamp, serverTimestamp, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBb0Agfp4mbUU3Nqf7iJkoiYdjv1LubfMo",
  authDomain: "chuong-9e8bb.firebaseapp.com",
  projectId: "chuong-9e8bb",
  storageBucket: "chuong-9e8bb.firebasestorage.app",
  messagingSenderId: "1002907086206",
  appId: "1:1002907086206:web:2d1a4d9d850203e273d72f",
  measurementId: "G-WX6SFTG1ZY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
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
  deleteDoc
};
export type { User };
