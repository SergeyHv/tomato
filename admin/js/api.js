// ===================================================================
// Файл: admin/js/api.js (ОКОНЧАТЕЛЬНЫЙ ВАРИАНТ ПУТЕЙ БЕЗ .cjs)
// ===================================================================

const BASE = "https://tomato-admin-api-2.vercel.app/api/sheets";

// --- ФУНКЦИИ GOOGLE SHEETS ---

export async function listItems() {
  // ИСПРАВЛЕНИЕ: Запрос /list (без .cjs)
  const res = await fetch(`${BASE}/list`);
    
  if (!res.ok) {
    const errorText = await res.text();
    // Добавим больше информации об ошибке для отладки
    const errorDetails = errorText.slice(0, 100).replace(/\s+/g, ' ');
    throw new Error(`Ошибка при загрузке списка (${res.status}): ${errorDetails}...`);
  }
    
  return res.json();
}

export async function addItem(data) {
  // ИСПРАВЛЕНИЕ: Запрос /add (без .cjs)
  const res = await fetch(`${BASE}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
        // Добавляем обработку не-JSON ответа (как в вашем uploadImage)
        let errorData;
        try {
            errorData = await res.json();
        } catch (e) {
            throw new Error(`Ошибка добавления (${res.status}). Не-JSON ответ от сервера.`);
        }
        throw new Error(errorData.error || `Ошибка добавления (${res.status})`);
    }

  return res.json();
}

export async function updateItem(data) {
  // ИСПРАВЛЕНИЕ: Запрос /update (без .cjs)
  const res = await fetch(`${BASE}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
        let errorData;
        try {
            errorData = await res.json();
        } catch (e) {
            throw new Error(`Ошибка обновления (${res.status}). Не-JSON ответ от сервера.`);
        }
        throw new Error(errorData.error || `Ошибка обновления (${res.status})`);
    }

  return res.json();
}

export async function deleteItem(id) {
  // ИСПРАВЛЕНИЕ: Запрос /delete (без .cjs)
  const res = await fetch(`${BASE}/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });

  if (!res.ok) {
        let errorData;
        try {
            errorData = await res.json();
        } catch (e) {
            throw new Error(`Ошибка удаления (${res.status}). Не-JSON ответ от сервера.`);
        }
        throw new Error(errorData.error || `Ошибка удаления (${res.status})`);
    }
        
  return res.json();
}

// --- ФУНКЦИЯ ЗАГРУЗКИ ФОТО ---
// upload-image не находится в /sheets/, путь остается прежним

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
