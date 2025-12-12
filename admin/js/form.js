import { addItem, updateItem, listItems } from "./api.js";
import { renderList } from "./list.js";

// Список ID всех полей ввода из твоего index.html
const FIELD_IDS = [
    "id", "name", "description", "mainphoto", "color", 
    "type", "size", "season", "gallery_photos", "origin", "version"
];

export function initForm() {
    const form = document.getElementById("tomato-form");
    const cancelBtn = document.getElementById("cancel-btn");

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        // 1. Собираем данные из полей формы
        const formData = {};
        FIELD_IDS.forEach(field => {
            const el = document.getElementById(field);
            if (el) formData[field] = el.value.trim();
        });

        // 2. Проверяем, это редактирование или создание
        const isEdit = formData.id && formData.id.length > 0;
        
        // Автоматически обновляем дату версии перед сохранением
        formData.version = new Date().toLocaleString("ru-RU");

        // 3. Если это новый сорт, генерируем временный ID (если поле пустое)
        if (!isEdit) {
            formData.id = "T-" + Date.now().toString().slice(-6);
        }

        try {
            let response;
            if (isEdit) {
                console.log("Обновление существующего сорта:", formData.id);
                response = await updateItem(formData);
            } else {
                console.log("Добавление нового сорта");
                response = await addItem(formData);
            }

            if (response.success || response.updatedRange || response.updates) {
                alert("Данные успешно сохранены в Google Таблицу!");
                closeForm();
                
                // 4. Обновляем список на экране, чтобы увидеть изменения
                const data = await listItems();
                renderList(data.items);
            } else {
                throw new Error(response.error || "Неизвестная ошибка сервера");
            }
        } catch (err) {
            console.error("Ошибка при сохранении:", err);
            alert("Произошла ошибка: " + err.message);
        }
    };

    cancelBtn.onclick = closeForm;
}

/**
 * Открывает форму. 
 * Если передан объект item — заполняет поля для редактирования.
 * Если item равен null — очищает поля для создания нового.
 */
export function openForm(item = null) {
    const formPanel = document.getElementById("form-panel");
    const listPanel = document.getElementById("list-panel");
    const formTitle = document.getElementById("form-title");
    const form = document.getElementById("tomato-form");

    listPanel.classList.add("hidden");
    formPanel.classList.remove("hidden");
    form.reset();

    if (item) {
        formTitle.textContent = "Редактировать: " + item.name;
        // Наполняем форму данными из таблицы
        FIELD_IDS.forEach(field => {
            const el = document.getElementById(field);
            if (el && item[field] !== undefined) {
                el.value = item[field];
            }
        });
    } else {
        formTitle.textContent = "Добавить новый сорт томата";
        // Очищаем скрытые поля
        document.getElementById("id").value = "";
        document.getElementById("version").value = "";
    }
}

function closeForm() {
    document.getElementById("form-panel").classList.add("hidden");
    document.getElementById("list-panel").classList.remove("hidden");
}
