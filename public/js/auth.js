// ============================================================
//  auth.js — 認証処理 + 共通 UI ユーティリティ
//  （utils.js を統合。hamburger / toast / modal もここで管理）
// ============================================================

import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/* ============================================================
   認証
   ============================================================ */

/** Firebase でログイン */
export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

/** ログアウトしてログインページへ */
export async function logout() {
  await signOut(auth);
  window.location.href = "login.html";
}

/**
 * 管理画面ガード
 * 未ログインなら login.html へリダイレクト。
 * @param {function} [callback] ログイン済みユーザーを受け取るコールバック
 */
export function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    } else {
      if (callback) callback(user);
    }
  });
}

/** login.html 用 — 既にログイン済みなら admin.html へ */
export function redirectIfLoggedIn() {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "admin.html";
  });
}

/* ============================================================
   UI ユーティリティ
   ============================================================ */

/** ハンバーガーメニュー初期化（index.html で呼ぶ） */
export function initHamburger() {
  const hamburger = document.getElementById("hamburger");
  const navLinks  = document.getElementById("nav-links");
  if (!hamburger || !navLinks) return;
  hamburger.addEventListener("click", () => navLinks.classList.toggle("open"));
  document.addEventListener("click", (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove("open");
    }
  });
}

/** トースト通知 */
export function showToast(message, type = "success") {
  let el = document.getElementById("_toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "_toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.className = `toast${type === "error" ? " error" : ""}`;
  requestAnimationFrame(() => {
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 3000);
  });
}

/** モーダルを開く */
export function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}

/** モーダルを閉じる */
export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

/** 必須バリデーション。エラーがあれば false を返す */
export function validateRequired(fields) {
  let valid = true;
  fields.forEach(({ id, errorId }) => {
    const input = document.getElementById(id);
    const error = document.getElementById(errorId);
    if (!input || !error) return;
    if (!String(input.value).trim()) {
      error.classList.add("show");
      valid = false;
    } else {
      error.classList.remove("show");
    }
  });
  return valid;
}
