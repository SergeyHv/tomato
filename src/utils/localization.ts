
export const TRANSLATIONS: Record<string, string> = {
  // Цвета
  'Red': 'Красный',
  'Pink': 'Розовый',
  'Yellow': 'Жёлтый',
  'Black': 'Чёрный / Тёмный',
  'Green': 'Зелёный',
  'Orange': 'Оранжевый',
  'Bi-color': 'Биколор',
  'Bi-Color': 'Биколор', 
  'White': 'Белый',
  'Purple': 'Пурпурный',
  'Striped': 'Полосатый',
  
  // Типы плодов
  'Cherry': 'Черри',
  'Plum': 'Сливка',
  'Classic': 'Классический',
  'Beefsteak': 'Биф (Крупный)',
  'Heart': 'Сердцевидный',
  'Oxheart': 'Бычье сердце',
  'Pepper': 'Перцевидный',
  'Pear': 'Грушевидный',
  
  // Типы роста
  'Dwarf': 'Гном',
  'Determinate': 'Дет (Низкорослый)',
  'Semi-determinate': 'Среднерослый',
  'Indeterminate': 'Индет (Высокорослый)',
  
  // Заглушки и общие термины
  'Разное': 'Разное',
  'Индет': 'Индет (Высокий)',
  'Классика': 'Классика',
  'Не указано': 'Нет данных'
};

// Создаем обратный словарь (Русский -> Английский) для нормализации данных из базы
const REVERSE_TRANSLATIONS: Record<string, string> = {};
Object.entries(TRANSLATIONS).forEach(([eng, rus]) => {
  REVERSE_TRANSLATIONS[rus.toLowerCase()] = eng;
});

// Дополнительные синонимы, которые пользователь может писать в базе
const ALIASES: Record<string, string> = {
  'индет': 'Indeterminate',
  'дет': 'Determinate',
  'полудет': 'Semi-determinate',
  'гном': 'Dwarf',
  'черное сердце': 'Heart', // Если напишут сложный цвет/тип
  'биф': 'Beefsteak',
  'сердце': 'Heart',
  'черный': 'Black',
  'темный': 'Black'
};

export const localize = (key: string): string => {
  if (!key) return "";
  const cleanKey = String(key).trim();
  // Если ключ уже на русском (например, мы его так записали в Airtable), возвращаем как есть
  if (/[а-яА-ЯёЁ]/.test(cleanKey)) return cleanKey;
  return TRANSLATIONS[cleanKey] || cleanKey;
};

/**
 * Превращает русское значение из базы в английский ID для корректной работы фильтров.
 * Пример: "Черри" -> "Cherry", "Красный" -> "Red"
 */
export const normalizeCategory = (value: string): string => {
  if (!value) return "";
  const v = String(value).trim();
  
  // 1. Если это уже английский ключ (есть в TRANSLATIONS), возвращаем его
  if (TRANSLATIONS[v]) return v;

  const lowerV = v.toLowerCase();

  // 2. Ищем в обратном словаре (по полному совпадению перевода)
  if (REVERSE_TRANSLATIONS[lowerV]) return REVERSE_TRANSLATIONS[lowerV];

  // 3. Ищем в списке синонимов
  if (ALIASES[lowerV]) return ALIASES[lowerV];

  // 4. Если не нашли, возвращаем как есть (пусть отображается на русском)
  return v;
};

export const translateName = (name: string): string => {
  return name;
};
