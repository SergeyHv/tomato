import { uploadImageToGitHub } from './github-upload.js';
import { saveTomatoToSheet } from './gs-api.js';
import { loadOptions } from './utils.js';

// --- ИНИЦИАЛИЗАЦИЯ ОПЦИЙ ---

// Пример категорий и цветов — позже заменим на загрузку из таблицы
const CATEGORY_OPTIONS = [
  "Крупноплодный",
  "Черри",
  "Сливовидный",
  "Экзотический",
  "Салатный"
];

const COLOR_OPTIONS = [
  "Красный",
  "Жёлтый",
  "Оранжевый",
  "Чёрный",
  "Зелёный",
  "Полосатый"
];

// Загружаем опции в мультиселекты
loadOptions("categories", CATEGORY_OPTIONS);
loadOptions("colors", COLOR_OPTIONS);

// --- ЛОГИКА ФОРМЫ ---

const form = document.getElementById('tomato-form');
const photoInput = document.getElementById('photo');
const preview = document.getElementById('photo-preview');

let photoURL = "";

// --- ЗАГРУЗКА ФОТО ---

photoInput.addEventListener('change', async () => {
  const file = photoInput.files[0];
  if (!file) return;

  preview.innerHTML = `<p>Загрузка фото...</p>`;

  // Заглушка — позже подключим GitHub API
  photoURL = await uploadImageToGitHub(file);

  preview.innerHTML = `<img src="${photoURL}" alt="preview">`;
});

// --- ОТПРАВКА ФОРМЫ ---

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById('name').value.trim(),
    categories: [...document.getElementById('categories').selectedOptions].map(o => o.value),
    colors: [...document.getElementById('colors').selectedOptions].map(o => o.value),
    growth: document.getElementById('growth').value,
    weight: document.getElementById('weight').value,
    description: document.getElementById('description').value.trim(),
    photo: photoURL
  };

  console.log("Отправка данных:", data);

  // Заглушка — позже подключим Google Sheets API
  await saveTomatoToSheet(data);

  alert("Сохранено!");

  form.reset();
  preview.innerHTML = "";
  photoURL = "";
});
