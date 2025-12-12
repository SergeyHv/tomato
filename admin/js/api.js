const BASE = "https://tomato-admin-api-2.vercel.app/api/sheets";

export async function listItems() {
  const res = await fetch(`${BASE}/list`);
  return res.json();
}

export async function addItem(data) {
  const res = await fetch(`${BASE}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateItem(data) {
  const res = await fetch(`${BASE}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteItem(id) {
  const res = await fetch(`${BASE}/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  return res.json();
}
// Путь для загрузки фото (без /sheets)
const UPLOAD_BASE = "https://tomato-admin-api-2.vercel.app/api/upload-image";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(UPLOAD_BASE, {
    method: "POST",
    body: formData // Заголовок Content-Type браузер поставит сам для FormData
  });
  return res.json();
}
