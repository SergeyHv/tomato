import { CartItem } from '../types';

/**
 * Безопасная отправка заказа на серверный API.
 * Никаких токенов и ключей в браузере!
 */
export const submitOrder = async (
  items: CartItem[],
  formData: {
    name: string;
    phone: string;
    address: string;
    comment?: string;
  }
) => {
  const response = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, formData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Ошибка при отправке заказа');
  }

  return response.json(); // { success: true }
};
