(function () {
  console.log("🍅 Tomato Admin загружен");

  const SECRET = 'khvalla74';
  const ACCESS_KEY = 'tomato_admin_access';
  let allProducts = [];
  let editId = null;

  /* ---------- ПРОСТАЯ ЗАЩИТА ---------- */
  if (!sessionStorage.getItem(ACCESS_KEY)) {
    const pass = prompt('🔐 Введите ключ доступа');
    if (pass !== SECRET) {
      document.body.innerHTML = '<h1 style="padding:50px">🔒 Доступ запрещён</h1>';
      throw new Error('Access denied');
    }
    sessionStorage.setItem(ACCESS_KEY, '1');
  }

  /* ---------- SLUG (ID) ---------- */
  const slug = (t) =>
    t.toLowerCase()
      .replace(/ё/g, 'е')
      .replace(/[^a-zа-я0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  /* ---------- ЗАГРУЗКА ТАБЛИЦЫ ---------- */
  async function loadProducts() {
    const res = await fetch('/api/admin/get-products');
    allProducts = await res.json();
    renderList(allProducts);
  }

  /* ---------- СПИСОК СОРТОВ ---------- */
  function renderList(list) {
    const box = document.getElementById('productList');
    box.innerHTML = list.map(p => `
      <div class="p-3 bg-white rounded-xl shadow flex justify-between items-center">
        <span class="truncate">${p.title}</span>
        <button onclick="editProduct('${p.id}')" title="Редактировать">✏️</button>
      </div>
    `).join('');
  }

  /* ---------- РЕДАКТИРОВАНИЕ ---------- */
  window.editProduct = (id) => {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    editId = p.id;

    title.value = p.title;
    price.value = p.price;
    category.value = p.category;
    tags.value = p.tags;
    description.value = p.description;

    const map = {};
    (p.props || '').split(';').forEach(i => {
      const [k, v] = i.split('=');
      if (k) map[k] = v;
    });

    prop_term.value = map['Срок'] || '';
    prop_height.value = map['Высота'] || '';
    prop_weight.value = map['Вес'] || '';

    document.getElementById('formTitle').innerText = '✏️ Редактирование сорта';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---------- СОХРАНЕНИЕ ---------- */
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳ Сохранение...';

    let imageUrl = '';

    const file = imageUpload.files[0];
    if (file) {
      const up = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-filename': encodeURIComponent(file.name) },
        body: file
      });
      const r = await up.json();
      imageUrl = r.url;
    } else if (editId) {
      imageUrl = allProducts.find(p => p.id === editId)?.images || '';
    }

    const props =
      `Срок=${prop_term.value};` +
      `Высота=${prop_height.value};` +
      `Вес=${prop_weight.value}`;

    await fetch('/api/admin/add-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: SECRET,
        id: editId || slug(title.value),
        title: title.value,
        price: price.value,
        images: imageUrl,
        category: category.value,
        tags: tags.value,
        description: description.value,
        stock: "TRUE",
        props
      })
    });

    alert('✅ Сохранено!');
    productForm.reset();
    editId = null;
    document.getElementById('formTitle').innerText = '➕ Новый сорт';
    submitBtn.disabled = false;
    submitBtn.innerText = '🚀 Сохранить';
    loadProducts();
  });

  /* ---------- ПОИСК ---------- */
  searchInput.addEventListener('input', e => {
    const t = e.target.value.toLowerCase();
    renderList(allProducts.filter(p => p.title.toLowerCase().includes(t)));
  });

  loadProducts();
})();
