// ===================================================================
// Файл: admin/js/api.js (ФИНАЛЬНЫЙ ВАРИАНТ ПУТЕЙ NETLIFY)
// ===================================================================

// ВНИМАНИЕ: ЗАМЕНИТЕ 'timely-seahorse-ac428f.netlify.app' НА ВАШ РЕАЛЬНЫЙ ДОМЕН NETLIFY!
const BASE_URL = "https://timely-seahorse-ac428f.netlify.app/.netlify/functions";

// --- ФУНКЦИИ GOOGLE SHEETS ---

export async function listItems() {
  // Новый путь: /list (имя файла в netlify/functions/list.cjs)
  const res = await fetch(`${BASE_URL}/list`); 
    
  if (!res.ok) {
    const errorText = await res.text();
    const errorDetails = errorText.slice(0, 100).replace(/\s+/g, ' ');
    throw new Error(`Ошибка при загрузке списка (${res.status}): ${errorDetails}...`);
  }
    
  return res.json();
}

export async function addItem(data) {
  // Новый путь: /add
  const res = await fetch(`${BASE_URL}/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
    
  if (!res.ok) {
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
  // Новый путь: /update
  const res = await fetch(`${BASE_URL}/update`, {
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
  // Новый путь: /delete
  const res = await fetch(`${BASE_URL}/delete`, {
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
// Запрос идет на netlify/functions/upload-image (поэтому '/upload-image')
const UPLOAD_BASE_URL = `${BASE_URL}/upload-image`;

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

  const res = await fetch(UPLOAD_BASE_URL, {
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
