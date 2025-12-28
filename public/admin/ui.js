import { bust } from './images.js';

export function renderDesktop(productList, list) {
  if (!productList) return;

  productList.innerHTML = list.map(p => `
    <div class="p-2 border rounded-xl flex items-center gap-3 bg-white">
      <img src="${bust(p.images)}" class="w-12 h-12 rounded-lg object-cover">
      <div class="flex-1">
        <div class="font-semibold">${p.title}</div>
        <div class="text-sm text-gray-500">${p.category}</div>
      </div>
      <button data-edit="${p.id}">✏️</button>
      <button data-del="${p.id}">🗑</button>
    </div>
  `).join('');
}

export function renderMobile(productList, list) {
  if (!productList) return;

  productList.innerHTML = list.map(p => `
    <div class="p-2 border rounded-xl bg-white flex gap-3">
      <img src="${bust(p.images)}" class="w-12 h-12 rounded-lg object-cover">
      <div>
        <div class="font-semibold">${p.title}</div>
        <div class="text-sm text-gray-500">${p.category}</div>
      </div>
    </div>
  `).join('');
}
