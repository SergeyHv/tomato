import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, product } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Неверный пароль в Vercel Environment Variables' });
  }

  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    
    // Проверка: видит ли скрипт колонки?
    await sheet.loadHeaderRow();
    const headers = sheet.headerValues;
    console.log('Доступные колонки:', headers);

    const rows = await sheet.getRows();
    const existingRow = rows.find(r => String(r.get('id')) === String(product.id));

    if (existingRow) {
      // Пытаемся обновить только те поля, которые точно есть в таблице
      const updateData = {};
      const allowedFields = ['title', 'price', 'images', 'category', 'description', 'color', 'growth_type', 'shape', 'maturity', 'status', 'stock'];
      
      allowedFields.forEach(field => {
        if (headers.includes(field)) {
          existingRow.set(field, product[field] || '');
        }
      });

      await existingRow.save();
      return res.status(200).json({ message: 'Обновлено' });
    } else {
      // Для нового товара создаем объект только из тех ключей, что есть в шапке
      const newRow = {};
      headers.forEach(h => {
        newRow[h] = product[h] || '';
      });
      await sheet.addRow(newRow);
      return res.status(200).json({ message: 'Добавлено' });
    }
  } catch (error) {
    console.error('ПОЛНАЯ ОШИБКА:', error.message);
    return res.status(500).json({ error: "Ошибка таблицы: " + error.message });
  }
}
