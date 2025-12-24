import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не разрешен' });

  // 1. Получаем данные напрямую из req.body (без вложенного объекта product)
  const { password, title, category, price, description, tags, images } = req.body;

  // 2. Проверка пароля
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Неверный пароль администратора' });
  }

  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    // 3. Добавляем строку. Названия ключей (слева) должны СОВПАДАТЬ с заголовками в Google Таблице
    await sheet.addRow({
      id: Date.now().toString(), // Генерируем ID, если фронтенд его не прислал
      title: title,
      price: price || "1.5",
      images: images || "",
      category: category,
      tags: tags || "",
      description: description || "",
      stock: "TRUE"
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Ошибка API:", error);
    return res.status(500).json({ details: error.message });
  }
}
