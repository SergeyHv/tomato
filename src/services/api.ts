import { CartItem } from '../types';
import emailjs from '@emailjs/browser';

// === НАСТРОЙКИ ТЕЛЕГРАМ ===
const TELEGRAM_BOT_TOKEN = 'ВАШ_ТОКЕН_БОТА';  // замените
const TELEGRAM_CHAT_ID = 'ВАШ_CHAT_ID';       // замените

// === НАСТРОЙКИ EMAILJS ===
const EMAILJS_SERVICE_ID = 'service_xxxx';    // из EmailJS
const EMAILJS_TEMPLATE_ID = 'template_xxxx';  // из EmailJS
const EMAILJS_PUBLIC_KEY = 'xxxx';            // из EmailJS (Account → Public Key)
const NOTIFICATION_EMAIL = 'ваш_email@example.com'; // куда отправлять

export const submitOrder = async (items: CartItem[], formData: { name: string; phone: string; address: string; comment?: string }) => {
  // Формируем текст заказа
  const itemsText = items.map(item => `${item.tomato.name} — ${item.quantity} шт.`).join('\n');
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const message = `
🛒 НОВЫЙ ЗАКАЗ ТОМАТОВ

👤 Клиент: ${formData.name}
📞 Телефон: ${formData.phone}
📍 Адрес: ${formData.address}
📝 Комментарий: ${formData.comment || 'нет'}

📦 Состав заказа:
${itemsText}

📊 Итого: ${totalItems} шт.
  `;

  // 1. Отправка в Telegram
  if (TELEGRAM_BOT_TOKEN !== 'ВАШ_ТОКЕН_БОТА' && TELEGRAM_CHAT_ID !== 'ВАШ_CHAT_ID') {
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
      await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });
      console.log('✅ Заказ отправлен в Telegram');
    } catch (error) {
      console.error('Ошибка отправки в Telegram:', error);
      throw new Error('Не удалось отправить заказ в Telegram');
    }
  } else {
    console.warn('⚠️ Telegram не настроен. Заказ не отправлен.');
    console.log(message);
  }

  // 2. Отправка на email через EmailJS
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        comment: formData.comment,
        items: itemsText,
        total: totalItems.toString(),
        to_email: NOTIFICATION_EMAIL,
      },
      EMAILJS_PUBLIC_KEY
    );
    console.log('✅ Заказ отправлен на email');
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    throw new Error('Не удалось отправить заказ на email');
  }

  return { success: true };
};
