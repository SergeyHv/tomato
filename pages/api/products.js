import { GoogleSpreadsheet } from 'google-spreadsheet';

export default async function handler(req, res) {
  try {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const products = rows.map(r => ({
      id: r.get('id'),
      title: r.get('title'),
      price: Number(r.get('price')),
      images: r.get('images'),
      category: r.get('category'),
      tags: r.get('tags'),
      description: r.get('description'),
      stock: String(r.get('stock')).toLowerCase() === 'true',
      props: r.get('props'),
    }));

    res.status(200).json({ items: products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
