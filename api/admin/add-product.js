import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  // Парсим входящие данные
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  
  const { blobs } = await list();
  const dbBlob = blobs.find(b => b.pathname === 'database.json');
  
  let products = [];
  if (dbBlob) {
    const response = await fetch(dbBlob.url);
    products = await response.json();
  }

  products.push({ ...body, id: Date.now() });

  await put('database.json', JSON.stringify(products), {
    access: 'public',
    addRandomSuffix: false
  });

  res.status(200).json({ success: true });
}
