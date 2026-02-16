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

const AIRTABLE_BASE_ID = getEnv('VITE_AIRTABLE_BASE_ID') || 'app6EHiUQjTfVJlms';
const AIRTABLE_TABLE = 'Varieties';
const AIRTABLE_ORDERS_TABLE = 'Orders';
const AIRTABLE_TOKEN = getEnv('VITE_AIRTABLE_TOKEN') || '';

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
      imageUrl: item.image || '',
      price: 0,
      origin: item.origin || '',
      ripening: item.ripening || undefined,
    }));
  } catch (err) {
    console.error('JSON fetch error:', err);
    return [];
  }
};

export const submitOrder = async (order: {
  name: string;
  phone: string;
  address: string;
  comment: string;
  items: CartItem[];
}): Promise<void> => {
  if (!AIRTABLE_TOKEN || AIRTABLE_TOKEN.includes('......')) return;

  const itemsList = order.items.map(i => i.tomato.name).join(', ');
  const payload = {
    fields: {
      Phone: order.phone,
      Addres: order.address,
      VarietiesList: itemsList,
      CustomerComment: `${order.name}. ${order.comment}`,
    },
  };

  const res = await fetch(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
      AIRTABLE_ORDERS_TABLE
    )}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) throw new Error('Order failed');
};
