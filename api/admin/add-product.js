import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, id, title, category, images } = req.body;

  // Проверка пароля (берем из окружения или хардкод для теста)
  const adminPass = process.env.ADMIN_PASSWORD || 'khvalla74';
  if (password !== adminPass) {
    return res.status(403).json({ error: 'Неверный пароль' });
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

    // Ищем, существует ли уже такой ID (для редактирования)
    const existingRow = rows.find(r => r.get('id') === String(id));

    if (existingRow) {
      // ОБНОВЛЕНИЕ
      existingRow.set('title', title);
      existingRow.set('category', category);
      existingRow.set('images', images);
      await existingRow.save();
    } else {
      // ДОБАВЛЕНИЕ НОВОГО
      await sheet.addRow({
        id: String(id),
        title,
        category,
        images,
        date: new Date().toISOString()
      });
    }

    // Отключаем кэш, чтобы клиент сразу мог стянуть свежие данные
    res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error('Ошибка записи в таблицу:', error);
    return res.status(500).json({ error: error.message });
  }
}
