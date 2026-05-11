export const localize = (value: string): string => {
  if (!value) return 'Не указано';
  
  const map: Record<string, string> = {
    // Цвета
    'Red': 'Красный',
    'Pink': 'Розовый',
    'Yellow': 'Жёлтый',
    'Orange': 'Оранжевый',
    'Black': 'Темный',
    'Green': 'Зелёный',
    'BiColor': 'Биколор',
    'White': 'Белый',
    
    // Типы плодов
    'Cherry': 'Черри',
    'Plum': 'Сливовидный',
    'Classic': 'Классический',
    'Beefsteak': 'Бифштексный',
    'Heart': 'Сердцевидный',
    
    // Типы кустов
    'Гном': 'Гном',
    'Дет': 'Низкорослый',
    'Среднерослый': 'Среднерослый',
    'Индет': 'Высокорослый',
    
    // Сроки созревания
    'Ранний': 'Ранний',
    'Средний': 'Средний',
    'Поздний': 'Поздний',
  };
  
  return map[value] || value;
};

// Функция для обратного преобразования (если нужно)
export const originalValue = (localized: string): string => {
  const reverseMap: Record<string, string> = {
    'Красный': 'Red',
    'Розовый': 'Pink',
    'Жёлтый': 'Yellow',
    'Оранжевый': 'Orange',
    'Чёрный': 'Black',
    'Зелёный': 'Green',
    'Биколор': 'BiColor',
    'Белый': 'White',
    'Черри': 'Cherry',
    'Сливовидный': 'Plum',
    'Классический': 'Classic',
    'Бифштексный': 'Beefsteak',
    'Сердцевидный': 'Heart',
    'Низкорослый': 'Дет',
  };
  return reverseMap[localized] || localized;
};
