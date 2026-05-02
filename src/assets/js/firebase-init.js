// Firebase init — shared across the site.
// Web SDK (v10+) loaded from CDN. The config is safe to expose publicly;
// security is enforced server-side by Firestore rules.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// ⚠️ Replace with values from Firebase Console → Project Settings → Your apps.
// You can also build this file from src/_data/site.js at build time if you prefer.
const firebaseConfig = {
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);
