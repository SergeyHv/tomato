// ===================================================================
// Файл: js/list.js (ИСПРАВЛЕННЫЙ ЭКСПОРТ ДЛЯ РЕНДЕРИНГА)
// ===================================================================

import { openForm } from "./form.js"; 

const listContainer = document.getElementById('list-container');
const emptyMessage = document.getElementById('empty-list-message');

// КЛЮЧЕВОЙ МОМЕНТ: Добавлено слово 'export' для устранения SyntaxError
export function renderList(items) {
    if (!listContainer) {
        console.error("Контейнер списка (list-container) не найден.");
        return;
    }

    if (!items || items.length === 0) {
        listContainer.innerHTML = '';
        if (emptyMessage) emptyMessage.style.display = 'block';
        return;
    }
    
    if (emptyMessage) emptyMessage.style.display = 'none';

    // Создаем HTML-разметку для каждого элемента (сорта)
    const htmlItems = items.map(item => `
        <div class="list-item" data-id="${item.id}">
            <img src="${item.mainphoto || 'https://via.placeholder.com/150x150?text=Нет+фото'}" alt="${item.name}" class="item-photo">
            <div class="item-details">
                <div class="item-name">ID: ${item.id} - ${item.name}</div>
                <div class="item-version">Версия: ${item.version || 'н/д'}</div>
            </div>
            <div class="item-actions">
                <button class="edit-btn" data-id="${item.id}">Редактировать</button>
            </div>
        </div>
    `).join('');

    listContainer.innerHTML = htmlItems;

    // Привязываем событие "Редактировать"
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const idToEdit = e.target.getAttribute('data-id');
            const itemToEdit = items.find(item => String(item.id) === String(idToEdit));
            
            if (itemToEdit) {
                openForm(itemToEdit);
            }
        });
    });
}
