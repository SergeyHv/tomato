import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(
      process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      auth
    );

    await doc.loadInfo();

    // 🔥 ЯВНО УКАЗЫВАЕМ ЛИСТ
    const sheet = doc.sheetsByTitle['Sheet1'] || doc.sheetsByIndex[0];

    // 🧪 ЖЁСТКАЯ ТЕСТОВАЯ ЗАПИСЬ
    await sheet.addRow({
      id: 'TEST-ID',
      title: 'TEST TITLE',
      price: '123',
      images: 'https://TEST-IMAGE-URL',
      category: 'TEST',
      tags: 'TEST',
      description: 'TEST DESC',
      stock: 'TRUE',
      props: 'TEST'
    });

    return res.status(200).json({ success: true });

  } catch (e) {
    console.error('ADD ERROR:', e);
    return res.status(500).json({ error: e.message });
  }
}
