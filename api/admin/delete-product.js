import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) return res.status(401).end();

  const { id } = req.query;
  const { blobs } = await list();
  const db = blobs.find(b => b.pathname === 'products.json');
  
  if (db) {
    const response = await fetch(db.url);
    let products = await response.json();
    products = products.filter(p => p.id !== id);
    
    await put('products.json', JSON.stringify(products), {
      access: 'public',
      addRandomSuffix: false
    });
  }
  res.status(200).json({ success: true });
}
