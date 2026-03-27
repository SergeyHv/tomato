import { Tomato, CartItem } from '../types';
import { normalizeCategory } from '../utils/localization';

/** Русские метки из JSON + обратный маппинг из англ. ключей (старые данные) */
const GROWTH_EN_TO_RU: Record<string, string> = {
  Dwarf: 'Гном',
  Determinate: 'Дет',
  'Semi-determinate': 'Среднерослый',
  Indeterminate: 'Индет',
};

const canonicalGrowth = (raw: unknown): string => {
  const v = raw != null ? String(raw).trim() : '';
  if (!v) return 'Индет';
  if (GROWTH_EN_TO_RU[v]) return GROWTH_EN_TO_RU[v];
  return v;
};

function formatOrderText(order: {
  name: string;
  phone: string;
  address: string;
  comment: string;
  items: CartItem[];
}): string {
  const lines = [
    'Заказ с каталога томатов',
    '',
    `Имя: ${order.name}`,
    `Телефон: ${order.phone}`,
    `Адрес: ${order.address}`,
    order.comment ? `Комментарий: ${order.comment}` : '',
    '',
    'Сорта:',
    ...order.items.map((i, idx) => `${idx + 1}. ${i.tomato.name}`),
  ].filter(Boolean) as string[];
  return lines.join('\n');
}

export const fetchTomatoes = async (): Promise<Tomato[]> => {
  try {
    const res = await fetch('/tomatoes_data.json');
    if (!res.ok) throw new Error('JSON load error');

    const data = await res.json();

    return data.map((item: any): Tomato => ({
      id: String(item.id),
      name: item.name || 'Без имени',
      originalName: item.originalName || item.name || '',
      description: item.description || '',
      fullDescription: item.fullDescription || item.description || '',
      color: normalizeCategory(item.color || 'Разное'),
      type: normalizeCategory(item.type || 'Классика'),
      growth: canonicalGrowth(item.growth),
      height: item.height || 'Не указано',
      weight: item.weight || 'Не указано',
      imageUrl: item.imageUrl || '',
      price: typeof item.price === 'number' ? item.price : 0,
      origin: item.origin || '',
      ripening: item.ripening || undefined,
    }));
  } catch (err) {
    console.error('JSON fetch error:', err);
    throw err;
  }
};

/**
 * Без бэкенда: полный текст заказа копируется в буфер обмена.
 * Если задан VITE_ORDER_EMAIL — дополнительно открывается почтовый клиент (mailto).
 */
export const submitOrder = async (order: {
  name: string;
  phone: string;
  address: string;
  comment: string;
  items: CartItem[];
}): Promise<void> => {
  const text = formatOrderText(order);
  const email = (import.meta.env.VITE_ORDER_EMAIL as string | undefined)?.trim();

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    throw new Error(
      'Не удалось скопировать заказ. Разрешите доступ к буферу обмена или скопируйте список вручную.'
    );
  }

  if (email) {
    const maxBody = 1900;
    const body =
      text.length > maxBody
        ? `${text.slice(0, maxBody)}\n\n… (полный текст уже в буфере обмена)`
        : text;
    const href = `mailto:${email}?subject=${encodeURIComponent(
      'Заказ — каталог томатов'
    )}&body=${encodeURIComponent(body)}`;
    window.location.assign(href);
  }
};
