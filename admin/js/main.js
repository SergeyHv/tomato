// ===================================================================
// Файл: upload.js (Обновленный Модуль)
// Экспортирует initUpload для использования в main.js
// ===================================================================

// Импортируем функцию загрузки из api.js
// Предполагаем, что api.js экспортирует функцию uploadImage
import { uploadImage } from "./api.js"; 

// Главная функция инициализации, которая принимает функцию,
// срабатывающую после успешной загрузки.
export function initUpload(onSuccess) {
    
    // 1. Получение всех элементов DOM (Используем ФАКТИЧЕСКИЕ ID из index.html)
    // Эти функции вызываются из main.js, который ждет DOMContentLoaded
    const openModalBtn = document.getElementById('upload-photo-btn'); 
    const fileInput = document.getElementById('upload-file');           
    const startBtn = document.getElementById('upload-start');         
    const statusDiv = document.getElementById('upload-status-text');  
    const photoUrlInput = document.getElementById('mainphoto');        
    const closeBtn = document.getElementById('upload-close');         
    const modal = document.getElementById('upload-modal');            
    const statusArea = document.getElementById('upload-status-area');   

    if (!openModalBtn || !startBtn || !modal || !statusDiv) {
        // Мы используем console.error, но не выходим, так как main.js может продолжать работу
        console.error("Критическая ошибка: В HTML отсутствуют обязательные элементы для UPLOAD. Проверьте ID.");
    }
    
    // --- 2. Обработчики Событий ---
    
    // Открытие модального окна
    openModalBtn.onclick = function() {
        modal.classList.remove('hidden');
        statusArea.classList.add('hidden');
        startBtn.textContent = 'Начать загрузку';
        startBtn.classList.add('disabled');
        statusDiv.textContent = 'Ожидание выбора файла...';
        fileInput.value = '';
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

        // Подготовка данных
        const formData = new FormData();
        formData.append('file', file); 

        startBtn.classList.add('loading');
        startBtn.textContent = 'Загрузка...';
        statusArea.classList.remove('hidden');
        statusDiv.textContent = 'Идет загрузка на GitHub...';
        
        try {
            // Вызываем импортированную функцию uploadImage из api.js
            const result = await uploadImage(formData); 
            
            if (result && result.url) {
                // Успех: Вызываем колбэк из main.js
                onSuccess(result.url); 
                statusDiv.textContent = `Успешно! URL передан в форму.`;
                startBtn.textContent = 'Завершено!';
            } else {
                statusDiv.textContent = 'Ошибка: Не получен URL от сервера.';
            }

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            statusDiv.textContent = `Критическая ошибка: ${error.message || 'Ошибка сети/сервера.'}`;
        } finally {
            startBtn.classList.remove('loading');
        }
    };
}
