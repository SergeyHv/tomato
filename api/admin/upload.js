import { put } from '@vercel/blob';

export default async function handler(req, res) {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) return res.status(401).end();

  try {
    const filename = req.headers['x-filename'] || 'tomato.jpg';
    const blob = await put(`images/${filename}`, req, {
      access: 'public',
      contentType: req.headers['content-type']
    });
    res.status(200).json(blob);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
