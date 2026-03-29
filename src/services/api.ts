import { Tomato, CartItem } from '../types';
import { TOMATO_DATA } from '../constants';
import { normalizeCategory } from '../utils/localization';

const getEnv = (key: string): string | undefined => {
  try {
    // @ts-ignore
    const env = import.meta.env;
    return env ? env[key] : undefined;
  } catch {
    return undefined;
  }
};

const getField = (fields: Record<string, any>, ...keys: string[]): any => {
  for (const key of keys) {
    if (fields[key] !== undefined) return fields[key];
  }
  const fieldKeys = Object.keys(fields);
  for (const key of keys) {
    const found = fieldKeys.find(k => k.toLowerCase() === key.toLowerCase());
    if (found) return fields[found];
  }
  return undefined;
};

/** КАНОНИЗАЦИЯ RIPENING */
const normalizeRipening = (value: any): string | undefined => {
  if (!value) return undefined;

  const raw =
    typeof value === 'string'
      ? value
      : typeof value === 'object'
      ? value.name
      : '';

  if (!raw) return undefined;

  const v = raw.trim().toLowerCase();

  if (v.startsWith('ран')) return 'Ранний';
  if (v.startsWith('среднеран')) return 'Среднеранний';
  if (v.startsWith('средн')) return 'Средний';
  if (v.startsWith('позд')) return 'Поздний';

  return undefined;
};

export const fetchTomatoes = async (): Promise<Tomato[]> => {
  try {
    const res = await fetch('/tomatoes_data.json');
    if (!res.ok) throw new Error('JSON load error');

    const data = await res.json();

    return data.map((item: any): Tomato => ({
      id: String(item.id),
      name: item.name || 'Без имени',
      originalName: '',
      description: item.description || '',
      fullDescription: item.description || '',
      color: normalizeCategory(item.color || 'Разное'),
      type: normalizeCategory(item.type || 'Классика'),
      growth: normalizeCategory(item.growth || 'Индет'),
      height: 'Не указано',
      weight: item.weight || 'Не указано',
      imageUrl: item.imageUrl || '',
      price: 0,
      origin: item.origin || '',
      ripening: item.ripening || undefined,
    }));
  } catch (err) {
    console.error('JSON fetch error:', err);
    return [];
  }
};
