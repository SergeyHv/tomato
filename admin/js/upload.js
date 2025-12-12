import { uploadImage } from "./api.js";

export function initUpload(onSuccess) {
    const modal = document.getElementById("upload-modal");
    const openBtn = document.getElementById("upload-photo-btn"); // Кнопка в форме
    const closeBtn = document.getElementById("upload-close");
    const startBtn = document.getElementById("upload-start");
    const fileInput = document.getElementById("upload-file");
    const resultDiv = document.getElementById("upload-result");
    const urlInput = document.getElementById("upload-url");

    if (!openBtn || !modal) {
        console.error("Кнопка загрузки или модальное окно не найдены в HTML");
        return;
    }

    // 1. ОТКРЫТИЕ МОДАЛКИ
    openBtn.onclick = (e) => {
        e.preventDefault(); // Чтобы форма не вздумала отправиться
        modal.classList.remove("hidden");
        resultDiv.classList.add("hidden");
        fileInput.value = ""; // Очищаем выбор файла
    };

    // 2. ЗАКРЫТИЕ
    closeBtn.onclick = () => modal.classList.add("hidden");

    // Закрытие при клике мимо окна
    window.onclick = (event) => {
        if (event.target == modal) modal.classList.add("hidden");
    };

    // 3. ЗАГРУЗКА
    startBtn.onclick = async () => {
        const file = fileInput.files[0];
        if (!file) {
            alert("Сначала выберите фото на компьютере!");
            return;
        }

        startBtn.disabled = true;
        startBtn.textContent = "Секунду, отправляю...";

        try {
            const data = await uploadImage(file);

            if (data.url) {
                resultDiv.classList.remove("hidden");
                urlInput.value = data.url;
                
                // Передаем ссылку в основную форму автоматически
                if (onSuccess) onSuccess(data.url);
                
                alert("Фото успешно сохранено!");
                modal.classList.add("hidden"); // Закрываем после успеха
            } else {
                throw new Error(data.error || "Не удалось получить ссылку");
            }
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки: " + err.message);
        } finally {
            startBtn.disabled = false;
            startBtn.textContent = "Начать загрузку";
        }
    };
}
