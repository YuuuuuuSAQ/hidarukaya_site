// ============================================================
//  news-admin.js — お知らせ管理（管理者向け CRUD）
// ============================================================

import { db } from "./firebase.js";
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp, Timestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from "./auth.js";

export let newsItems = [];

/* ---- 一覧取得 ---------------------------------------------- */
export async function loadNewsItems() {
  const snap = await getDocs(query(collection(db, "news"), orderBy("createdAt", "desc")));
  newsItems  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return newsItems;
}

/* ---- 一覧描画 ---------------------------------------------- */
export function renderAdminNewsList() {
  const el = document.getElementById("admin-news-list");
  if (!el) return;
  if (!newsItems.length) {
    el.innerHTML = `<div class="empty-state">お知らせが登録されていません</div>`;
    return;
  }
  el.innerHTML = newsItems.map((item) => `
    <div class="admin-card">
      <div class="admin-card-header">
        <div style="flex:1;">
          <div class="admin-card-title">${item.title}</div>
          <div class="admin-card-meta">${_fmt(item.date)} ／ ${item.category || "お知らせ"}</div>
        </div>
        <div class="admin-actions">
          <button class="btn-edit"   data-action="edit-news"   data-id="${item.id}">編集</button>
          <button class="btn-delete" data-action="delete-news" data-id="${item.id}" data-title="${_esc(item.title)}">削除</button>
        </div>
      </div>
      ${item.body ? `<div style="font-size:.82rem;color:var(--gray);margin-top:.5rem;line-height:1.6;">${item.body.slice(0,80)}…</div>` : ""}
    </div>`).join("");
}

/* ---- 追加 -------------------------------------------------- */
export async function addNewsItem(data) {
  await addDoc(collection(db, "news"), {
    title:     data.title,
    body:      data.body     || "",
    category:  data.category || "お知らせ",
    date:      data.date ? Timestamp.fromDate(new Date(data.date)) : serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  showToast("お知らせを追加しました");
}

/* ---- 更新 -------------------------------------------------- */
export async function updateNewsItem(id, data) {
  await updateDoc(doc(db, "news", id), {
    title:     data.title,
    body:      data.body     || "",
    category:  data.category || "お知らせ",
    date:      data.date ? Timestamp.fromDate(new Date(data.date)) : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  showToast("お知らせを更新しました");
}

/* ---- 削除 -------------------------------------------------- */
export async function deleteNewsItem(id, title) {
  if (!confirm(`「${title}」を削除しますか？`)) return false;
  await deleteDoc(doc(db, "news", id));
  showToast("お知らせを削除しました");
  return true;
}

/* ---- モーダルへデータをセット ------------------------------ */
export function populateNewsModal(id) {
  const item = newsItems.find((n) => n.id === id);
  if (!item) return null;
  document.getElementById("n-id").value       = item.id;
  document.getElementById("n-title").value    = item.title;
  document.getElementById("n-category").value = item.category || "お知らせ";
  document.getElementById("n-date").value     = _toInput(item.date);
  document.getElementById("n-body").value     = item.body || "";
  return item;
}

/* ---- ユーティリティ ---------------------------------------- */
function _fmt(date) {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("ja-JP");
}
function _toInput(date) {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toISOString().slice(0, 10);
}
function _esc(str) { return String(str).replace(/'/g, "\\'"); }