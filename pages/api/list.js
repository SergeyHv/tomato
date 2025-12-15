import { google } from 'googleapis';

// Вспомогательная функция для получения аутентифицированного клиента
async function getSheetsClient() {
  // Проверяем, есть ли учетные данные
  if (!process.env.GSHEET_API_KEY) {
    throw new Error('GSHEET_API_KEY не найден в переменных окружения');
  }
  if (!process.env.GSHEET_ID) {
    throw new Error('GSHEET_ID не найден в переменных окружения');
  }

  const credentials = JSON.parse(process.env.GSHEET_API_KEY);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Вспомогательная функция для формирования URL фото
// Пока используем jsDelivr, но легко можно переключить
function photoUrl(filename, size = 'full') {
  if (!filename) return '';
  // Опционально: обработка разных размеров, если нужно заранее
  // Но для простоты сейчас просто возвращаем URL к файлу
  const baseUrl = 'https://cdn.jsdelivr.net/gh/SergeyHv/tomato@main/images/';
  return `${baseUrl}${encodeURIComponent(filename)}`;
}

export default async function handler(req, res) {
  // CORS для GitHub Pages
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://sergeyhv.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sheets = await getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GSHEET_ID,
      range: process.env.GSHEET_SHEET_NAME || 'Sheet1',
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return res.status(200).json({ items: [] });
    }

    // Предположим, первая строка — заголовки
    const headers = rows[0];
    const items = rows.slice(1).map(row => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index] ? row[index].trim() : '';
      });
      // Формируем полный URL для mainphoto, если поле есть
      if (item.mainphoto) {
        item.mainphoto_url = photoUrl(item.mainphoto);
      }
      // TODO: Обработать gallery_photos аналогично, если нужно
      return item;
    });

    res.status(200).json({ items });
  } catch (error) {
    console.error('API /list error:', error);
    res.status(500).json({ error: 'Failed to fetch data from Google Sheets' });
  }
}

// Отключаем встроенный парсер body, так как мы не принимаем POST данные в /list
export const config = {
  api: {
    bodyParser: false,
  },
};
