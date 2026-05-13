// ============================================================
//  firebase.js — Firebase 初期化・エクスポート
//  ※ Firebase Console > プロジェクト設定 > マイアプリ から取得
// ============================================================
 
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore }  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth }       from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage }    from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
 
const firebaseConfig = {
  apiKey: "AIzaSyCzhcitFLoz2JiS2UIqqqeov5KrN1OSevc",
  authDomain: "hidaruka-site.firebaseapp.com",
  projectId: "hidaruka-site",
  storageBucket: "hidaruka-site.firebasestorage.app",
  messagingSenderId: "123422545595",
  appId: "1:123422545595:web:32132d6913661153b53b9e"
};
 
const app = initializeApp(firebaseConfig);
 
export const db      = getFirestore(app);
export const auth    = getAuth(app);
export const storage = getStorage(app);