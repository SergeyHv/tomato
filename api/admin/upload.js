import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // Проверяем, что это POST запрос
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешен' });
  }

  try {
    // Получаем имя файла из параметров строки (например, ?filename=tomato.jpg)
    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const filename = searchParams.get('filename');

    if (!filename) {
      return res.status(400).json({ error: 'Не указано имя файла' });
    }

    // Читаем файл прямо из тела запроса (body) и отправляем в Vercel Blob
    // Токен BLOB_READ_WRITE_TOKEN берется автоматически из переменных окружения Vercel
    const blob = await put(filename, req, {
      access: 'public',
    });

    // Возвращаем данные о загруженном файле (там будет и ссылка на фото)
    return res.status(200).json(blob);
  } catch (error) {
    console.error('Ошибка загрузки в Blob:', error);
    return res.status(500).json({ error: 'Ошибка сервера при загрузке фото' });
  }
}

// Отключаем стандартный парсер тела запроса, чтобы передать файл "как есть" (стримом)
export const config = {
  api: {
    bodyParser: false,
  },
};
