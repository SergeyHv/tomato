import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const filename = req.headers['x-filename'] || 'photo.jpg';
    const blob = await put(`products/${filename}`, req, { access: 'public' });
    return res.status(200).json(blob);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}