import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, id } = req.body;

  // Используем переменную окружения для безопасности, если она есть, иначе сверяем с твоим паролем
  const adminPass = process.env.ADMIN_PASSWORD || 'khvalla74';
  if (password !== adminPass) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID, auth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // Поиск строки по точному совпадению ID
    const rowToDelete = rows.find(row => row.get('id') === String(id));

    if (rowToDelete) {
      await rowToDelete.delete();
      
      // СБРОС КЭША: чтобы админка сразу увидела пустую таблицу
      res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ error: 'Product not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: error.message });
  }
}
