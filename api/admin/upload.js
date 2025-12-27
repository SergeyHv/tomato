import { put } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const { filename, base64 } = req.body;

    if (!base64) {
      return res.status(400).json({ error: 'No file data' });
    }

    const buffer = Buffer.from(
      base64.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );

    const blob = await put(
      `products/${Date.now()}-${filename}`,
      buffer,
      { access: 'public' }
    );

    return res.status(200).json({ url: blob.url });

  } catch (e) {
    console.error('UPLOAD ERROR:', e);
    return res.status(500).json({ error: e.message });
  }
}
