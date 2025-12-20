// ✅ URL твоего backend
const API_URL = "https://tomato-backend-vercel.vercel.app/api/products";

// ✅ Загружаем данные с backend
export async function loadProducts() {
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error("Ошибка загрузки данных: " + res.status);
  }

  const data = await res.json();
  return data.map(adaptProduct);
}

// ✅ Адаптация одного товара
export function adaptProduct(p) {
  return {
    id: p.id,
    name: p.title,
    description: p.description,
    price: Number(p.price),
    image: p.images,
    type: mapCategoryToType(p.category),
    color: mapTagsToColor(p.tags),
    maturity: mapTagsToMaturity(p.tags),
    isNew: false
  };
}

// ✅ Маппинг категории → тип
function mapCategoryToType(category) {
  switch (category) {
    case "tomatoes":
      return "Томат";
    case "peppers":
      return "Перец";
    case "cucumbers":
      return "Огурец";
    default:
      return "Неизвестно";
  }
}

// ✅ Маппинг тегов → цвет
function mapTagsToColor(tags) {
  if (!tags) return "Неизвестно";
  const t = tags.toLowerCase();

  if (t.includes("черн")) return "Черный";
  if (t.includes("желт")) return "Желтый";
  if (t.includes("зелен")) return "Зеленый";
  if (t.includes("оранж")) return "Оранжевый";
  if (t.includes("красн")) return "Красный";

  return "Неизвестно";
}

// ✅ Маппинг тегов → спелость
function mapTagsToMaturity(tags) {
  if (!tags) return "Неизвестно";
  const t = tags.toLowerCase();

  if (t.includes("ранний")) return "Ранний";
  if (t.includes("средн")) return "Среднеспелый";
  if (t.includes("поздн")) return "Поздний";

  return "Неизвестно";
}
