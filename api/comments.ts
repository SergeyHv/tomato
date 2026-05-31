import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Те же переменные, что в api/order.ts
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || '';
const GOOGLE_PRIVATE_KEY = (process.env.GOOGLE_SHEETS_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const tomatoId = req.query.id as string;
    if (!tomatoId) return res.status(400).json({ error: 'Не указан id сорта' });

    try {
      if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
        return res.status(500).json({ error: 'Не все переменные окружения заданы' });
      }

      const jwt = new JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: GOOGLE_PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
      await doc.loadInfo();
      const sheet = doc.sheetsByTitle['Комментарии'];
      if (!sheet) {
        return res.json({ comments: [] });
      }

      const rows = await sheet.getRows();
      const comments = rows
        .filter(row => row.get('id сорта') === tomatoId)
        .map(row => ({
          author: row.get('автор'),
          text: row.get('текст'),
          date: row.get('дата'),
        }));

      return res.json({ comments });
    } catch (error: any) {
      return res.status(500).json({ error: 'Ошибка получения комментариев', details: error.message });
    }
  }

  if (req.method === 'POST') {
    const { tomatoId, author, text } = req.body;
    if (!tomatoId || !author || !text) return res.status(400).json({ error: 'Не все поля заполнены' });

    try {
      if (!GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
        return res.status(500).json({ error: 'Не все переменные окружения заданы' });
      }

      const jwt = new JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: GOOGLE_PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
      await doc.loadInfo();
      const sheet = doc.sheetsByTitle['Комментарии'];
      if (!sheet) return res.status(500).json({ error: 'Лист "Комментарии" не найден' });

      await sheet.addRow({
        'id сорта': tomatoId,
        'автор': author,
        'текст': text,
        'дата': new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }),
      });

      return res.json({ success: true });
    } catch (error: any) {
      return res.status(500).json({ error: 'Ошибка добавления комментария', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Метод не поддерживается' });
}
