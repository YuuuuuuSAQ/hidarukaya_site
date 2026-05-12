// ============================================================
//  menu-admin.js — メニュー管理（Cloudinary画像アップロード対応）
// ============================================================

import { db } from "./firebase.js";
import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { showToast } from "./auth.js";

export let menuItems = [];

// Cloudinary 設定
const CLOUD_NAME    = "dqvqgzn6r";
const UPLOAD_PRESET = "hidarukaya_menu";
const UPLOAD_URL    = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

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
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--warm-gray);">商品が登録されていません</td></tr>`;
    return;
  }
  tbody.innerHTML = menuItems.map((item) => `
    <tr>
      <td style="padding:.75rem 1rem;">
        <div style="display:flex;align-items:center;gap:.75rem;">
          ${item.imageUrl
            ? `<img src="${item.imageUrl}" alt="${item.name}" style="width:48px;height:48px;object-fit:cover;border-radius:4px;border:1px solid var(--border);">`
            : `<div style="width:48px;height:48px;background:var(--gold-light);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;">${item.emoji || "🍜"}</div>`
          }
          <span style="font-size:.9rem;font-weight:600;">${item.name}</span>
        </div>
      </td>
      <td style="padding:.75rem 1rem;font-size:.82rem;color:var(--warm-gray);">${item.category}</td>
      <td style="padding:.75rem 1rem;font-weight:700;color:var(--red);">¥${Number(item.price).toLocaleString()}</td>
      <td style="padding:.75rem 1rem;">
        ${item.tag ? `<span style="font-size:.65rem;padding:.15rem .5rem;border-radius:3px;background:var(--red-light);color:var(--red);font-weight:700;">${item.tag}</span>` : ""}
      </td>
      <td style="padding:.75rem 1rem;">
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
      <div style="width:40px;height:40px;flex-shrink:0;">
        ${item.imageUrl
          ? `<img src="${item.imageUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;">`
          : `<div style="width:40px;height:40px;background:var(--gold-light);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">${item.emoji || "🍜"}</div>`
        }
      </div>
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

/* ---- Cloudinary へ画像アップロード ------------------------- */
export function uploadMenuImage(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file",          file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("folder",        "hidarukaya/menu");

    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOAD_URL);

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round(e.loaded / e.total * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        resolve({ url: res.secure_url, publicId: res.public_id });
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Network error")));
    xhr.send(formData);
  });
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

  const preview     = document.getElementById("m-image-preview");
  const placeholder = document.getElementById("m-image-placeholder");
  if (item.imageUrl) {
    preview.src           = item.imageUrl;
    preview.style.display = "block";
    placeholder.style.display = "none";
  } else {
    preview.style.display     = "none";
    placeholder.style.display = "flex";
  }
  return item;
}