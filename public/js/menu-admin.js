// ============================================================
//  menu-admin.js — メニュー管理（管理者向け CRUD）
// ============================================================

import { db } from "./firebase.js";
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from "./auth.js";

export let menuItems = [];

/* ---- 一覧取得 ---------------------------------------------- */
export async function loadMenuItems() {
  const snap = await getDocs(query(collection(db, "menu"), orderBy("order", "asc")));
  menuItems  = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return menuItems;
}

/* ---- テーブル描画 ------------------------------------------ */
export function renderMenuTable() {
  const tbody = document.getElementById("menu-table-body");
  if (!tbody) return;
  if (!menuItems.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--gray);">商品が登録されていません</td></tr>`;
    return;
  }
  tbody.innerHTML = menuItems.map((item) => `
    <tr>
      <td style="padding:.8rem 1rem;font-size:.9rem;">${item.emoji || ""} ${item.name}</td>
      <td style="padding:.8rem 1rem;font-size:.82rem;color:var(--gray);">${item.category}</td>
      <td style="padding:.8rem 1rem;font-weight:700;color:var(--red);">¥${Number(item.price).toLocaleString()}</td>
      <td style="padding:.8rem 1rem;">
        ${item.tag ? `<span style="font-size:.65rem;padding:.1rem .5rem;border-radius:2px;background:var(--red-light);color:var(--red);">${item.tag}</span>` : ""}
      </td>
      <td style="padding:.8rem 1rem;">
        <div class="admin-actions">
          <button class="btn-edit"   data-action="edit"   data-id="${item.id}">編集</button>
          <button class="btn-delete" data-action="delete" data-id="${item.id}" data-name="${item.name}">削除</button>
        </div>
      </td>
    </tr>`).join("");
}

/* ---- 価格一覧描画 ------------------------------------------ */
export function renderPriceList() {
  const el = document.getElementById("price-list");
  if (!el) return;
  el.innerHTML = menuItems.map((item) => `
    <div class="price-row">
      <span class="price-row-emoji">${item.emoji || "🍜"}</span>
      <div style="flex:1;">
        <div class="price-row-name">${item.name}</div>
        <div class="price-row-cat">${item.category}</div>
      </div>
      <input type="number" class="price-input" data-id="${item.id}" value="${item.price}" min="0" step="50">
      <span class="price-yen">円</span>
    </div>`).join("");
}

/* ---- 価格一括保存 ------------------------------------------ */
export async function savePrices() {
  const inputs = document.querySelectorAll(".price-input[data-id]");
  await Promise.all([...inputs].map((input) => {
    const id    = input.dataset.id;
    const price = parseInt(input.value, 10);
    const item  = menuItems.find((m) => m.id === id);
    if (!item || item.price === price) return Promise.resolve();
    return updateDoc(doc(db, "menu", id), { price, updatedAt: serverTimestamp() });
  }));
  showToast("価格を保存しました");
  await loadMenuItems();
}

/* ---- 追加 -------------------------------------------------- */
export async function addMenuItem(data) {
  await addDoc(collection(db, "menu"), {
    ...data, order: menuItems.length + 1,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
  });
  showToast("商品を追加しました");
}

/* ---- 更新 -------------------------------------------------- */
export async function updateMenuItem(id, data) {
  await updateDoc(doc(db, "menu", id), { ...data, updatedAt: serverTimestamp() });
  showToast("商品を更新しました");
}

/* ---- 削除 -------------------------------------------------- */
export async function deleteMenuItem(id, name) {
  if (!confirm(`「${name}」を削除しますか？`)) return false;
  await deleteDoc(doc(db, "menu", id));
  showToast("商品を削除しました");
  return true;
}

/* ---- モーダルへデータをセット ------------------------------ */
export function populateMenuModal(id) {
  const item = menuItems.find((m) => m.id === id);
  if (!item) return null;
  document.getElementById("m-id").value       = item.id;
  document.getElementById("m-name").value     = item.name;
  document.getElementById("m-price").value    = item.price;
  document.getElementById("m-category").value = item.category;
  document.getElementById("m-desc").value     = item.description || "";
  document.getElementById("m-tag").value      = item.tag || "";
  document.getElementById("m-emoji").value    = item.emoji || "";
  return item;
}
