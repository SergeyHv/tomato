import { deleteItem } from "./api.js";
import { openForm } from "./form.js";

export function renderList(items) {
  const container = document.getElementById("items");
  container.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div class="item-title">${item.name}</div>
      <div>${item.color} — ${item.type}</div>
      <div class="item-buttons">
        <button data-edit="${item.id}">Редактировать</button>
        <button data-delete="${item.id}">Удалить</button>
      </div>
    `;

    container.appendChild(div);
  });

  container.onclick = async (e) => {
    if (e.target.dataset.edit) {
      const id = e.target.dataset.edit;
      const item = items.find(i => i.id === id);
      openForm(item);
    }

    if (e.target.dataset.delete) {
      const id = e.target.dataset.delete;
      if (confirm("Удалить сорт?")) {
        await deleteItem(id);
        location.reload();
      }
    }
  };
}
