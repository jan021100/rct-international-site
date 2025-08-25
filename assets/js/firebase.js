// /assets/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// --- Firebase Konfiguration ---
const firebaseConfig = {
  apiKey: "AIzaSyBmhozvz6srifeaMxD4vL7ma1diT5ME4Tc",
  authDomain: "rct-website-cb0a9.firebaseapp.com",
  projectId: "rct-website-cb0a9",
  storageBucket: "rct-website-cb0a9.firebasestorage.app",
  messagingSenderId: "354109355233",
  appId: "1:354109355233:web:048c5de24287c53cecf3a0",
  measurementId: "G-M31Y268C6Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- Auth helpers ---
export function rctSignIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function rctSignUp(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  // Legacy-Mitglied prüfen
  const q = query(collection(db, "legacyMembers"), where("email", "==", email));
  const snap = await getDocs(q);

  let userData = {
    name,
    email,
    roles: { spolekMember: false, germanMember: false },
    createdAt: new Date().toISOString()
  };

  if (!snap.empty) {
    // Legacy-Daten übernehmen
    const legacy = snap.docs[0].data();

    userData = {
      ...userData,
      ...legacy, // überschreibt name, email etc. nur wenn vorhanden
      migratedFromLegacy: true
    };
  }

  await setDoc(doc(db, "users", cred.user.uid), userData);
  return cred;
}

export function rctSignOut() {
  return signOut(auth);
}

// --- User State Listener ---
export function onUserChanged(cb) {
  return onAuthStateChanged(auth, cb);
}

// --- Fetch Profile Convenience ---
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// --- Für schnelle Konsole-Zugriffe ---
window.RCT = {
  auth, db,
  rctSignIn, rctSignUp, rctSignOut,
  onUserChanged, getUserProfile
};