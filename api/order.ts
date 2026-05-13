import type { VercelRequest, VercelResponse } from '@vercel/node';
import nodemailer from 'nodemailer';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// === Переменные окружения ===
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const TELEGRAM_CHAT_ID_2 = process.env.TELEGRAM_CHAT_ID_2 || '';
const GMAIL_USER = process.env.GMAIL_USER || '';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';

// Для Google Sheets
const GOOGLE_SHEETS_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const GOOGLE_SHEETS_PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
// !!! НОВОЕ: Имя листа для журнала заказов
const GOOGLE_SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Заказы'; // Название листа, куда пишем заказы

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

    // --- 1. Telegram ---
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

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      await sendToTelegram(TELEGRAM_CHAT_ID);
    }
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID_2) {
      await sendToTelegram(TELEGRAM_CHAT_ID_2);
    }

    // --- 2. Email ---
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

    // --- 3. Google Sheets (журнал) ---
    if (GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY && GOOGLE_SHEET_ID) {
      try {
        const jwt = new JWT({
          email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
          key: GOOGLE_PRIVATE_KEY,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
        await doc.loadInfo(); // загружаем свойства таблицы

        // Используем лист по названию, а не по индексу
        const sheet = doc.sheetsByTitle[GOOGLE_SHEET_NAME];

        if (!sheet) {
          console.error(`❌ Лист с названием "${GOOGLE_SHEET_NAME}" не найден в таблице.`);
          throw new Error(`Лист "${GOOGLE_SHEET_NAME}" не найден`);
        }

        // Добавляем строку с данными заказа
        await sheet.addRow({
          Дата: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
          Имя: formData.name,
          Телефон: formData.phone,
          Адрес: formData.address,
          Комментарий: formData.comment || '',
          Состав: itemsText,
          Количество: totalItems,
          Статус: 'Новый', // Начальный статус заказа
        });

        console.log('✅ Заказ записан в Google Sheets на лист:', GOOGLE_SHEET_NAME);
      } catch (sheetError: any) {
        console.error('❌ Ошибка записи в Google Sheets:', sheetError.message);
        // Не прерываем выполнение, заказ всё равно отправлен в Telegram/Email
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Ошибка при отправке заказа:', error);
    return res.status(500).json({ error: 'Ошибка отправки заказа' });
  }
}
