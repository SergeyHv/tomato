import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, product } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Неверный пароль' });
  }

  try {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    
    // ОЧИСТКА КЛЮЧА: убираем возможные лишние кавычки и исправляем переносы строк
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
    }
    const formattedKey = privateKey.replace(/\\n/g, '\n');

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    
    // Загружаем заголовки, чтобы точно знать, куда писать
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;

    const rows = await sheet.getRows();
    // Ищем строку по ID (приводим оба к строке для надежности)
    const existingRow = rows.find(r => String(r.get('id')) === String(product.id));

    if (existingRow) {
      // ОБНОВЛЕНИЕ
      headers.forEach(h => {
        if (product[h] !== undefined) {
          existingRow.set(h, product[h]);
        }
      });
      await existingRow.save();
      return res.status(200).json({ message: 'Updated' });
    } else {
      // СОЗДАНИЕ
      // Формируем объект только из тех полей, которые есть в таблице
      const newRow = {};
      headers.forEach(h => {
        newRow[h] = product[h] || '';
      });
      await sheet.addRow(newRow);
      return res.status(200).json({ message: 'Added' });
    }
  } catch (error) {
    console.error('SERVER_ERROR:', error);
    // Отправляем подробности ошибки на фронтенд
    return res.status(500).json({ error: error.message });
  }
}
