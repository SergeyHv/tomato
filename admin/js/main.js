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

if (data && data.items && data.items.length > 0) {
    console.log(`✅ Успешно загружено ${data.items.length} элементов.`);
    console.log("Начинаем рендеринг списка...");
    renderList(data.items);
    console.log("Рендеринг списка завершен.");
} else if (data && data.items && data.items.length === 0) {
    console.warn("API вернул пустой список (0 элементов).");
} else {
    console.error("API вернул данные не в ожидаемом формате:", data);
}`;
        }
    }
}

// Запускаем всё только после полной загрузки страницы
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
} else {
    start();
}
