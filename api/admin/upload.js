import { put } from '@vercel/blob';

/* ===== BASIC AUTH ===== */
function checkAuth(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Basic ')) return false;

  const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
  const [user, pass] = decoded.split(':');

  return (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASSWORD
  );
}

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin"');
    return res.status(401).end('Unauthorized');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const filename =
      decodeURIComponent(req.headers['x-filename'] || 'image.jpg');

    const blob = await put(filename, req, {
      access: 'public'
    });

    return res.status(200).json({ url: blob.url });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
