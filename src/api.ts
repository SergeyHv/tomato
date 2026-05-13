import { CartItem } from '../types';
import emailjs from '@emailjs/browser';

// Настройки EmailJS (зарегистрируйтесь на emailjs.com)
const EMAILJS_SERVICE_ID = 'service_xxx';
const EMAILJS_TEMPLATE_ID = 'template_xxx';
const EMAILJS_PUBLIC_KEY = 'your_public_key';
const NOTIFICATION_EMAIL = 'your_email@example.com';

export const submitOrder = async (items: CartItem[], formData: { name: string; phone: string; address: string; comment?: string }) => {
  const itemsText = items.map(item => `${item.tomato.name} — ${item.quantity} шт.`).join('\n');
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Telegram (без изменений)
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: `...`, parse_mode: 'HTML' })
    });
  }

  // Email через EmailJS
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

  return { success: true };
};
