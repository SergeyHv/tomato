import { Tomato, CartItem } from '../types';

/**
 * Загружает каталог томатов из статического JSON
 * По Канону: Фронтенд → fetch('/tomatoes_data.json')
 */
export const fetchTomatoes = async (): Promise<Tomato[]> => {
  try {
    const response = await fetch('/tomatoes_data.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`✅ Загружено ${data.length} сортов из JSON`);
    
    return data;
  } catch (error) {
    console.error('❌ Ошибка загрузки каталога:', error);
    throw new Error('Не удалось загрузить каталог томатов');
  }
};

/**
 * Отправка заказа в Telegram (по Канону раздел 6)
 * Frontend → /api/order → Telegram Bot
 */
export const submitOrder = async (order: {
  name: string;
  phone: string;
  address: string;
  comment: string;
  items: CartItem[];
}): Promise<void> => {
  try {
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error(`Order error: ${response.status}`);
    }

    console.log('✅ Заказ отправлен');
  } catch (error) {
    console.error('❌ Ошибка отправки заказа:', error);
    throw new Error('Не удалось оформить заказ');
  }
};
