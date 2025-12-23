import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, product } = req.body;

  try {
    const pKey = process.env.GOOGLE_PRIVATE_KEY;
    const pEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const pSheetId = process.env.GOOGLE_SHEET_ID;

    // ПРОВЕРКА: Если хотя бы одной переменной нет, мы не вызываем .replace(), а выдаем текст
    if (!pKey || !pEmail || !pSheetId) {
      let missing = [];
      if (!pKey) missing.push("GOOGLE_PRIVATE_KEY");
      if (!pEmail) missing.push("GOOGLE_SERVICE_ACCOUNT_EMAIL");
      if (!pSheetId) missing.push("GOOGLE_SHEET_ID");
      return res.status(500).json({ error: `В Vercel не найдены: ${missing.join(', ')}` });
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
    const existingRow = rows.find(r => String(r.get('id')) === String(product.id));

    if (existingRow) {
      sheet.headerValues.forEach(h => {
        if (product[h] !== undefined) existingRow.set(h, product[h]);
      });
      await existingRow.save();
      return res.status(200).json({ message: 'Updated' });
    } else {
      const newRow = {};
      sheet.headerValues.forEach(h => { newRow[h] = product[h] || ''; });
      await sheet.addRow(newRow);
      return res.status(200).json({ message: 'Added' });
    }
  } catch (error) {
    return res.status(500).json({ error: "Ошибка: " + error.message });
  }
}
