import { list } from '@vercel/blob';

export default async function handler(req, res) {
  try {
    const { blobs } = await list();
    const dbBlob = blobs.find(b => b.pathname === 'database.json');
    if (!dbBlob) return res.status(200).json([]);
    
    const response = await fetch(dbBlob.url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
