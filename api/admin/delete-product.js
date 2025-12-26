import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, id } = req.body;
  if (password !== 'khvalla74') return res.status(403).end();

  const auth = new JWT({
    email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID, auth);
  await doc.loadInfo();

  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const row = rows.find(r => r.get('id') === id);
  if (!row) return res.status(404).json({ error: 'Not found' });

  await row.delete();
  res.json({ success: true });
}
