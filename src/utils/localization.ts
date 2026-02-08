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

  // Типы роста (КАНОН, как в реальности)
  'Dwarf': 'Гном',
  'Determinate': 'Низкорослый (Дет)',
  'Semi-determinate': 'Среднерослый (Полудет)',
  'Indeterminate': 'Высокорослый (Индет)',

  // Заглушки и общие термины
  'Разное': 'Разное',
  'Индет': 'Высокорослый (Индет)',
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
  'черное сердце': 'Heart',
  'биф': 'Beefsteak',
  'сердце': 'Heart',
  'черный': 'Black',
  'темный': 'Black'
};

export const localize = (key: string): string => {
  if (!key) return '';
  const cleanKey = String(key).trim();
  // Если ключ уже на русском — возвращаем как есть
  if (/[а-яА-ЯёЁ]/.test(cleanKey)) return cleanKey;
  return TRANSLATIONS[cleanKey] || cleanKey;
};

/**
 * Превращает русское значение из базы в английский ID для корректной работы фильтров.
 */
export const normalizeCategory = (value: string): string => {
  if (!value) return '';
  const v = String(value).trim();

  // Если это уже английский ключ
  if (TRANSLATIONS[v]) return v;

  const lowerV = v.toLowerCase();

  if (REVERSE_TRANSLATIONS[lowerV]) return REVERSE_TRANSLATIONS[lowerV];
  if (ALIASES[lowerV]) return ALIASES[lowerV];

  return v;
};

export const translateName = (name: string): string => {
  return name;
};
