// api/send-order.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, address, comment, items } = req.body;

  // Формируем сообщение для Telegram / email
  const orderText = `
🛒 *Новый заказ томатов*

👤 *Клиент:* ${name}
📞 *Телефон:* ${phone}
📍 *Адрес:* ${address}
📝 *Комментарий:* ${comment || 'нет'}

📦 *Состав заказа:*
${items.map((item, idx) => `${idx+1}. ${item.tomato.name} — ${item.quantity} шт.`).join('\n')}

📊 *Итого сортов:* ${items.length}
  `;

  // Отправка в Telegram (замените токен и chat_id)
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  let telegramOk = false;
  if (telegramToken && chatId) {
    const tgUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const tgRes = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: orderText,
        parse_mode: 'Markdown',
      }),
    });
    if (tgRes.ok) telegramOk = true;
  }

  // Отправка на email (через nodemailer или просто через API, но проще через Telegram, email сложнее)
  // Для email потребуется SMTP-сервер или сервис вроде Resend. Пока реализуем только Telegram.

  if (telegramOk) {
    res.status(200).json({ success: true, message: 'Заказ отправлен в Telegram' });
  } else {
    // Запасной вариант – сохранить заказ в лог или отправить на почту через другой сервис
    console.error('Не удалось отправить в Telegram, токен не настроен');
    res.status(500).json({ error: 'Ошибка отправки заказа' });
  }
}
