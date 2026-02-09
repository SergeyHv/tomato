export interface Tomato {
  id: string;
  name: string;
  originalName: string;
  description: string;
  fullDescription: string;
  color: string;
  type: string;
  growth: string;
  height: string;
  weight: string;
  imageUrl: string;
  price: number;
  origin?: string;
  ripening?: string;
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
  White = 'White'
}

export enum TomatoType {
  Cherry = 'Cherry',
  Plum = 'Plum',
  Classic = 'Classic',
  Beefsteak = 'Beefsteak',
  Heart = 'Heart'
}

/** Используется в constants.ts */
export enum GrowthType {
  Dwarf = 'Гном',
  Determinate = 'Дет',
  SemiDeterminate = 'Среднерослый',
  Indeterminate = 'Индет',
}

export type GrowingEnvironment = 'ground' | 'greenhouse' | 'both' | '';
