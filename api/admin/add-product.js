import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
  
  const newProduct = req.body; // Ожидаем объект { name, description, ... }
  const { blobs } = await list();
  const dbBlob = blobs.find(b => b.pathname === 'database.json');
  
  let products = [];
  if (dbBlob) {
    const response = await fetch(dbBlob.url);
    products = await response.json();
  }

  products.push({ ...newProduct, id: Date.now() });

  await put('database.json', JSON.stringify(products), {
    access: 'public',
    addRandomSuffix: false
  });

  res.status(200).json({ success: true });
}
