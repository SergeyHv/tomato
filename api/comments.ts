import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Диагностика переменных
  const envStatus = {
    GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'задан' : 'ОТСУТСТВУЕТ',
    GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ? 'задан' : 'ОТСУТСТВУЕТ',
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ? 'задан' : 'ОТСУТСТВУЕТ',
  };

  if (req.method === 'GET') {
    const tomatoId = req.query.id as string;
    if (!tomatoId) return res.status(400).json({ error: 'Не указан id сорта' });

    try {
      const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
      const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
      const sheetId = process.env.GOOGLE_SHEET_ID || '';

      if (!email || !key || !sheetId) {
        return res.status(500).json({ error: 'Не все переменные окружения заданы', envStatus });
      }

      const jwt = new JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(sheetId, jwt);
      await doc.loadInfo();
      const sheet = doc.sheetsByTitle['Комментарии'];
      if (!sheet) {
        return res.json({ comments: [], debug: 'Лист Комментарии не найден. Доступные листы: ' + Object.keys(doc.sheetsByTitle).join(', ') });
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
      return res.status(500).json({ error: 'Ошибка получения комментариев', details: error.message, envStatus });
    }
  }

  if (req.method === 'POST') {
    const { tomatoId, author, text } = req.body;
    if (!tomatoId || !author || !text) return res.status(400).json({ error: 'Не все поля заполнены' });

    try {
      const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
      const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
      const sheetId = process.env.GOOGLE_SHEET_ID || '';

      if (!email || !key || !sheetId) {
        return res.status(500).json({ error: 'Не все переменные окружения заданы' });
      }

      const jwt = new JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const doc = new GoogleSpreadsheet(sheetId, jwt);
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
