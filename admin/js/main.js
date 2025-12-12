import { listItems } from "./api.js";
import { renderList } from "./list.js";
import { openForm, initForm } from "./form.js";
import { initUpload } from "./upload.js";

async function start() {
    console.log("Админка запускается...");

    try {
        // 1. Инициализируем загрузку фото
        // Мы передаем функцию, которая сработает после успешной загрузки
        initUpload((url) => {
            const photoInput = document.getElementById("mainphoto");
            if (photoInput) {
                photoInput.value = url;
                console.log("Ссылка на фото вставлена в форму:", url);
            }
        });

        // 2. Инициализируем форму (события кнопок Сохранить/Отмена)
        initForm();

        // 3. Привязываем кнопку "Добавить новый сорт"
        const addNewBtn = document.getElementById("add-new");
        if (addNewBtn) {
            addNewBtn.onclick = () => {
                console.log("Открываем форму для нового сорта");
                openForm();
            };
        }

        // 4. Загружаем и отображаем список томатов
        console.log("Загружаем список из Google Таблиц...");
        const data = await listItems();
        if (data && data.items) {
            renderList(data.items);
        }

    } catch (err) {
        console.error("Критическая ошибка при запуске:", err);
    }
}

// Запускаем всё только после полной загрузки страницы
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
} else {
    start();
}
