export interface Tomato {
  id: string;
  name: string;
  description: string;
  color: string;
  type: string;
  growth: string;
  height: string;
  weight: string;
  imageUrl: string;
  price: number;
  origin?: string;
  ripening?: string;
  ocrText?: string; // текст с фото
  isNew?: boolean; // ← новинка
  isAvailable?: boolean; // доступен для отображения
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
  isNew?: boolean; // ← добавили
}

export enum TomatoColor {
  Red = 'Red',
  Pink = 'Pink',
  Yellow = 'Yellow',
  Black = 'Black',
  Green = 'Green',
  Orange = 'Orange',
  BiColor = 'Bi-color',
  // White = 'White' // убрали
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
