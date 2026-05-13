import { CartItem } from '../types';
import nodemailer from 'nodemailer';

// === НАСТРОЙКИ ТЕЛЕГРАМ ===
const TELEGRAM_BOT_TOKEN = 'ВАШ_ТОКЕН_БОТА';
const TELEGRAM_CHAT_ID = 'ВАШ_CHAT_ID';

// === НАСТРОЙКИ GMAIL ===
const GMAIL_USER = 'ваш_адрес@gmail.com';
const GMAIL_APP_PASSWORD = 'ваш_16-значный_пароль_приложения';
const NOTIFICATION_EMAIL = 'куда_отправлять@example.com'; // может быть тот же адрес

export const submitOrder = async (items: CartItem[], formData: { name: string; phone: string; address: string; comment?: string }) => {
  const itemsText = items.map(item => `${item.tomato.name} — ${item.quantity} шт.`).join('\n');
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // 1. Отправка в Telegram
  const tgMessage = `
🛒 НОВЫЙ ЗАКАЗ ТОМАТОВ

👤 Клиент: ${formData.name}
📞 Телефон: ${formData.phone}
📍 Адрес: ${formData.address}
📝 Комментарий: ${formData.comment || 'нет'}

📦 Состав:
${itemsText}

📊 Итого: ${totalItems} шт.
  `;

  if (TELEGRAM_BOT_TOKEN !== 'ВАШ_ТОКЕН_БОТА') {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: tgMessage, parse_mode: 'HTML' })
      });
      console.log('✅ Заказ отправлен в Telegram');
    } catch (e) { console.error('Telegram error:', e); }
  }

  // 2. Отправка на Gmail через SMTP
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: GMAIL_USER,
    to: NOTIFICATION_EMAIL,
    subject: 'Новый заказ томатов',
    text: tgMessage,
    html: `<pre>${tgMessage}</pre>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Заказ отправлен на Gmail');
  } catch (error) {
    console.error('❌ Ошибка отправки Gmail:', error);
    throw new Error('Не удалось отправить заказ на почту');
  }

  return { success: true };
};
