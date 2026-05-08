// ============================================================
//  news.js — お知らせ取得・表示（ユーザー向け）
// ============================================================

import { db } from "./firebase.js";
import {
  collection, query, orderBy, limit, getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ---- Firestore 取得 ---------------------------------------- */
export async function fetchNews(maxItems = 100) {
  const q    = query(collection(db, "news"), orderBy("createdAt", "desc"), limit(maxItems));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ---- リスト描画（クリックで詳細モーダル）------------------
 *  options:
 *    perPage  : 1ページの表示件数（省略時 = 全件）
 *    showMore : 「もっと見る」リンクのURL（省略時 = なし）
 * ----------------------------------------------------------- */
export function renderNewsList(items, containerId = "news-list", options = {}) {
  const { perPage, showMore } = options;
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items?.length) {
    container.innerHTML = `<div class="empty-state">お知らせはありません</div>`;
    return;
  }

  // ページネーション用の状態
  let currentPage = 1;

  function render() {
    const start    = (currentPage - 1) * (perPage || items.length);
    const end      = perPage ? start + perPage : items.length;
    const visible  = items.slice(start, end);
    const total    = items.length;
    const totalPages = perPage ? Math.ceil(total / perPage) : 1;

    let html = visible.map((item) => `
      <div class="news-item" data-id="${item.id}">
        <span class="news-date">${_fmt(item.date)}</span>
        <span class="news-category">${item.category || "お知らせ"}</span>
        <span class="news-title">${item.title}</span>
        ${item.body?.trim() ? `<span class="news-arrow">›</span>` : ""}
      </div>`).join("");

    // 「一覧を見る」ボタン（index.html 用）
    if (showMore && total > (perPage || 0)) {
      html += `
        <div class="news-more-wrap">
          <a href="${showMore}" class="news-more-btn">お知らせ一覧を見る →</a>
        </div>`;
    }

    // ページネーション（news.html 用）
    if (!showMore && totalPages > 1) {
      html += `<div class="pagination">`;
      if (currentPage > 1) {
        html += `<button class="page-btn" data-page="${currentPage - 1}">‹ 前へ</button>`;
      }
      for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn${i === currentPage ? " active" : ""}" data-page="${i}">${i}</button>`;
      }
      if (currentPage < totalPages) {
        html += `<button class="page-btn" data-page="${currentPage + 1}">次へ ›</button>`;
      }
      html += `</div>`;
    }

    // DOM 更新
    const el = document.getElementById(containerId);
    el.innerHTML = html;

    // ページボタン
    el.querySelectorAll(".page-btn[data-page]").forEach((btn) => {
      btn.addEventListener("click", () => {
        currentPage = parseInt(btn.dataset.page);
        render();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // 詳細モーダル
    el.querySelectorAll(".news-item[data-id]").forEach((row) => {
      row.addEventListener("click", () => {
        const item = items.find((n) => n.id === row.dataset.id);
        if (item) openNewsDetail(item);
      });
    });
  }

  render();
}

/* ---- 詳細モーダル ------------------------------------------ */
function openNewsDetail(item) {
  if (!document.getElementById("news-detail-overlay")) {
    const overlay = document.createElement("div");
    overlay.id        = "news-detail-overlay";
    overlay.className = "modal-overlay";
    overlay.innerHTML = `
      <div class="modal">
        <button class="modal-close" id="news-detail-close">✕</button>
        <div id="news-detail-meta"
             style="display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem;"></div>
        <h2 class="modal-title" id="news-detail-title"
            style="font-size:1.1rem;line-height:1.5;"></h2>
        <hr style="border:none;border-top:2px solid var(--gold-light);margin:1rem 0;">
        <div id="news-detail-body"
             style="font-size:.9rem;color:var(--charcoal);line-height:2;white-space:pre-wrap;"></div>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById("news-detail-close").addEventListener("click", () =>
      overlay.classList.remove("open"));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  }

  document.getElementById("news-detail-meta").innerHTML = `
    <span class="news-category">${item.category || "お知らせ"}</span>
    <span style="font-size:.78rem;color:var(--warm-gray);letter-spacing:.08em;">${_fmt(item.date)}</span>`;
  document.getElementById("news-detail-title").textContent = item.title;
  document.getElementById("news-detail-body").textContent  =
    item.body?.trim() ? item.body : "（本文はありません）";
  document.getElementById("news-detail-overlay").classList.add("open");
}

/* ---- 日付フォーマット -------------------------------------- */
function _fmt(date) {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("ja-JP");
}