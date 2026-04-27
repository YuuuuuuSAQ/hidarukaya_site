// ============================================================
//  menu.js — メニュー取得・表示（ユーザー向け）
// ============================================================

import { db } from "./firebase.js";
import {
  collection,
  query,
  orderBy,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const CAT_LABELS = { ramen: "らーめん", side: "サイドメニュー", drink: "ドリンク" };

let _allItems = [];

/* ---- Firestore 取得 ---------------------------------------- */
export async function fetchMenu() {
  const q    = query(collection(db, "menu"), orderBy("order", "asc"));
  const snap = await getDocs(q);
  _allItems  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return _allItems;
}

/* ---- カテゴリボタン描画 ------------------------------------ */
export function renderCategoryButtons(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const cats = ["all", ...Object.keys(CAT_LABELS)];
  container.innerHTML = cats
    .map(
      (cat) =>
        `<button class="cat-btn${cat === "all" ? " active" : ""}" data-cat="${cat}">
           ${cat === "all" ? "すべて" : CAT_LABELS[cat]}
         </button>`
    )
    .join("");

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-btn");
    if (!btn) return;
    container.querySelectorAll(".cat-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const cat = btn.dataset.cat;
    renderMenuGrid(cat === "all" ? _allItems : _allItems.filter((i) => i.category === cat));
  });
}

/* ---- グリッド描画 ------------------------------------------ */
export function renderMenuGrid(items, gridId = "menu-grid") {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  if (!items?.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">メニューが登録されていません</div>`;
    return;
  }
  grid.innerHTML = items.map((item) => {
    const tag = item.tag
      ? `<span class="menu-tag ${item.tag === "NEW" ? "new" : ""}">${item.tag}</span>`
      : "";
    const img = item.imageUrl
      ? `<img class="menu-img" src="${item.imageUrl}" alt="${item.name}" loading="lazy">`
      : `<div class="menu-img-placeholder">${item.emoji || "🍜"}</div>`;
    return `
      <div class="menu-card">
        ${img}
        <div class="menu-info">
          <div class="menu-name">${item.name}${tag}</div>
          ${item.description ? `<div class="menu-desc">${item.description}</div>` : ""}
          <div class="menu-price">¥${Number(item.price).toLocaleString()}<span>（税込）</span></div>
        </div>
      </div>`;
  }).join("");
}
