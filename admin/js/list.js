import { deleteItem, listItems } from "./api.js";
import { openForm } from "./form.js";

export function renderList(items) {
    const container = document.getElementById("items");
    container.innerHTML = "";

    if (!items || items.length === 0) {
        container.innerHTML = "<div style='grid-column: 1/-1; text-align: center; padding: 50px;'>У вас пока нет сортов. Нажмите «Добавить сорт»!</div>";
        return;
    }

    // Идем в обратном порядке, чтобы новые добавленные были сверху
    [...items].reverse().forEach(item => {
        // Если фото нет, ставим заглушку
        const photoUrl = item.mainphoto || "https://via.placeholder.com/300x200?text=Нет+фото";
        
        const card = document.createElement("div");
        card.className = "item";
        card.innerHTML = `
            <img src="${photoUrl}" class="item-img" alt="${item.name}">
            <div class="item-content">
                <div class="item-name">${item.name}</div>
                <div class="item-details">
                    <strong>Тип:</strong> ${item.type || '—'}<br>
                    <strong>Цвет:</strong> ${item.color || '—'}<br>
                    <strong>Размер:</strong> ${item.size || '—'}
                </div>
            </div>
            <div class="item-btns">
                <button class="edit-btn">Изменить</button>
                <button class="del-btn">Удалить</button>
            </div>
        `;

        card.querySelector(".edit-btn").onclick = () => openForm(item);
        card.querySelector(".del-btn").onclick = async () => {
            if (confirm(`Удалить сорт "${item.name}"? Это действие нельзя отменить.`)) {
                await deleteItem(item.id);
                const updated = await listItems();
                renderList(updated.items);
            }
        };

        container.appendChild(card);
    });
}
