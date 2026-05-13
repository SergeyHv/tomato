import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

// === НАСТРОЙКИ ТЕЛЕГРАМ ===
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// === НАСТРОЙКИ GMAIL ===
const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, formData } = req.body;
    const itemsText = items.map((item: any) => `${item.tomato.name} — ${item.quantity} шт.`).join('\n');
    const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

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

    // 1. Отправка в Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: tgMessage, parse_mode: 'HTML' })
      });
    }

    // 2. Отправка на Gmail
    if (GMAIL_USER && GMAIL_APP_PASSWORD && NOTIFICATION_EMAIL) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      });
      await transporter.sendMail({
        from: GMAIL_USER,
        to: NOTIFICATION_EMAIL,
        subject: 'Новый заказ томатов',
        text: tgMessage,
        html: `<pre>${tgMessage}</pre>`,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Ошибка отправки заказа' });
  }
}
