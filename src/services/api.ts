import { Tomato, CartItem } from '../types';

export interface OrderFormData {
  name: string;
  phone: string;
  address: string;
  comment?: string;
}

export const submitOrder = async (items: CartItem[], formData: OrderFormData) => {
  const itemsText = items.map(item => 
    `${item.tomato.name} — ${item.quantity} шт.`
  ).join('\n');

  const message = `
🛒 *Новый заказ томатов*

*Клиент:* ${formData.name}
*Телефон:* ${formData.phone}
*Адрес:* ${formData.address}
${formData.comment ? `*Комментарий:* ${formData.comment}` : ''}

*Состав заказа:*
${itemsText}

*Итого:* ${items.reduce((sum, item) => sum + item.quantity, 0)} шт.
  `;

  console.log('Заказ:', { items, formData, message });
  
  return { success: true, mock: true };
};

export const fetchTomatoes = async (): Promise<Tomato[]> => {
  try {
    const res = await fetch('/tomatoes_data.json');
    if (!res.ok) throw new Error('JSON load error');

    const data = await res.json();

    return data.map((item: any, index: number): Tomato => ({
      id: String(item.id || index + 1),
      name: item.name || 'Без имени',
      originalName: item.originalName || '',
      description: item.description || '',
      fullDescription: item.fullDescription || '',
      color: item.color || 'Red',
      type: item.type || 'Classic',
      growth: item.growth || 'Medium',
      height: item.height || '?',
      weight: item.weight || '?',
      imageUrl: item.imageUrl || '',
      ripening: item.ripening || 'средний',
      environment: item.environment || 'универсал',
    }));
  } catch (err) {
    console.error('JSON fetch error:', err);
    return [];
  }
};
