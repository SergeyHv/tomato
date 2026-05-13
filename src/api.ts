import { CartItem } from '../types';
import nodemailer from 'nodemailer';

// === НАСТРОЙКИ ТЕЛЕГРАМ ===
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// === НАСТРОЙКИ GMAIL ===
const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';

export const submitOrder = async (items: CartItem[], formData: { name: string; phone: string; address: string; comment?: string }) => {
  const itemsText = items.map(item => `${item.tomato.name} — ${item.quantity} шт.`).join('\n');
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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

  // 1. Отправка в Telegram (только если токен и chat_id заданы)
  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: tgMessage, parse_mode: 'HTML' })
      });
      console.log('✅ Заказ отправлен в Telegram');
    } catch (e) {
      console.error('Telegram error:', e);
    }
  } else {
    console.warn('⚠️ Telegram не настроен (токен или chat_id отсутствуют).');
  }

  // 2. Отправка на Gmail через SMTP (только если данные для Gmail заданы)
  if (GMAIL_USER && GMAIL_APP_PASSWORD && NOTIFICATION_EMAIL) {
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
  } else {
    console.warn('⚠️ Gmail не настроен (почта, пароль или получатель отсутствуют).');
    throw new Error('Отправка на почту не настроена');
  }

  return { success: true };
};
