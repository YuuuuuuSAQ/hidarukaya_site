// ============================================================
//  news.js — お知らせ取得・表示（ユーザー向け）
// ============================================================

import { db } from "./firebase.js";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ---- Firestore 取得 ---------------------------------------- */
export async function fetchNews(maxItems = 20) {
  const q    = query(collection(db, "news"), orderBy("date", "desc"), limit(maxItems));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---- リスト描画 -------------------------------------------- */
export function renderNewsList(items, containerId = "news-list") {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!items?.length) {
    el.innerHTML = `<div class="empty-state">お知らせはありません</div>`;
    return;
  }
  el.innerHTML = items
    .map(
      (item) => `
      <div class="news-item">
        <span class="news-date">${_fmt(item.date)}</span>
        <span class="news-category">${item.category || "お知らせ"}</span>
        <span class="news-title">${item.title}</span>
      </div>`
    )
    .join("");
}

/* ---- 日付フォーマット -------------------------------------- */
function _fmt(date) {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("ja-JP");
}
