import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

/* ===== BASIC AUTH ===== */
function checkAuth(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Basic ')) return false;

  const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
  const [user, pass] = decoded.split(':');

  return (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASSWORD
  );
}

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).end('Unauthorized');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const {
    id,
    title,
    price,
    images,
    category,
    tags,
    description,
    stock,
    props
  } = req.body;

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
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const existingRow = rows.find(r => r.get('id') === id);

    const baseData = {
      id,
      title,
      price: price || '',
      category: category || '',
      tags: tags || '',
      description: description || '',
      stock: stock || 'TRUE',
      props: props || ''
    };

    if (existingRow) {
      // обновляем существующую строку
      Object.assign(existingRow, baseData);

      // images обновляем ТОЛЬКО если пришёл новый URL
      if (images && images.trim() !== '') {
        existingRow.images = images;
      }

      await existingRow.save();
      return res.status(200).json({ success: true, mode: 'updated' });
    }

    // добавляем новый сорт
    await sheet.addRow({
      ...baseData,
      images: images || ''
    });

    return res.status(200).json({ success: true, mode: 'added' });

  } catch (err) {
    console.error('ADD PRODUCT ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}
