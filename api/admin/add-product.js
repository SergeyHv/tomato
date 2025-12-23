import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { password, product } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) return res.status(403).json({ error: 'Неверный пароль' });

  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // Поиск строки по ID
    const existingRow = rows.find(r => String(r.get('id')) === String(product.id));

    if (existingRow) {
        // Обновляем каждое поле точечно
        existingRow.set('title', product.title || '');
        existingRow.set('price', product.price || '');
        existingRow.set('images', product.images || '');
        existingRow.set('description', product.description || '');
        existingRow.set('color', product.color || '');
        existingRow.set('growth_type', product.growth_type || '');
        existingRow.set('shape', product.shape || '');
        existingRow.set('maturity', product.maturity || '');
        existingRow.set('status', product.status || 'active');
        await existingRow.save();
        return res.status(200).json({ message: 'Success Update' });
    } else {
        await sheet.addRow(product);
        return res.status(200).json({ message: 'Success Add' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
