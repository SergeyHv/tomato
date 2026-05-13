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

// Google Sheets — используем точные имена ваших переменных Vercel
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '';
const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const GOOGLE_SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '';
const GOOGLE_SHEET_NAME = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Заказы'; // если захотите переменную — добавьте

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('=== api/order вызван ===');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, formData } = req.body;
    console.log('Заказ:', { items: items?.length, name: formData.name });

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

    // --- Telegram ---
    const sendToTelegram = async (chatId: string) => {
      if (!TELEGRAM_BOT_TOKEN || !chatId) return;
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
        });
        console.log('✅ Telegram отправлен на', chatId);
      } catch (err: any) {
        console.error('❌ Ошибка Telegram:', err.message);
      }
    };

    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) await sendToTelegram(TELEGRAM_CHAT_ID);
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID_2) await sendToTelegram(TELEGRAM_CHAT_ID_2);

    // --- Email ---
    if (GMAIL_USER && GMAIL_APP_PASSWORD && NOTIFICATION_EMAIL) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
        });
        await transporter.sendMail({
          from: GMAIL_USER,
          to: NOTIFICATION_EMAIL,
          subject: 'Новый заказ томатов',
          text: message,
          html: `<pre>${message}</pre>`,
        });
        console.log('✅ Email отправлен');
      } catch (err: any) {
        console.error('❌ Ошибка Email:', err.message);
      }
    }

    // --- Google Sheets (журнал) ---
    console.log('=== Google Sheets ===');
    console.log('CLIENT_EMAIL:', GOOGLE_CLIENT_EMAIL ? GOOGLE_CLIENT_EMAIL : 'НЕ ЗАДАН');
    console.log('PRIVATE_KEY:', GOOGLE_PRIVATE_KEY ? 'задан (первые 20 символов: ' + GOOGLE_PRIVATE_KEY.substring(0, 20) + '...)' : 'НЕ ЗАДАН');
    console.log('SPREADSHEET_ID:', GOOGLE_SPREADSHEET_ID || 'НЕ ЗАДАН');
    console.log('SHEET_NAME:', GOOGLE_SHEET_NAME);

    if (GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY && GOOGLE_SPREADSHEET_ID) {
      try {
        const jwt = new JWT({
          email: GOOGLE_CLIENT_EMAIL,
          key: GOOGLE_PRIVATE_KEY,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(GOOGLE_SPREADSHEET_ID, jwt);
        await doc.loadInfo();
        console.log('✅ Таблица загружена:', doc.title);

        const sheet = doc.sheetsByTitle[GOOGLE_SHEET_NAME];
        if (!sheet) {
          console.error(`❌ Лист "${GOOGLE_SHEET_NAME}" не найден. Доступные:`, Object.keys(doc.sheetsByTitle));
          throw new Error(`Лист "${GOOGLE_SHEET_NAME}" не найден`);
        }

        await sheet.addRow({
          Дата: new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
          Имя: formData.name,
          Телефон: formData.phone,
          Адрес: formData.address,
          Комментарий: formData.comment || '',
          Состав: itemsText,
          Количество: totalItems,
          Статус: 'Новый',
        });
        console.log('✅ Заказ записан в Google Sheets');
      } catch (sheetError: any) {
        console.error('❌ Ошибка Google Sheets:', sheetError.message);
      }
    } else {
      console.warn('⚠️ Пропущена запись – не все переменные заданы');
    }

    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('Критическая ошибка:', error);
    return res.status(500).json({ error: 'Ошибка отправки заказа', details: error.message });
  }
}
