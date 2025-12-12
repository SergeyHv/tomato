import { addItem, updateItem } from "./api.js";

export function openForm(item = null) {
  document.getElementById("form-panel").classList.remove("hidden");
  document.getElementById("list-panel").classList.add("hidden");

  if (item) {
    document.getElementById("form-title").textContent = "Редактировать сорт";

    document.getElementById("id").value = item.id;
    document.getElementById("version").value = item.version || "1";

    document.getElementById("name").value = item.name;
    document.getElementById("description").value = item.description;
    document.getElementById("mainphoto").value = item.mainphoto;
    document.getElementById("color").value = item.color;
    document.getElementById("type").value = item.type;
    document.getElementById("size").value = item.size;
    document.getElementById("season").value = item.season;
    document.getElementById("gallery_photos").value = item.gallery_photos;
    document.getElementById("origin").value = item.origin;
  } else {
    document.getElementById("form-title").textContent = "Добавить сорт";
    document.getElementById("tomato-form").reset();
    document.getElementById("id").value = "";
  }
}

export function initForm() {
  document.getElementById("cancel-btn").onclick = () => {
    location.reload();
  };

  document.getElementById("tomato-form").onsubmit = async (e) => {
    e.preventDefault();

    const data = {
      id: document.getElementById("id").value,
      version: document.getElementById("version").value,
      name: document.getElementById("name").value,
      description: document.getElementById("description").value,
      mainphoto: document.getElementById("mainphoto").value,
      color: document.getElementById("color").value,
      type: document.getElementById("type").value,
      size: document.getElementById("size").value,
      season: document.getElementById("season").value,
      gallery_photos: document.getElementById("gallery_photos").value,
      origin: document.getElementById("origin").value
    };

    if (data.id) {
      await updateItem(data);
    } else {
      await addItem(data);
    }

    location.reload();
  };
}
