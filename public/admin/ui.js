import { bust } from './images.js';

export function showToast(toast, text, ok = true) {
  toast.innerText = text;
  toast.className =
    `fixed bottom-5 right-5 px-6 py-4 rounded-xl text-white text-lg shadow-lg ${
      ok ? 'bg-green-600' : 'bg-red-600'
    }`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

export function renderDesktop(productList, list) {
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

