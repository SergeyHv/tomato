import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
  const { id } = req.query;
  const { blobs } = await list();
  const dbBlob = blobs.find(b => b.pathname === 'database.json');
  
  if (dbBlob) {
    const response = await fetch(dbBlob.url);
    let products = await response.json();
    products = products.filter(p => p.id !== parseInt(id));
    
    await put('database.json', JSON.stringify(products), {
      access: 'public',
      addRandomSuffix: false
    });
  }
  res.status(200).json({ success: true });
}
