import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, product } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Неверный пароль' });
  }

  try {
    // ПРОВЕРКА НАЛИЧИЯ КЛЮЧЕЙ
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

    if (!privateKey || !clientEmail) {
      throw new Error("Отсутствуют настройки Google API (ключ или email) в Vercel Environment Variables");
    }

    const serviceAccountAuth = new JWT({
      email: clientEmail,
      key: privateKey.replace(/\\n/g, '\n'), // Теперь тут не упадет
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    // Дальше ваш код поиска и сохранения...
    const existingRow = rows.find(r => r.get('id') === product.id);

    const rowData = {
      id: product.id,
      title: product.title || '',
      price: product.price || '',
      images: product.images || '',
      category: product.category || '',
      description: product.description || '',
      stock: product.stock || 'TRUE',
      color: product.color || '',
      growth_type: product.growth_type || '',
      shape: product.shape || '',
      maturity: product.maturity || '',
      status: product.status || 'active'
    };

    if (existingRow) {
      Object.assign(existingRow, rowData);
      await existingRow.save();
      return res.status(200).json({ message: 'Updated' });
    } else {
      await sheet.addRow(rowData);
      return res.status(200).json({ message: 'Added' });
    }

  } catch (error) {
    console.error('SERVER ERROR:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
