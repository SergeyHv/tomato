// ===================================================================
// Файл: upload.js (Клиентский код)
// ИСПОЛЬЗУЕТ ФАКТИЧЕСКИЕ ID из index.html
// ===================================================================

// Оборачиваем весь код в DOMContentLoaded для предотвращения ошибки null
document.addEventListener('DOMContentLoaded', function() {
    
    // 1. Получение всех элементов DOM (используем ID из index.html)
    const openModalBtn = document.getElementById('upload-photo-btn'); // ФАКТ: upload-photo-btn (строка 53)
    const fileInput = document.getElementById('upload-file');           // ФАКТ: upload-file (строка 100)
    const startBtn = document.getElementById('upload-start');         // ФАКТ: upload-start (строка 106)
    const statusDiv = document.getElementById('upload-status-text');  // ФАКТ: upload-status-text (строка 104)
    const photoUrlInput = document.getElementById('mainphoto');        // ФАКТ: mainphoto (строка 52)
    const closeBtn = document.getElementById('upload-close');         // ФАКТ: upload-close (строка 107)
    const modal = document.getElementById('upload-modal');            // ФАКТ: upload-modal (строка 91)
    const statusArea = document.getElementById('upload-status-area');   // ФАКТ: upload-status-area (строка 102)

    // Если нет критичных элементов, выходим (хотя DOMContentLoaded это уже гарантирует)
    if (!openModalBtn || !startBtn || !modal) {
        console.error("Критическая ошибка: В HTML отсутствуют обязательные элементы для загрузки.");
        return; 
    }

    // --- 2. Обработчики Событий ---
    
    // Открытие модального окна
    openModalBtn.onclick = function() {
        modal.classList.remove('hidden'); // Удаляем 'hidden' для показа
        statusArea.classList.add('hidden'); // Скрываем статус при открытии
        startBtn.textContent = 'Начать загрузку';
        startBtn.classList.add('disabled');
        if (statusDiv) statusDiv.textContent = 'Ожидание выбора файла...';
        fileInput.value = ''; // Сброс файла
    };

    // Закрытие модального окна
    closeBtn.onclick = function() {
        modal.classList.add('hidden'); // Скрываем модальное окно
    };
    
    // Выбор файла
    fileInput.onchange = function() {
        if (fileInput.files.length > 0) {
            startBtn.classList.remove('disabled');
            if (statusDiv) statusDiv.textContent = `Файл выбран: ${fileInput.files[0].name}`;
        } else {
            startBtn.classList.add('disabled');
            if (statusDiv) statusDiv.textContent = 'Ожидание выбора файла...';
        }
    };
    
    // Запуск загрузки
    startBtn.onclick = async function() {
        if (startBtn.classList.contains('disabled') || startBtn.classList.contains('loading')) {
            return;
        }

        const file = fileInput.files[0];
        if (!file) return;

        // 1. Подготовка
        const formData = new FormData();
        formData.append('file', file); 

        startBtn.classList.add('loading');
        startBtn.textContent = 'Загрузка...';
        statusArea.classList.remove('hidden');
        if (statusDiv) statusDiv.textContent = 'Идет загрузка на GitHub...';
        
        try {
            // Предполагается, что uploadImage определена в api.js и доступна здесь
            const uploadImage = window.uploadImage; 
            if (typeof uploadImage !== 'function') {
                throw new Error("Функция 'uploadImage' не найдена. Проверьте подключение api.js.");
            }
            
            const result = await uploadImage(formData); 
            
            if (result && result.url) {
                // Успех
                photoUrlInput.value = result.url; // Вставляем ссылку в поле формы
                if (statusDiv) statusDiv.textContent = `Успешно! URL скопирован в форму.`;
                startBtn.textContent = 'Завершено!';
                
            } else {
                if (statusDiv) statusDiv.textContent = 'Ошибка: Не получен URL от сервера.';
            }

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            if (statusDiv) statusDiv.textContent = `Критическая ошибка: ${error.message || 'Ошибка сети/сервера.'}`;
        } finally {
            startBtn.classList.remove('loading');
            // Оставляем кнопку завершенной, пока пользователь не закроет модальное окно.
        }
    };
});
