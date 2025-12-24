// ВАЖНО: Установите библиотеку: npm install cloudinary
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const config = {
  api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    const fileStr = req.body.file; // Если отправляете base64, или используйте formidable для FormData
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: 'tomato_presets',
    });
    res.status(200).json({ url: uploadResponse.secure_url });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка загрузки фото' });
  }
}
