import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const filename =
      decodeURIComponent(req.headers['x-filename'] || 'image.jpg');

    const blob = await put(
      `products/${Date.now()}-${filename}`,
      req,
      { access: 'public' }
    );

    return res.status(200).json({ url: blob.url });

  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    return res.status(500).json({ error: err.message });
  }
}
