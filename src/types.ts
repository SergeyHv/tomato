export interface Tomato {
  id: string;
  name: string;                 // Название сорта
  description: string;          // Описание (краткое или полное)
  color: string;                // Цвет плода
  type: string;                 // Тип плода
  growth: string;               // Тип куста
  height: string;               // Высота
  weight: string;               // Вес
  imageUrl: string;             // Ссылка на фото
  price: number;                // Цена (пока не используется, но можно оставить)
  origin?: string;              // Происхождение
  ripening?: string;            // Срок созревания
  ocrText?: string;             // Распознанный текст с фото (новое поле)
}

export interface CartItem {
  tomato: Tomato;
  quantity: number;
}

export interface FilterState {
  search: string;
  environment: string;
  ripening: string;
  color: string;
  type: string;
  growth: string;
}

export enum TomatoColor {
  Red = 'Red',
  Pink = 'Pink',
  Yellow = 'Yellow',
  Black = 'Black',
  Green = 'Green',
  Orange = 'Orange',
  BiColor = 'Bi-color',
  // White = 'White'   // убрали белый
}

export enum TomatoType {
  Cherry = 'Cherry',
  Plum = 'Plum',
  Classic = 'Classic',
  Beefsteak = 'Beefsteak',
  Heart = 'Heart'
}

export enum GrowthType {
  Dwarf = 'Гном',
  Determinate = 'Дет',
  SemiDeterminate = 'Среднерослый',
  Indeterminate = 'Индет',
}

export type GrowingEnvironment = 'ground' | 'greenhouse' | 'both' | '';
