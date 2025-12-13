import { listItems } from "./api.js";
import { renderList } from "./list.js";
import { openForm, initForm } from "./form.js";
import { initUpload } from "./upload.js";

async function start() {
    console.log("--- 🚀 АДМИНКА: СТАРТ ---"); // Лог 1: Начало

    try {
        // 1. Инициализируем загрузку фото
        console.log("Инициализация Upload..."); // Лог 2
        initUpload((url) => {
            const photoInput = document.getElementById("mainphoto");
            if (photoInput) {
                photoInput.value = url;
                console.log("Ссылка на фото вставлена в форму:", url);
            }
        });

        // 2. Инициализируем форму
        console.log("Инициализация Form..."); // Лог 3
        initForm();

        // 3. Привязываем кнопку "Добавить новый сорт"
        console.log("Привязка кнопки Добавить..."); // Лог 4
        const addNewBtn = document.getElementById("add-new");
        if (addNewBtn) {
            addNewBtn.onclick = () => {
                console.log("Открываем форму для нового сорта");
                openForm();
            };
             console.log("Кнопка 'Добавить новый сорт' привязана."); // Лог 5
        } else {
             console.error("Кнопка 'add-new' не найдена в DOM!"); // Лог 5-A
        }

        // 4. Загрузка данных (ВРЕМЕННО ОТКЛЮЧЕНО)
        console.log("Загрузка списка временно отключена."); // Лог 6

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
