export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ADMIN_PASSWORD = '123456';

  if (req.body.password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Wrong password' });
  }

  try {
    const token = process.env.GITHUB_TOKEN;

    const owner = 'SergeyHv';
    const repo = 'tomato';
    const path = 'public/tomatoes_data.json';

    // 1. Получаем файл
    const getFile = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    const fileData = await getFile.json();
    const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
    const json = JSON.parse(content);

    // 2. Добавляем новый продукт
    const newProduct = {
      id: Date.now().toString(),
      name: req.body.name,
      description: req.body.description || '',
      color: req.body.color || '',
      type: req.body.type || '',
      weight: req.body.weight || '',
      imageUrl: req.body.imageUrl || '',
      origin: req.body.origin || ''
    };

    json.push(newProduct);

    // 3. Обновляем файл
    const updatedContent = Buffer.from(
      JSON.stringify(json, null, 2)
    ).toString('base64');

    await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          message: 'add new tomato',
          content: updatedContent,
          sha: fileData.sha,
        }),
      }
    );

    return res.status(200).json({ success: true });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
