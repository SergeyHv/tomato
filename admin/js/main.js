import { listItems } from "./api.js";
import { renderList } from "./list.js";
import { openForm, initForm } from "./form.js";
import { initUpload } from "./upload.js";

async function start() {
    console.log("--- 🚀 АДМИНКА: СТАРТ ---");

    try {
        // 1. Инициализируем загрузку фото
        console.log("Инициализация Upload...");
        initUpload((url) => {
            const photoInput = document.getElementById("mainphoto");
            if (photoInput) {
                photoInput.value = url;
                console.log("Ссылка на фото вставлена в форму:", url);
            }
        });

        // 2. Инициализируем форму
        console.log("Инициализация Form...");
        initForm();

        // 3. Привязываем кнопку "Добавить новый сорт"
        console.log("Привязка кнопки Добавить...");
        const addNewBtn = document.getElementById("add-new");
        if (addNewBtn) {
            addNewBtn.onclick = () => {
                console.log("Открываем форму для нового сорта");
                openForm();
            };
             console.log("Кнопка 'Добавить новый сорт' привязана.");
        } else {
             console.error("Кнопка 'add-new' не найдена в DOM!");
        }

        // 4. *** АКТИВАЦИЯ ЗАГРУЗКИ СПИСКА ***
        console.log("Загружаем список из Google Таблиц...");
        const data = await listItems();
        if (data && data.items) {
            renderList(data.items);
        }

    } catch (err) {
        console.error("Критическая ошибка при запуске:", err);
        // Отображение ошибки для пользователя (например, если не удалось загрузить список)
        const listContainer = document.getElementById('list-container');
        if(listContainer) {
            listContainer.innerHTML = `<div style="color: red; padding: 20px;">
                Ошибка загрузки данных! Проверьте, что Google Sheets API и Vercel API работают.
                <br>Детали: ${err.message}
            </div>`;
        }
    }
}

// Запускаем всё только после полной загрузки страницы
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
} else {
    start();
}
