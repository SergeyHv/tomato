import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Обязательно для передачи файлов
  },
};

export default async function handler(req, res) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Получаем имя файла из параметров запроса
    const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
    const filename = searchParams.get('filename') || 'image.jpg';

    // Загружаем напрямую в Blob, передавая сам запрос (req) как тело файла
    const blob = await put(filename, req, {
      access: 'public',
    });

    return res.status(200).json(blob);
  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({ 
      error: 'Ошибка при сохранении фото в хранилище',
      message: error.message 
    });
  }
}
