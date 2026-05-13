import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const TELEGRAM_CHAT_ID_2 = process.env.TELEGRAM_CHAT_ID_2 || ''; // дополнительный получатель
const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, formData } = req.body;

    const itemsText = items
      .map((item: any) => `${item.tomato.name} — ${item.quantity} шт.`)
      .join('\n');
    const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

    const message = `
🛒 НОВЫЙ ЗАКАЗ ТОМАТОВ

👤 Клиент: ${formData.name}
📞 Телефон: ${formData.phone}
📍 Адрес: ${formData.address}
📝 Комментарий: ${formData.comment || 'нет'}

📦 Состав:
${itemsText}

📊 Итого: ${totalItems} шт.
    `.trim();

    // Функция отправки в Telegram по chat_id
    const sendToTelegram = async (chatId: string) => {
      if (!TELEGRAM_BOT_TOKEN || !chatId) return;
      await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
          }),
        }
      );
    };

    // Отправляем основному получателю
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      await sendToTelegram(TELEGRAM_CHAT_ID);
    }

    // Отправляем дополнительному получателю, если он задан
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID_2) {
      await sendToTelegram(TELEGRAM_CHAT_ID_2);
    }

    // Email (без изменений)
    if (GMAIL_USER && GMAIL_APP_PASSWORD && NOTIFICATION_EMAIL) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: GMAIL_USER,
          pass: GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: GMAIL_USER,
        to: NOTIFICATION_EMAIL,
        subject: 'Новый заказ томатов',
        text: message,
        html: `<pre>${message}</pre>`,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Ошибка при отправке заказа:', error);
    return res.status(500).json({ error: 'Ошибка отправки заказа' });
  }
}
