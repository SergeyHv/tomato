import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { password, product } = req.body;

  // 1. ПРОВЕРКА ПАРОЛЯ
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Неверный пароль' });
  }

  try {
    // Используем ТЕ ЖЕ имена, что и в api/products.js
    const pKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY; 
    const pEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
    const pSheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

    if (!pKey) {
      return res.status(500).json({ error: "Ошибка настроек: GOOGLE_SHEETS_PRIVATE_KEY не найден" });
    }

    const serviceAccountAuth = new JWT({
      email: pEmail,
      key: pKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(pSheetId, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    
    await sheet.loadHeaderRow();
    const rows = await sheet.getRows();

    const productId = String(product.id).trim();
    const existingRow = rows.find(r => String(r.get('id')).trim() === productId);

    if (existingRow) {
      // ОБНОВЛЕНИЕ
      sheet.headerValues.forEach(h => {
        if (product[h] !== undefined) {
          // Если это массив (например, картинки), превращаем в строку для таблицы
          const value = Array.isArray(product[h]) ? product[h].join(', ') : product[h];
          existingRow.set(h, value);
        }
      });
      await existingRow.save();
      return res.status(200).json({ message: 'Updated' });
    } else {
      // СОЗДАНИЕ
      const newRow = {};
      sheet.headerValues.forEach(h => {
        const val = product[h];
        newRow[h] = Array.isArray(val) ? val.join(', ') : (val || '');
      });
      await sheet.addRow(newRow);
      return res.status(200).json({ message: 'Added' });
    }
  } catch (error) {
    return res.status(500).json({ error: "Ошибка таблицы: " + error.message });
  }
}
