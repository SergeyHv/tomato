import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Кэш для ускорения работы
let cachedData = null;
let lastFetch = 0;
const CACHE_DURATION = 5 * 60 * 1000; 

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const now = Date.now();
  if (cachedData && (now - lastFetch < CACHE_DURATION)) {
    return res.status(200).json(cachedData);
  }

  try {
    // СИСТЕМНАЯ СИНХРОНИЗАЦИЯ: ищем ключи под обоими возможными именами
    const pEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const pKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY;
    const pSheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEET_ID;

    if (!pKey) {
      throw new Error("Private key not found in environment variables");
    }

    const serviceAccountAuth = new JWT({
      email: pEmail,
      key: pKey.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(pSheetId, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const products = rows.map(row => {
      // Собираем все данные из колонок, включая новые
      const rowData = {
        id: row.get('id'),
        title: row.get('title'),
        price: parseFloat(String(row.get('price')).replace(',', '.').replace(/[^0-9.]/g, '')) || 0,
        images: row.get('images') ? row.get('images').split(',').map(s => s.trim()) : [],
        category: row.get('category'),
        tags: row.get('tags') ? row.get('tags').split(',').map(s => s.trim()) : [],
        description: row.get('description'),
        stock: String(row.get('stock')).toUpperCase() === 'TRUE',
        // Добавляем новые поля напрямую, если они есть в таблице как отдельные колонки
        color: row.get('color') || '',
        growth_type: row.get('growth_type') || '',
        shape: row.get('shape') || '',
        maturity: row.get('maturity') || '',
        status: row.get('status') || 'active',
        // Оставляем парсинг props для обратной совместимости
        props: parseProps(row.get('props')),
      };
      return rowData;
    });

    cachedData = products;
    lastFetch = now;
    res.status(200).json(products);

  } catch (error) {
    console.error("Spreadsheet Error:", error);
    res.status(500).json({ error: "Ошибка чтения таблицы", details: error.message });
  }
}

function parseProps(str) {
  if (!str) return {};
  const obj = {};
  str.split(';').forEach(pair => {
    const [k, v] = pair.split('=');
    if (k && v) obj[k.trim()] = v.trim();
  });
  return obj;
}
