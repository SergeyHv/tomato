// ===================================================================
// Файл: js/api.js (ИСПРАВЛЕННЫЕ ПУТИ: ДОБАВЛЕНО .cjs)
// ===================================================================

const BASE = "https://tomato-admin-api-2.vercel.app/api/sheets";

// --- ФУНКЦИИ GOOGLE SHEETS ---

export async function listItems() {
  // ИСПРАВЛЕНО: Запрос /list.cjs
  const res = await fetch(`${BASE}/list.cjs`);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ошибка при загрузке списка (${res.status}): ${errorText.slice(0, 100)}...`);
  }
  
  return res.json();
}

export async function addItem(data) {
  // ИСПРАВЛЕНО: Запрос /add.cjs
  const res = await fetch(`${BASE}/add.cjs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Ошибка добавления (${res.status})`);
    }

  return res.json();
}

export async function updateItem(data) {
  // ИСПРАВЛЕНО: Запрос /update.cjs
  const res = await fetch(`${BASE}/update.cjs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Ошибка обновления (${res.status})`);
    }

  return res.json();
}

export async function deleteItem(id) {
  // ИСПРАВЛЕНО: Запрос /delete.cjs
  const res = await fetch(`${BASE}/delete.cjs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });

  if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Ошибка удаления (${res.status})`);
    }
    
  return res.json();
}

// --- ФУНКЦИЯ ЗАГРУЗКИ ФОТО ---

const UPLOAD_BASE = "https://tomato-admin-api-2.vercel.app/api/upload-image";

/**
 * Отправляет готовый объект FormData с файлом на API для загрузки в GitHub.
 * @param {FormData} formData - Объект FormData, содержащий файл.
 */
export async function uploadImage(formData) {
  // Валидация
  if (!(formData instanceof FormData)) {
    console.error("uploadImage: Ожидается объект FormData.");
    throw new Error("Неверный тип данных: ожидается FormData.");
  }

  const res = await fetch(UPLOAD_BASE, {
    method: "POST",
    body: formData 
  });

  // Обработка ошибок, включая CORS/HTTP ошибки
  if (!res.ok) {
      let errorDetails = `Ошибка загрузки (${res.status})`;
      try {
          const errorData = await res.json();
          errorDetails = errorData.error || errorDetails;
      } catch (e) {
          // Игнорируем ошибку парсинга, если ответ не JSON
      }
      throw new Error(errorDetails);
  }
  
  return res.json();
}
