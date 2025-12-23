import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, product } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Неверный пароль' });
  }

  try {
    // СИСТЕМНАЯ ПРОВЕРКА: Пробуем все варианты имен переменных
    const pKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
    const pEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const pSheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;

    if (!pKey) {
      return res.status(500).json({ error: "Ключ GOOGLE_SHEETS_PRIVATE_KEY не найден в настройках Vercel" });
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

    // Синхронизируем поля с таблицей
    const rowData = { ...product };
    
    // Собираем свойства в строку props для совместимости
    const propsParts = [];
    if (product.growth_type) propsParts.push(`growth_type=${product.growth_type}`);
    if (product.shape) propsParts.push(`shape=${product.shape}`);
    if (product.maturity) propsParts.push(`maturity=${product.maturity}`);
    if (product.color) propsParts.push(`color=${product.color}`);
    rowData.props = propsParts.join('; ');

    const productId = String(product.id).trim();
    const existingRow = rows.find(r => String(r.get('id')).trim() === productId);

    if (existingRow) {
      sheet.headerValues.forEach(h => {
        if (rowData[h] !== undefined) {
          const val = Array.isArray(rowData[h]) ? rowData[h].join(', ') : rowData[h];
          existingRow.set(h, val);
        }
      });
      await existingRow.save();
      return res.status(200).json({ message: 'Обновлено' });
    } else {
      await sheet.addRow(rowData);
      return res.status(200).json({ message: 'Добавлено' });
    }
  } catch (error) {
    console.error("ОШИБКА:", error.message);
    return res.status(500).json({ error: "Ошибка таблицы: " + error.message });
  }
}
