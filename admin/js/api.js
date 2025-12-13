// ===================================================================
// Файл: js/api.js (Обновлено: Функция uploadImage принимает FormData)
// ===================================================================

const BASE = "https://tomato-admin-api-2.vercel.app/api/sheets";

// --- ФУНКЦИИ GOOGLE SHEETS ---

export async function listItems() {
  const res = await fetch(`${BASE}/list`);
  
  // Добавлена проверка на статус ответа (для лучшей отладки CORS)
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ошибка при загрузке списка (${res.status}): ${errorText.slice(0, 100)}...`);
  }
  
  return res.json();
}

export async function addItem(data) {
  const res = await fetch(`${BASE}/add`, {
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
  const res = await fetch(`${BASE}/update`, {
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
  const res = await fetch(`${BASE}/delete`, {
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
    body: formData // Отправляем готовый FormData. Браузер сам ставит Content-Type: multipart/form-data
  });

  // Обработка ошибок, включая CORS/HTTP ошибки
  if (!res.ok) {
      // Пытаемся прочитать тело ошибки, если оно есть
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
