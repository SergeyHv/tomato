// ===================================================================
// Файл: js/upload.js (ФИНАЛЬНАЯ ВЕРСИЯ С ПРАВИЛЬНЫМ ЭКСПОРТОМ)
// ===================================================================

// Импортируем функцию загрузки из api.js
import { uploadImage } from "./api.js"; 

/**
 * Главная функция инициализации, которая привязывает обработчики к модальному окну загрузки.
 * @param {function(string): void} onSuccess - Колбэк, вызываемый после успешной загрузки,
 * передавая URL загруженного изображения.
 */
export function initUpload(onSuccess) { // <-- КЛЮЧЕВОЕ СЛОВО EXPORT ДОЛЖНО БЫТЬ ЗДЕСЬ
    
    // 1. Получение всех элементов DOM (Используем ФАКТИЧЕСКИЕ ID из index.html)
    const openModalBtn = document.getElementById('upload-photo-btn'); 
    const fileInput = document.getElementById('upload-file');           
    const startBtn = document.getElementById('upload-start');         
    const statusDiv = document.getElementById('upload-status-text');  
    const closeBtn = document.getElementById('upload-close');         
    const modal = document.getElementById('upload-modal');            
    const statusArea = document.getElementById('upload-status-area');   

    // Проверка, чтобы избежать ошибок 'null'
    if (!openModalBtn || !startBtn || !modal || !statusDiv || !fileInput || !closeBtn || !statusArea) {
        console.error("Критическая ошибка: В HTML отсутствуют обязательные элементы для UPLOAD. Инициализация отменена.");
        return;
    }
    
    // --- 2. Обработчики Событий ---
    
    // Открытие модального окна
    openModalBtn.onclick = function() {
        modal.classList.remove('hidden');
        statusArea.classList.add('hidden');
        startBtn.textContent = 'Начать загрузку';
        startBtn.classList.add('disabled');
        statusDiv.textContent = 'Ожидание выбора файла...';
        fileInput.value = ''; // Очищаем поле файла
        statusDiv.style.color = 'inherit'; 
    };

    // Закрытие модального окна
    closeBtn.onclick = function() {
        modal.classList.add('hidden');
    };
    
    // Выбор файла
    fileInput.onchange = function() {
        if (fileInput.files.length > 0) {
            startBtn.classList.remove('disabled');
            statusDiv.textContent = `Файл выбран: ${fileInput.files[0].name}`;
        } else {
            startBtn.classList.add('disabled');
            statusDiv.textContent = 'Ожидание выбора файла...';
        }
    };
    
    // Запуск загрузки
    startBtn.onclick = async function() {
        if (startBtn.classList.contains('disabled') || startBtn.classList.contains('loading')) {
            return;
        }

        const file = fileInput.files[0];
        if (!file) return;

        // Создаем FormData
        const formData = new FormData();
        formData.append('file', file); 

        startBtn.classList.add('loading');
        startBtn.textContent = 'Загрузка...';
        statusArea.classList.remove('hidden');
        statusDiv.textContent = 'Идет загрузка на GitHub...';
        
        try {
            // Вызываем импортированную функцию uploadImage, передавая FormData
            const result = await uploadImage(formData); 
            
            if (result && result.url) {
                // Успех
                onSuccess(result.url); 
                statusDiv.textContent = `Успешно! URL передан в форму.`;
                startBtn.textContent = 'Завершено!';
                statusDiv.style.color = 'green';
            } else {
                // Если API вернуло 200, но без URL
                statusDiv.textContent = 'Ошибка: Не получен URL от сервера.';
                statusDiv.style.color = 'red';
            }

        } catch (error) {
            // Ошибка сети или ошибка, брошенная из api.js (CORS или 500)
            console.error('Ошибка загрузки:', error);
            statusDiv.textContent = `Критическая ошибка: ${error.message || 'Ошибка сети/сервера.'}`;
            statusDiv.style.color = 'red';
        } finally {
            startBtn.classList.remove('loading');
        }
    };
}
