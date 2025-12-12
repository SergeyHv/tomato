import { deleteItem, listItems } from "./api.js";
import { openForm } from "./form.js";

let allItems = []; // Храним все сорта здесь

export function renderList(items) {
    if (items) allItems = items; // Сохраняем для поиска
    
    const container = document.getElementById("items");
    container.innerHTML = "";

    // Фильтруем пустые строки (как та последняя в вашем JSON)
    const validItems = allItems.filter(item => item.name && item.name.trim() !== "");

    validItems.forEach(item => {
        const photo = item.mainphoto || "https://via.placeholder.com/300x250?text=Нет+фото";
        
        const card = document.createElement("div");
        card.className = "item-card";
        card.innerHTML = `
            <img src="${photo}" class="item-img" loading="lazy">
            <div class="item-info">
                <span class="item-tag">${item.type || 'Сорт'}</span>
                <div class="item-name">${item.name}</div>
                <div style="font-size: 0.9rem; color: #666;">
                    🎨 Цвет: ${item.color || '—'}<br>
                    📏 Размер: ${item.size || '—'}
                </div>
            </div>
            <div class="item-btns">
                <button class="edit-btn">✏️ Изменить</button>
                <button class="del-btn">🗑️ Удалить</button>
            </div>
        `;

        card.querySelector(".edit-btn").onclick = () => openForm(item);
        card.querySelector(".del-btn").onclick = async () => {
            if (confirm(`Вы уверены, что хотите удалить сорт "${item.name}"?`)) {
                await deleteItem(item.id);
                const data = await listItems();
                renderList(data.items);
            }
        };

        container.appendChild(card);
    });
}

// Функция поиска
window.handleSearch = (query) => {
    const filtered = allItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(query.toLowerCase()))
    );
    renderList(filtered);
};
